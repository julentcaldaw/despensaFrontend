
import React from 'react';
import { ArrowRight, BookOpen, Heart, History, LogOut, Pencil, ShieldCheck, User, UtensilsCrossed, WheatOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutAuthSession } from '../../features/auth/api/auth-session.api';
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store';
import { updateUserProfile } from '../../features/auth/api/user-profile.api';
import { EditUserModal } from './EditUserModal';

interface ProfileAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  toneClassName: string;
  onClick: () => void;
  disabled?: boolean;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthSessionStore((state) => state.session?.user);
  const clearSession = useAuthSessionStore((state) => state.clearSession);
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
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const setSession = useAuthSessionStore((state) => state.setSession);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logoutAuthSession(useAuthSessionStore.getState().session?.refreshToken);
    } catch {
      // No bloquea el cierre local de sesión.
    } finally {
      clearSession();
      navigate('/login', { replace: true });
    }
  }

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

  const profileActions: ProfileAction[] = [
    {
      id: 'favorite-recipes',
      title: 'Recetas favoritas',
      description: 'Accede rapido a las recetas que ya has marcado para repetir.',
      icon: Heart,
      toneClassName: 'border-warning/35 bg-warning/10 hover:border-warning/60 hover:bg-warning/15',
      onClick: () => navigate('/recipes/favorites'),
    },
    {
      id: 'added-recipes',
      title: 'Recetas añadidas',
      description: 'Consulta las recetas que has incorporado a tu recetario.',
      icon: BookOpen,
      toneClassName: 'border-info/30 bg-info/10 hover:border-info/60 hover:bg-info/15',
      onClick: () => navigate('/recipes/added'),
    },
    {
      id: 'spoons',
      title: 'Mis cucharas',
      description: 'Gestiona tus insignias, logros o progreso personal asociado al perfil.',
      icon: UtensilsCrossed,
      toneClassName: 'border-success/30 bg-success/10 hover:border-success/60 hover:bg-success/15',
      onClick: () => navigate('/profile/spoons'),
    },
    {
      id: 'purchase-history',
      title: 'Historial de compras',
      description: 'Revisa pedidos anteriores, tickets y detalle de ingredientes comprados.',
      icon: History,
      toneClassName: 'border-secondary/30 bg-secondary/10 hover:border-secondary/60 hover:bg-secondary/15',
      onClick: () => navigate('/profile/purchase-history'),
    },
    {
      id: 'dietary-restrictions',
      title: 'Restricciones alimentarias',
      description: 'Configura alergias, intolerancias y preferencias para personalizar tu experiencia.',
      icon: WheatOff,
      toneClassName: 'border-base-300 bg-base-200/60 hover:border-base-300 hover:bg-base-200/60',
      onClick: () => {},
      disabled: true,
    },
    {
      id: 'logout',
      title: isLoggingOut ? 'Cerrando sesion...' : 'Cerrar sesion',
      description: 'Finaliza la sesion actual en este dispositivo de forma segura.',
      icon: LogOut,
      toneClassName: 'border-error/35 bg-error/10 hover:border-error/60 hover:bg-error/15',
      onClick: () => {
        void handleLogout();
      },
      disabled: isLoggingOut,
    },
  ];

  return (
    <div className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-10">

      <div className="relative mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-base-300 bg-base-100/95 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username || user.email}
                    className="h-20 w-20 rounded-[1.5rem] border border-base-300 object-cover shadow-sm sm:h-24 sm:w-24"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-base-300 bg-base-200 shadow-sm sm:h-24 sm:w-24">
                    <User size={42} className="text-base-content/55" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div>
                  <h1 className="min-w-0 truncate text-3xl font-semibold text-base-content sm:text-4xl">
                    {user?.username || 'Usuario'}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-base-content/60">
                    <span className="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200/70 px-2.5 py-1">
                      <ShieldCheck size={12} />
                      {user?.role === 'admin' ? 'Administrador' : 'Cuenta activa'}
                    </span>
                    <span className="rounded-full border border-base-300 bg-base-200/70 px-2.5 py-1">
                      {user?.email || 'correo@ejemplo.com'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 lg:w-auto lg:self-center">
              <button
                className="btn btn-primary min-h-12 justify-between rounded-2xl px-4"
                aria-label="Editar perfil"
                onClick={() => setIsEditOpen(true)}
              >
                <span className="inline-flex items-center gap-2">
                  <Pencil size={16} />
                  Editar perfil
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-base-content">Accesos personales</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profileActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={action.disabled}
                  onClick={action.onClick}
                  className={`group flex min-h-40 flex-col justify-between rounded-[1.75rem] border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${action.toneClassName}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-base-100/80 text-base-content shadow-sm">
                        <Icon size={22} strokeWidth={1.9} />
                      </div>
                      <h3 className="text-lg font-semibold text-base-content">{action.title}</h3>
                    </div>
                    <ArrowRight size={18} className="text-base-content/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  <p className="text-sm leading-6 text-base-content/72">{action.description}</p>
                </button>
              );
            })}
          </div>
        </section>
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
    </div>
  );
}
