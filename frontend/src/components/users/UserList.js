// src/components/users/UserList.js
import React from 'react';
import { 
  FiEdit3, 
  FiTrash2, 
  FiEye, 
  FiKey, 
  FiMail, 
  FiPhone,
  FiUser,
  FiCheck,
  FiX
} from 'react-icons/fi';

const UserList = ({ 
  users, 
  currentUser, 
  isAdmin, 
  onEdit, 
  onProfile, 
  onChangePassword, 
  onDelete 
}) => {
  
  const getRoleBadgeClass = (rol) => {
    switch (rol) {
      case 'Administrador':
        return 'bg-red-100 text-red-800';
      case 'Responsable de proyecto':
        return 'bg-blue-100 text-blue-800';
      case 'Responsable de tarea':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditUser = (user) => {
    return isAdmin || currentUser.id === user.id;
  };

  const canDeleteUser = (user) => {
    return isAdmin && currentUser.id !== user.id;
  };

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <FiUser className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron usuarios que coincidan con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Vista de tabla para pantallas grandes */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombre}
                          {user.id === currentUser.id && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                        {user.email}
                      </div>
                      {user.telefono && (
                        <div className="flex items-center mt-1">
                          <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                          {user.telefono}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.rol)}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.habilitado ? (
                        <>
                          <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-600">Activo</span>
                        </>
                      ) : (
                        <>
                          <FiX className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-600">Inactivo</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.fecha_creacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onProfile(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver perfil"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      
                      {canEditUser(user) && (
                        <button
                          onClick={() => onEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          title="Editar"
                        >
                          <FiEdit3 className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canEditUser(user) && (
                        <button
                          onClick={() => onChangePassword(user)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Cambiar contraseña"
                        >
                          <FiKey className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canDeleteUser(user) && (
                        <button
                          onClick={() => onDelete(user)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de tarjetas para pantallas pequeñas */}
      <div className="md:hidden">
        <div className="space-y-4 p-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {user.nombre}
                      </h3>
                      {user.id === currentUser.id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Tú
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {user.habilitado ? (
                    <FiCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <FiX className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <FiMail className="h-4 w-4 mr-2 text-gray-400" />
                  {user.email}
                </div>
                {user.telefono && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="h-4 w-4 mr-2 text-gray-400" />
                    {user.telefono}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.rol)}`}>
                    {user.rol}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(user.fecha_creacion)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => onProfile(user)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiEye className="h-3 w-3 mr-1" />
                  Ver
                </button>
                
                {canEditUser(user) && (
                  <button
                    onClick={() => onEdit(user)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-indigo-700 bg-white hover:bg-gray-50"
                  >
                    <FiEdit3 className="h-3 w-3 mr-1" />
                    Editar
                  </button>
                )}
                
                {canDeleteUser(user) && (
                  <button
                    onClick={() => onDelete(user)}
                    className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                  >
                    <FiTrash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;