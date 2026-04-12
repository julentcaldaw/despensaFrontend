import { Heart } from 'lucide-react'

interface LikeHeartControlProps {
  liked: boolean
  disabled?: boolean
  size?: number
  controlSize?: number
  className?: string
  labelLiked?: string
  labelUnliked?: string
  stopPropagation?: boolean
  preventDefault?: boolean
  onToggle: () => void | Promise<void>
}

export function LikeHeartControl({
  liked,
  disabled = false,
  size = 14,
  controlSize = 24,
  className,
  labelLiked = 'Quitar de favoritos',
  labelUnliked = 'Marcar como favorito',
  stopPropagation = false,
  preventDefault = false,
  onToggle,
}: LikeHeartControlProps) {
  function handleAction(event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) {
    if (disabled) {
      return
    }

    // Always prevent default for keyboard events to avoid unintended side effects
    if (event instanceof KeyboardEvent) {
      event.preventDefault()
    } else if (preventDefault) {
      event.preventDefault()
    }

    if (stopPropagation) {
      event.stopPropagation()
    }

    void onToggle()
  }

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-pressed={liked}
      className={`group inline-flex items-center justify-center rounded-full ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${className ?? ''}`.trim()}
      style={{ width: `${controlSize}px`, height: `${controlSize}px` }}
      aria-label={liked ? labelLiked : labelUnliked}
      title={liked ? labelLiked : labelUnliked}
      onClick={(event) => handleAction(event)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          handleAction(event)
        }
      }}
    >
      <Heart
        size={size}
        className={liked ? 'text-red-500' : 'text-gray-400 transition-colors group-hover:text-red-500'}
        fill={liked ? 'currentColor' : 'none'}
      />
    </span>
  )
}
