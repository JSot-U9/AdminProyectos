// src/components/users/UserForm.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiSave, FiX } from 'react-icons/fi';

// Schema de validación para crear usuario
const createUserSchema = yup.object().shape({
  nombre: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),
  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres')
    .required('La contraseña es requerida'),
  telefono: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Ingrese un número de teléfono válido')
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .required('El teléfono es requerido'),
  rol: yup
    .string()
    .oneOf(['Administrador', 'Responsable de proyecto', 'Responsable de tarea'], 'Seleccione un rol válido')
    .required('El rol es requerido'),
  habilitado: yup.boolean()
});

// Schema de validación para editar usuario
const editUserSchema = yup.object().shape({
  nombre: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),
  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es requerido'),
  telefono: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Ingrese un número de teléfono válido')
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .required('El teléfono es requerido'),
  rol: yup
    .string()
    .oneOf(['Administrador', 'Responsable de proyecto', 'Responsable de tarea'], 'Seleccione un rol válido')
    .required('El rol es requerido'),
  habilitado: yup.boolean()
});

const UserForm = ({ mode, user, currentUser, isAdmin, onSubmit, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const isEditingSelf = currentUser && user && currentUser.id === user.id;

  // Configurar valores por defecto
  const defaultValues = isCreateMode
    ? {
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        rol: 'Responsable de tarea',
        habilitado: true
      }
    : {
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        rol: user?.rol || 'Responsable de tarea',
        habilitado: user?.habilitado !== undefined ? user.habilitado : true
      };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    resolver: yupResolver(isCreateMode ? createUserSchema : editUserSchema),
    defaultValues
  });

  const watchedRole = watch('rol');
  const watchedEnabled = watch('habilitado');

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isCreateMode ? 'Crear Nuevo Usuario' : `Editar Usuario: ${user?.nombre}`}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isCreateMode
            ? 'Completa la información para crear un nuevo usuario en el sistema.'
            : 'Modifica la información del usuario. Los campos marcados con * son obligatorios.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-4 w-4 text-gray-400" />
              </div>
              <input
                {...register('nombre')}
                type="text"
                className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.nombre ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Ingrese el nombre completo"
              />
            </div>
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                {...register('telefono')}
                type="tel"
                className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.telefono ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="+51 999 999 999"
              />
            </div>
            {errors.telefono && (
              <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
            )}
          </div>

          {/* Contraseña - Solo en modo crear */}
          {isCreateMode && (
            <div className="md:col-span-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Ingrese la contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Rol - Solo admins pueden cambiarlo o si no está editando su propio perfil */}
          {(isAdmin || !isEditingSelf) && (
            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select
                {...register('rol')}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.rol ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="Responsable de tarea">Responsable de tarea</option>
                <option value="Responsable de proyecto">Responsable de proyecto</option>
                {isAdmin && (
                  <option value="Administrador">Administrador</option>
                )}
              </select>
              {errors.rol && (
                <p className="mt-1 text-sm text-red-600">{errors.rol.message}</p>
              )}
            </div>
          )}

          {/* Estado - Solo admins pueden cambiarlo y no en su propio perfil */}
          {isAdmin && !isEditingSelf && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Estado
              </label>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    {...register('habilitado')}
                    type="radio"
                    value={true}
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Habilitado</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    {...register('habilitado')}
                    type="radio"
                    value={false}
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Deshabilitado</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional para usuarios no administradores */}
        {!isAdmin && isEditingSelf && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  Para cambiar tu contraseña o modificar tu rol, contacta a un administrador del sistema.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vista previa de cambios */}
        {isEditMode && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Información actual:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Rol:</span> {watchedRole}
              </div>
              <div>
                <span className="font-medium">Estado:</span> {watchedEnabled ? 'Habilitado' : 'Deshabilitado'}
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiX className="h-4 w-4 mr-2" />
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isCreateMode ? 'Creando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4 mr-2" />
                {isCreateMode ? 'Crear Usuario' : 'Guardar Cambios'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;