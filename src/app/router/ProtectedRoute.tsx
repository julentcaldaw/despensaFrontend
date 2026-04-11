import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store'
import { ProtectedAppShell } from '../layout/ProtectedAppShell'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const hasAccessToken = useAuthSessionStore((state) => Boolean(state.session?.accessToken))

  if (!hasAccessToken) {
    return <Navigate to="/login" replace />
  }

  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
