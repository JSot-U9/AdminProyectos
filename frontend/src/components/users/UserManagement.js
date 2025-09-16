// src/components/users/UserManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/apiService';
import UserList from './UserList';
import UserForm from './UserForm';
import UserProfile from './UserProfile';
import ChangePasswordModal from './ChangePasswordModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { 
  FiUsers, 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentView, setCurrentView] = useState('list'); // list, create, edit, profile
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      if (isAdmin()) {
        const usersData = await userService.getAllUsers();
        setUsers(usersData);
      } else {
        // Si no es admin, solo mostrar su propio perfil
        const userData = await userService.getUserById(currentUser.id);
        setUsers([userData]);
        setCurrentView('profile');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.rol === roleFilter;
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && user.habilitado) ||
                         (statusFilter === 'inactive' && !user.habilitado);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Manejar creación de usuario
  const handleCreateUser = async (userData) => {
    try {
      await userService.createUser(userData);
      await loadUsers();
      setCurrentView('list');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Manejar actualización de usuario
  const handleUpdateUser = async (userId, userData) => {
    try {
      await userService.updateUser(userId, userData);
      await loadUsers();
      setCurrentView('list');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Manejar cambio de contraseña
  const handleChangePassword = async (passwordData) => {
    try {
      await userService.changePassword(selectedUser.id, passwordData);
      setShowPasswordModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      await loadUsers();
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Funciones de navegación
  const goToCreate = () => {
    setCurrentView('create');
    setSelectedUser(null);
  };

  const goToEdit = (user) => {
    setSelectedUser(user);
    setCurrentView('edit');
  };

  const goToProfile = (user) => {
    setSelectedUser(user);
    setCurrentView('profile');
  };

  const goToList = () => {
    setCurrentView('list');
    setSelectedUser(null);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isAdmin() ? 'Gestión de Usuarios' : 'Mi Perfil'}
              </h1>
              <p className="text-gray-600">
                {isAdmin() 
                  ? `${filteredUsers.length} usuario${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''}`
                  : 'Administra tu información personal'
                }
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-3">
            {currentView !== 'list' && isAdmin() && (
              <button
                onClick={goToList}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Volver a lista
              </button>
            )}
            
            <button
              onClick={loadUsers}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>

            {isAdmin() && currentView === 'list' && (
              <button
                onClick={goToCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </button>
            )}
          </div>
        </div>

        {/* Filtros de búsqueda - Solo para admins en vista de lista */}
        {isAdmin() && currentView === 'list' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <FiFilter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos los roles</option>
                <option value="Administrador">Administrador</option>
                <option value="Responsable de proyecto">Responsable de proyecto</option>
                <option value="Responsable de tarea">Responsable de tarea</option>
              </select>
            </div>

            <div className="relative">
              <FiFilter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="bg-white shadow rounded-lg">
        {currentView === 'list' && (
          <UserList
            users={filteredUsers}
            currentUser={currentUser}
            isAdmin={isAdmin()}
            onEdit={goToEdit}
            onProfile={goToProfile}
            onChangePassword={openPasswordModal}
            onDelete={openDeleteDialog}
          />
        )}

        {currentView === 'create' && (
          <UserForm
            mode="create"
            onSubmit={handleCreateUser}
            onCancel={goToList}
          />
        )}

        {currentView === 'edit' && selectedUser && (
          <UserForm
            mode="edit"
            user={selectedUser}
            currentUser={currentUser}
            isAdmin={isAdmin()}
            onSubmit={(data) => handleUpdateUser(selectedUser.id, data)}
            onCancel={goToList}
          />
        )}

        {currentView === 'profile' && selectedUser && (
          <UserProfile
            user={selectedUser}
            currentUser={currentUser}
            isAdmin={isAdmin()}
            onEdit={() => goToEdit(selectedUser)}
            onChangePassword={() => openPasswordModal(selectedUser)}
          />
        )}
      </div>

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && selectedUser && (
        <ChangePasswordModal
          user={selectedUser}
          onSubmit={handleChangePassword}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      {showDeleteDialog && selectedUser && (
        <ConfirmDialog
          title="Eliminar Usuario"
          message={`¿Estás seguro de que quieres eliminar al usuario "${selectedUser.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedUser(null);
          }}
          dangerous={true}
        />
      )}
    </div>
  );
};

export default UserManagement;