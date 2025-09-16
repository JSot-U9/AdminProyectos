-- Crear base de datos
CREATE DATABASE IF NOT EXISTS admin_proyectos;
USE admin_proyectos;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('Administrador', 'Responsable de proyecto', 'Responsable de tarea') DEFAULT 'Responsable de tarea',
    habilitado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_habilitado (habilitado)
);

-- Tabla de proyectos (para referencia futura)
CREATE TABLE proyectos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    responsable_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_responsable (responsable_id),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
);

-- Tabla de tareas (para referencia futura)
CREATE TABLE tareas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    proyecto_id INT NOT NULL,
    usuario_asignado_id INT,
    estado ENUM('Pendiente', 'En progreso', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_asignado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_usuario (usuario_asignado_id),
    INDEX idx_estado (estado),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
);

-- Tabla de archivos
CREATE TABLE archivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    tamaño INT NOT NULL,
    proyecto_id INT NULL,
    tarea_id INT NULL,
    usuario_id INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_tarea (tarea_id),
    INDEX idx_usuario (usuario_id)
);

-- Tabla de logs de actividad
CREATE TABLE logs_actividad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    detalles TEXT,
    ip_address VARCHAR(45),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha),
    INDEX idx_accion (accion)
);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, email, password, telefono, rol, habilitado) 
VALUES (
    'Administrador del Sistema', 
    'admin@sistema.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMsteww45r.wO5C', -- password: admin123
    '1234567890', 
    'Administrador', 
    TRUE
);

-- Insertar algunos usuarios de ejemplo
INSERT INTO usuarios (nombre, email, password, telefono, rol, habilitado) VALUES
('Juan Pérez', 'juan@ejemplo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMsteww45r.wO5C', '987654321', 'Responsable de proyecto', TRUE),
('María García', 'maria@ejemplo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMsteww45r.wO5C', '123456789', 'Responsable de tarea', TRUE),
('Carlos López', 'carlos@ejemplo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMsteww45r.wO5C', '456789123', 'Responsable de tarea', TRUE);

-- Crear índices adicionales para optimización
CREATE INDEX idx_usuarios_nombre ON usuarios(nombre);
CREATE INDEX idx_usuarios_fecha_creacion ON usuarios(fecha_creacion);

-- Configuración de zona horaria
SET time_zone = '-05:00'; -- Ajustar según tu zona horaria