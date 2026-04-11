import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store'

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const hasAccessToken = useAuthSessionStore((state) => Boolean(state.session?.accessToken))

  if (hasAccessToken) {
    return <Navigate to="/pantry" replace />
  }

  return children
}
