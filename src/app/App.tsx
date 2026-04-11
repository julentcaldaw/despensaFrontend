import { AppRouter } from './router/AppRouter'
import { AuthSessionProvider } from './providers/AuthSessionProvider'
import { QueryClientProvider } from './providers/QueryClientProvider'

export function App() {
  return (
    <div data-theme="bumblebee" className="min-h-screen bg-base-200">
      <QueryClientProvider>
        <AuthSessionProvider>
          <AppRouter />
        </AuthSessionProvider>
      </QueryClientProvider>
    </div>
  )
}
