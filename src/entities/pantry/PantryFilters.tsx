/**
 * PantryFilters Component
 * Filter controls for pantry items
 */

import type { PantryItemStatus } from '../../features/pantry/model/types/pantry.model'

interface PantryFiltersProps {
  selectedStatus: PantryItemStatus | 'all'
  selectedConservation: string | 'all'
  conservations: string[]
  onStatusChange: (status: PantryItemStatus | 'all') => void
  onConservationChange: (conservation: string | 'all') => void
}

export function PantryFilters({
  selectedStatus,
  selectedConservation,
  conservations,
  onStatusChange,
  onConservationChange,
}: PantryFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {/* Status Filter */}
      <div className="form-control">
        <select
          className="select select-bordered select-sm"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as PantryItemStatus | 'all')}
        >
          <option value="all">Todos los estados</option>
          <option value="in_stock">En stock</option>
          <option value="low_stock">Bajo stock</option>
        </select>
      </div>

      {/* Conservation Filter */}
      <div className="form-control">
        <select
          className="select select-bordered select-sm"
          value={selectedConservation}
          onChange={(e) => onConservationChange(e.target.value)}
        >
          <option value="all">Todas las conservaciones</option>
          {conservations.map((conservation) => (
            <option key={conservation} value={conservation}>
              {conservation}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
