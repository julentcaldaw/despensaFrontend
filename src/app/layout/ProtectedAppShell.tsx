import { Menu, QrCode, Settings, User, LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logoutAuthSession } from '../../features/auth/api/auth-session.api'
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store'
import { AppToast } from '../../shared/ui/feedback/AppToast'
import { ScanCodeModal, type ScanDetectedPayload } from '../../shared/ui/scan/ScanCodeModal'

interface ProtectedAppShellProps {
  children: ReactNode
}

interface AppNavItem {
  to: string
  label: string
}

const MAIN_NAV_ITEMS: AppNavItem[] = [
  { to: '/pantry', label: 'Despensa' },
  { to: '/shopping-list', label: 'Lista de compra' },
  { to: '/recipes', label: 'Recetas' },
]

export function ProtectedAppShell({ children }: ProtectedAppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)
  const [scanToast, setScanToast] = useState<{ type: 'success' | 'warning'; message: string } | null>(null)
  const session = useAuthSessionStore((state) => state.session)
  const clearSession = useAuthSessionStore((state) => state.clearSession)
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      setIsLoggingOut(true)
      await logoutAuthSession(session?.refreshToken)
    } catch {
      // No bloquea el cierre local de sesión.
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }

  function handleQuickScan() {
    setIsScanModalOpen(true)
  }

  function handleScanDetected(payload: ScanDetectedPayload) {
    const productName = payload.product?.productName
    setScanToast({
      type: 'success',
      message: productName
        ? `Producto detectado: ${productName}`
        : `Codigo detectado: ${payload.code}`,
    })

    if (payload.action === 'add_and_continue') {
      return
    }

    setIsScanModalOpen(false)
    navigate('/pantry')
  }

  return (
    <div className="min-h-screen bg-base-200">
      <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur">
        <div className="navbar mx-auto max-w-6xl px-3 sm:px-6">
          <div className="navbar-start gap-2">
            <div className={`dropdown ${isMenuOpen ? 'dropdown-open' : ''}`}>
              <button
                type="button"
                className="btn btn-circle btn-ghost"
                aria-label="Abrir menu"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <Menu size={20} />
              </button>
              <div className="menu dropdown-content z-[70] mt-3 w-72 rounded-box border border-base-300 bg-base-100 p-3 shadow">
                <div className="mb-3 border-b border-base-200 pb-3">
                  <p className="text-sm font-semibold text-base-content">
                    {session?.user?.username ?? 'Usuario'}
                  </p>
                  <p className="text-xs text-base-content/60">{session?.user?.email ?? ''}</p>
                  <p className="text-xs text-base-content/60">Rol: {session?.user?.role ?? 'user'}</p>
                </div>

                <ul className="mb-3 space-y-1">
                  {MAIN_NAV_ITEMS.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => (isActive ? 'active' : '')}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>

                <ul className="space-y-1 border-t border-base-200 pt-3">
                  <li>
                    <button
                      type="button"
                      className="justify-start"
                      onClick={() => {
                        setIsMenuOpen(false)
                        window.location.assign('/profile')
                      }}
                    >
                      <User size={16} /> Perfil
                    </button>
                  </li>
                  <li>
                    <button type="button" className="justify-start" onClick={() => setIsMenuOpen(false)}>
                      <Settings size={16} /> Ajustes
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="justify-start text-error"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut size={16} />
                      {isLoggingOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <Link to="/pantry" className="inline-flex items-center" aria-label="Ir al inicio">
              <img src="/logoB.png" alt="Logo" className="h-9 w-auto sm:h-10" />
            </Link>
          </div>

          <nav className="navbar-center hidden md:flex">
            <ul className="menu menu-horizontal rounded-box bg-base-200/70 px-1">
              {MAIN_NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar-end gap-2">
            {/* Botón 'Añadir' eliminado de la navbar-end */}
            <button type="button" className="btn btn-sm btn-outline" onClick={handleQuickScan}>
              <QrCode size={16} />
              <span className="hidden sm:inline">Escanear</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-0 sm:px-0">{children}</main>

      <ScanCodeModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onDetected={handleScanDetected}
      />

      {scanToast ? (
        <AppToast
          message={scanToast.message}
          type={scanToast.type}
          autoCloseMs={3000}
          onClose={() => setScanToast(null)}
        />
      ) : null}
    </div>
  )
}
