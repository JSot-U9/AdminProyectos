// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './frontend/src/components/auth/Login';
import Register from './frontend/src/components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import UserManagement from './frontend/src/components/users/UserManagement';
import NotFound from './components/common/NotFound';

// Importar estilos
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Redirección por defecto */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      
                      {/* Dashboard */}
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Gestión de usuarios */}
                      <Route path="/users" element={<UserManagement />} />
                      
                      {/* Ruta para proyectos (futura implementación) */}
                      <Route 
                        path="/projects" 
                        element={
                          <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900">Gestión de Proyectos</h2>
                            <p className="text-gray-600 mt-2">Esta funcionalidad será implementada próximamente.</p>
                          </div>
                        } 
                      />
                      
                      {/* Ruta para tareas (futura implementación) */}
                      <Route 
                        path="/tasks" 
                        element={
                          <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h2>
                            <p className="text-gray-600 mt-2">Esta funcionalidad será implementada próximamente.</p>
                          </div>
                        } 
                      />
                      
                      {/* Ruta para reportes (futura implementación) */}
                      <Route 
                        path="/reports" 
                        element={
                          <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
                            <p className="text-gray-600 mt-2">Esta funcionalidad será implementada próximamente.</p>
                          </div>
                        } 
                      />
                      
                      {/* Página no encontrada */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="text-sm"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;