/**
 * PantryHeader Component
 * Header with title and add button
 */

import { Plus, Search } from 'lucide-react'
import { useState } from 'react'

interface PantryHeaderProps {
  itemCount: number
  onAddClick: () => void
  searchQuery?: string
  onSearchQueryChange?: (value: string) => void
}

export function PantryHeader({ itemCount, onAddClick, searchQuery = '', onSearchQueryChange }: PantryHeaderProps) {
  return (
    <header className="rounded-box border border-base-300 bg-base-100 p-6 mb-6">
      <div className="grid gap-3 md:gap-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-base-content">Mi despensa</h1>
          <p className="text-base-content/70 text-sm mt-1">
            {itemCount === 0
              ? 'Sin elementos'
              : itemCount === 1
                ? '1 elemento'
                : `${itemCount} elementos`}
          </p>
        </div>
        <div className="relative w-full">
          <label className="input input-bordered flex w-full items-center gap-2">
            <Search size={16} className="text-base-content/60" />
            <input
              className="grow"
              placeholder="Buscar en despensa"
              type="search"
              value={searchQuery}
              onChange={onSearchQueryChange ? (e) => onSearchQueryChange(e.target.value) : undefined}
              disabled={!onSearchQueryChange}
            />
          </label>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onAddClick}>
          <Plus size={16} />
          Añadir
        </button>
      </div>
    </header>
  )
}
