// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'admin_proyectos'
};

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC, DOCX, JPG'));
    }
  }
});

// Crear conexión a la base de datos
async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos MySQL');
    return connection;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

// RUTAS DE AUTENTICACIÓN

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  const { nombre, email, password, telefono, rol = 'Responsable de tarea' } = req.body;
  
  try {
    const connection = await createConnection();
    
    // Verificar si el email ya existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Cifrar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insertar nuevo usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, password, telefono, rol, habilitado, fecha_creacion) VALUES (?, ?, ?, ?, ?, true, NOW())',
      [nombre, email, hashedPassword, telefono, rol]
    );
    
    await connection.end();
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      userId: result.insertId 
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const connection = await createConnection();
    
    // Buscar usuario por email
    const [users] = await connection.execute(
      'SELECT id, nombre, email, password, telefono, rol, habilitado FROM usuarios WHERE email = ?',
      [email]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = users[0];
    
    if (!user.habilitado) {
      return res.status(401).json({ error: 'Usuario deshabilitado' });
    }
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTAS DE USUARIOS

// Obtener todos los usuarios (solo administradores)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [users] = await connection.execute(
      'SELECT id, nombre, email, telefono, rol, habilitado, fecha_creacion FROM usuarios ORDER BY nombre'
    );
    
    await connection.end();
    
    res.json(users);
    
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener usuario por ID
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Verificar que el usuario pueda acceder a esta información
  if (req.user.userId !== parseInt(id) && req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  try {
    const connection = await createConnection();
    
    const [users] = await connection.execute(
      'SELECT id, nombre, email, telefono, rol, habilitado, fecha_creacion FROM usuarios WHERE id = ?',
      [id]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(users[0]);
    
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear usuario (solo administradores)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { nombre, email, password, telefono, rol, habilitado = true } = req.body;
  
  try {
    const connection = await createConnection();
    
    // Verificar si el email ya existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Cifrar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insertar nuevo usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, password, telefono, rol, habilitado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nombre, email, hashedPassword, telefono, rol, habilitado]
    );
    
    await connection.end();
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente', 
      userId: result.insertId 
    });
    
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar usuario
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, rol, habilitado } = req.body;
  
  // Solo el mismo usuario o un administrador puede actualizar
  if (req.user.userId !== parseInt(id) && req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  try {
    const connection = await createConnection();
    
    // Construir query dinámicamente
    let updateFields = [];
    let values = [];
    
    if (nombre) {
      updateFields.push('nombre = ?');
      values.push(nombre);
    }
    if (email) {
      updateFields.push('email = ?');
      values.push(email);
    }
    if (telefono) {
      updateFields.push('telefono = ?');
      values.push(telefono);
    }
    
    // Solo administradores pueden cambiar rol y estado
    if (req.user.rol === 'Administrador') {
      if (rol) {
        updateFields.push('rol = ?');
        values.push(rol);
      }
      if (habilitado !== undefined) {
        updateFields.push('habilitado = ?');
        values.push(habilitado);
      }
    }
    
    if (updateFields.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    values.push(id);
    
    const [result] = await connection.execute(
      `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario actualizado exitosamente' });
    
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar contraseña
app.put('/api/users/:id/password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  // Solo el mismo usuario puede cambiar su contraseña
  if (req.user.userId !== parseInt(id)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  try {
    const connection = await createConnection();
    
    // Obtener contraseña actual
    const [users] = await connection.execute(
      'SELECT password FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!validPassword) {
      await connection.end();
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }
    
    // Cifrar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Actualizar contraseña
    await connection.execute(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedNewPassword, id]
    );
    
    await connection.end();
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
    
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar usuario (solo administradores)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await createConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
    
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario eliminado exitosamente' });
    
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user.userId,
      email: req.user.email,
      rol: req.user.rol
    }
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;