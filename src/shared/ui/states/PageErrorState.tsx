/**
 * PageErrorState
 * Error alert for page-level errors
 */

import { AlertTriangle } from 'lucide-react'

interface PageErrorStateProps {
  error: string
  title?: string
  onRetry?: () => void
}

export function PageErrorState({ error, title = 'Error', onRetry }: PageErrorStateProps) {
  return (
    <div className="alert alert-error">
      <AlertTriangle size={20} />
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{title}</span>
        <span className="text-sm">{error}</span>
      </div>
      {onRetry ? (
        <button className="btn btn-sm" onClick={onRetry}>
          Reintentar
        </button>
      ) : null}
    </div>
  )
}
