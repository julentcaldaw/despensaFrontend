import React from 'react';

interface EditUserModalProps {
  isOpen: boolean;
  form: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    currentPassword: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
  isLoading?: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  form,
  onChange,
  onClose,
  onSubmit,
  error,
  isLoading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo sombreado */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md">
        <form
          className="bg-base-100 rounded-box shadow-lg p-8 w-full"
          onSubmit={onSubmit}
          autoComplete="off"
        >
          <h2 className="text-lg font-bold mb-4">Editar perfil</h2>
          {error && (
            <div className="alert alert-error mb-4 py-2 px-3 text-sm">{error}</div>
          )}
          <div className="mb-3">
            <label className="label pb-1">
              <span className="label-text">Nombre de usuario</span>
            </label>
            <input
              className="input input-bordered w-full"
              name="username"
              value={form.username}
              onChange={onChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="label pb-1">
              <span className="label-text">Correo electrónico</span>
            </label>
            <input
              className="input input-bordered w-full"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="label pb-1">
              <span className="label-text">Nueva contraseña</span>
            </label>
            <input
              className="input input-bordered w-full"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="mb-3">
            <label className="label pb-1">
              <span className="label-text">Confirmar contraseña</span>
            </label>
            <input
              className="input input-bordered w-full"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={onChange}
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="mb-3">
            <label className="label pb-1">
              <span className="label-text">Contraseña actual <span className="text-error">*</span></span>
            </label>
            <input
              className="input input-bordered w-full"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={onChange}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="modal-action mt-6 flex gap-2 justify-end">
            <button type="button" className="btn" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
