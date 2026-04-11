/**
 * EmptyStatePantry Component
 * Displayed when there are no pantry items
 */

import { PackageOpen, Plus } from 'lucide-react'

interface EmptyStatePantryProps {
  onAddClick: () => void
}

export function EmptyStatePantry({ onAddClick }: EmptyStatePantryProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 rounded-full bg-base-300/60 p-4 text-base-content/70">
        <PackageOpen size={44} strokeWidth={1.8} />
      </div>
      <h3 className="text-2xl font-semibold text-base-content mb-2">
        Tu despensa está vacía
      </h3>
      <p className="text-base-content/70 mb-6 max-w-md">
        Comienza a añadir elementos a tu despensa para mantener un control de tu
        inventario y recibir sugerencias personalizadas.
      </p>
      <button
        className="btn btn-primary gap-2"
        onClick={onAddClick}
      >
        <Plus size={16} strokeWidth={2.2} />
        Añadir primer elemento
      </button>
    </div>
  )
}
