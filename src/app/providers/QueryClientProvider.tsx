/**
 * QueryClientProvider Setup
 * Initializes TanStack Query with default options
 */

import { useState } from 'react'
import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'

interface QueryClientProviderProps {
  children: React.ReactNode
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  )

  return (
    <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>
  )
}
