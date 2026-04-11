/**
 * PageEmptyState
 * Empty state message for pages with no data
 */

import { Box } from 'lucide-react'

interface PageEmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function PageEmptyState({ title, description, icon, action }: PageEmptyStateProps) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-box border border-dashed border-base-300 bg-base-50 p-6">
      <div className="flex flex-col items-center gap-3">
        {icon || <Box size={32} className="text-base-content/40" />}
        <div className="text-center">
          <h3 className="font-semibold text-base-content">{title}</h3>
          {description ? (
            <p className="text-sm text-base-content/70">{description}</p>
          ) : null}
        </div>
        {action ? (
          <button className="btn btn-sm btn-primary mt-2" onClick={action.onClick}>
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}
