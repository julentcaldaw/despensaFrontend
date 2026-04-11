import { useEffect, type PropsWithChildren } from 'react'
import { refreshAuthSession } from '../../features/auth/api/auth-session.api'
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store'
import { apiClient } from '../../shared/lib/http/api-client'

export function AuthSessionProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    apiClient.setAuthHandlers({
      getAccessToken: () => useAuthSessionStore.getState().session?.accessToken,
      refreshSession: async () => {
        const currentSession = useAuthSessionStore.getState().session

        if (!currentSession?.refreshToken) {
          return undefined
        }

        const refreshedSession = await refreshAuthSession(currentSession.refreshToken)
        useAuthSessionStore.getState().setSession(refreshedSession)

        return refreshedSession.accessToken
      },
      onUnauthorized: () => {
        useAuthSessionStore.getState().clearSession()
      },
    })

    return () => {
      apiClient.setAuthHandlers(null)
    }
  }, [])

  return children
}
