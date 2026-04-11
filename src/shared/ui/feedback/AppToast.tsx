import { useEffect } from 'react'

interface AppToastProps {
  message: string
  type: 'success' | 'warning'
  autoCloseMs?: number
  onClose?: () => void
}

export function AppToast({
  message,
  type,
  autoCloseMs = 3500,
  onClose,
}: AppToastProps) {
  useEffect(() => {
    if (!onClose || autoCloseMs <= 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      onClose()
    }, autoCloseMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [autoCloseMs, onClose])

  return (
    <div className="toast toast-top toast-center z-50">
      <div
        className={`alert ${type === 'success' ? 'alert-success' : 'alert-warning'} shadow-lg`}
        role={type === 'success' ? 'status' : 'alert'}
      >
        <span>{message}</span>
        {onClose ? (
          <button
            className="btn btn-ghost btn-xs"
            onClick={onClose}
            type="button"
            aria-label="Cerrar notificacion"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  )
}
