
import React from 'react';
import { User, Heart, BookOpen, UtensilsCrossed, History, LogOut, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store';
import { updateUserProfile } from '../../features/auth/api/user-profile.api';

import './profile-yellow.css';
import { EditUserModal } from './EditUserModal';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthSessionStore((state) => state.session?.user);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    currentPassword: '',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const setSession = useAuthSessionStore((state) => state.setSession);

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Validación básica en frontend
      if (form.password && form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setIsLoading(false);
        return;
      }
      // Construir payload solo con campos modificados
      type UpdatePayload = {
        username?: string;
        email?: string;
        password?: string;
        currentPassword: string;
      };
      const payload: UpdatePayload = { currentPassword: form.currentPassword };
      if (form.username !== user?.username) payload.username = form.username;
      if (form.email !== user?.email) payload.email = form.email;
      if (form.password) payload.password = form.password;
      // Si no hay cambios, error
      if (!payload.username && !payload.email && !payload.password) {
        setError('No hay cambios para guardar.');
        setIsLoading(false);
        return;
      }
      const updatedUser = await updateUserProfile(payload);
      setSession({ ...useAuthSessionStore.getState().session!, user: updatedUser });
      setIsEditOpen(false);
      setForm({
        username: updatedUser.username || '',
        email: updatedUser.email,
        password: '',
        confirmPassword: '',
        currentPassword: '',
      });
    } catch (err) {
      // Manejo de errores específicos
      if (err && typeof err === 'object') {
        const errorObj = err as { code?: string; message?: string };
        if (errorObj.code === 'EMAIL_IN_USE') {
          setError('El correo electrónico ya está en uso.');
        } else if (errorObj.code === 'USERNAME_IN_USE') {
          setError('El nombre de usuario ya está en uso.');
        } else if (errorObj.code === 'INVALID_CURRENT_PASSWORD') {
          setError('La contraseña actual es incorrecta.');
        } else if (errorObj.message) {
          setError(errorObj.message);
        } else {
          setError('Error al actualizar el perfil.');
        }
      } else {
        setError('Error al actualizar el perfil.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4 relative">

      {/* Icono editar en la esquina superior derecha */}
      <button
        className="absolute right-4 top-4 btn btn-circle btn-ghost"
        aria-label="Editar perfil"
        onClick={() => setIsEditOpen(true)}
      >
        <Pencil size={16} />
      </button>

      <h1 className="text-2xl font-bold mb-8 text-center">Perfil</h1>

      {/* Card de usuario */}
      <div className="flex items-center gap-4 rounded-box border border-base-300 bg-base-100 p-5 mb-8">
        <div className="flex-shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username || user.email}
              className="h-16 w-16 rounded-full object-cover border border-base-300"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-base-200 flex items-center justify-center border border-base-300">
              <User size={36} className="text-base-content/60" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-lg text-base-content truncate">{user?.username || 'Usuario'}</div>
          <div className="text-base-content/70 text-sm truncate">{user?.email || 'correo@ejemplo.com'}</div>
        </div>
      </div>

      {/* Modal editar usuario extraído a componente */}
      <EditUserModal
        isOpen={isEditOpen}
        form={form}
        onChange={handleFormChange}
        onClose={() => {
          setIsEditOpen(false);
          setError(null);
          setForm((prev) => ({ ...prev, password: '', confirmPassword: '', currentPassword: '' }));
        }}
        onSubmit={handleEditSubmit}
        error={error}
        isLoading={isLoading}
      />

      {/* Botones en dos columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <button
          className="btn btn-block btn-outline justify-start gap-3 profile-btn-yellow"
          onClick={() => navigate('/recipes/favorites')}
        >
          <Heart size={18} />
          Recetas favoritas
        </button>
        <button
          className="btn btn-block btn-outline justify-start gap-3 profile-btn-yellow"
          onClick={() => navigate('/recipes/added')}
        >
          <BookOpen size={18} />
          Recetas añadidas
        </button>
        <button
          className="btn btn-block btn-outline justify-start gap-3 profile-btn-yellow"
          onClick={() => navigate('/profile/spoons')}
        >
          <UtensilsCrossed size={18} />
          Mis cucharas
        </button>
        <button
          className="btn btn-block btn-outline justify-start gap-3 profile-btn-yellow"
          onClick={() => navigate('/profile/purchase-history')}
        >
          <History size={18} />
          Historial de compras
        </button>
        <button
          className="btn btn-block btn-outline btn-error justify-start gap-3"
          onClick={() => {/* lógica de logout */}}
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
