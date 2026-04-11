/**
 * PantryHeader Component
 * Header with title and add button
 */

import { Plus } from 'lucide-react'

interface PantryHeaderProps {
  itemCount: number
  onAddClick: () => void
}

export function PantryHeader({ itemCount, onAddClick }: PantryHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-base-content">Mi despensa</h1>
        <p className="text-base-content/70 text-sm mt-1">
          {itemCount === 0
            ? 'Sin elementos'
            : itemCount === 1
              ? '1 elemento'
              : `${itemCount} elementos`}
        </p>
      </div>
      <button
        className="btn btn-primary gap-2"
        onClick={onAddClick}
      >
        <Plus size={16} strokeWidth={2.2} />
        <span className="hidden sm:inline">Añadir</span>
      </button>
    </div>
  )
}
