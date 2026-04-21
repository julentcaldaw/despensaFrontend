/**
 * PantryItemCard Component
 * Displays a single pantry item with actions
 */

import { Archive, Pencil, Refrigerator, Snowflake, Tag, Trash2 } from 'lucide-react'
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic'
import type {
  PantryItem,
  PantryItemConservation,
  PantryItemStatus,
} from '../../features/pantry/model/types/pantry.model'
import { PANTRY_UNIT_LABELS } from '../../features/pantry/model/types/pantry.model'

const LUCIDE_ICON_NAMES = new Set(iconNames as string[])

interface PantryItemCardProps {
  item: PantryItem
  onEdit: (item: PantryItem) => void
  onConsume: (itemId: string) => void
  onDelete: (itemId: string) => void
}

/**
 * Get status badge color and label
 */
function getStatusBadgeStyle(
  status: PantryItemStatus,
): { className: string; label: string } | null {
  if (status === 'low_stock') {
    return { className: 'badge badge-warning', label: 'Bajo stock' }
  }

  return null
}

function getExpiryBadgeStyle(
  date: Date | null,
): { className: string; label: string } | null {
  if (!date) return null

  const now = new Date()
  const daysUntilExpiry = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

  if (daysUntilExpiry < 0) {
    return { className: 'badge badge-error', label: 'Caducado' }
  }

  if (daysUntilExpiry < 3) {
    return { className: 'badge badge-error', label: '< 3d' }
  }

  if (daysUntilExpiry < 7) {
    return { className: 'badge badge-warning', label: '< 7d' }
  }

  return null
}

function normalizeIconName(iconName: string): string {
  return iconName
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

function resolveCategoryIconName(iconName: string | null): IconName | null {
  if (!iconName) return null

  if (LUCIDE_ICON_NAMES.has(iconName)) {
    return iconName as IconName
  }

  const normalizedName = normalizeIconName(iconName)
  if (LUCIDE_ICON_NAMES.has(normalizedName)) {
    return normalizedName as IconName
  }

  return null
}

function getConservationIconColor(conservation: PantryItemConservation): string {
  switch (conservation) {
    case 'NEVERA':
      return 'text-info'
    case 'CONGELADOR':
      return 'text-accent'
    case 'DESPENSA':
      return 'text-warning'
    default:
      return 'text-base-content/70'
  }
}

function renderConservationIcon(
  conservation: PantryItemConservation,
  colorClass: string,
) {
  const iconProps = {
    size: 16,
    className: `shrink-0 ${colorClass}`,
    strokeWidth: 2,
  }

  switch (conservation) {
    case 'NEVERA':
      return <Refrigerator {...iconProps} />
    case 'CONGELADOR':
      return <Snowflake {...iconProps} />
    case 'DESPENSA':
      return <Archive {...iconProps} />
    default:
      return <Archive {...iconProps} />
  }
}

export function PantryItemCard({
  item,
  onEdit,
  onConsume: _onConsume,
  onDelete,
}: PantryItemCardProps) {
  const statusStyle = getStatusBadgeStyle(item.status)
  const expiryBadgeStyle = getExpiryBadgeStyle(item.expiresAt)
  const categoryIconName = resolveCategoryIconName(item.categoryIcon)
  const conservationIconColor = getConservationIconColor(item.conservation)

  return (
    <div className="card relative overflow-hidden border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-base-content/10">
        {categoryIconName ? (
          <DynamicIcon name={categoryIconName} size={112} strokeWidth={1.6} />
        ) : (
          <Tag size={112} strokeWidth={1.6} />
        )}
      </div>

      <div className="card-body relative z-10 gap-3 p-4">
        {/* Header: Name and Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {renderConservationIcon(item.conservation, conservationIconColor)}
            <h3 className="card-title min-w-0 truncate text-base">{item.ingredientName}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {expiryBadgeStyle ? (
              <span className={expiryBadgeStyle.className}>{expiryBadgeStyle.label}</span>
            ) : null}
            {statusStyle ? (
              <span className={statusStyle.className}>{statusStyle.label}</span>
            ) : null}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-end text-sm">
          <span className="font-semibold">{item.quantity} {PANTRY_UNIT_LABELS[item.unit]}</span>
        </div>

        {/* Footer: Shop and Actions */}
        <div className="flex items-end justify-between gap-2 pt-2">
          <span
            className="max-w-[45%] truncate text-xs text-base-content/60"
            title={item.shopName ?? 'Sin tienda'}
          >
            {item.shopName ?? 'Sin tienda'}
          </span>

          <div className="card-actions justify-end gap-2">
            {/* Botón de consumir eliminado */}
            <div className="tooltip tooltip-top" data-tip="Editar">
              <button
                className="btn btn-circle btn-sm btn-outline btn-warning"
                onClick={() => onEdit(item)}
                title="Editar"
                aria-label="Editar"
              >
                <Pencil size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="tooltip tooltip-top" data-tip="Eliminar">
              <button
                className="btn btn-circle btn-sm btn-outline btn-error"
                onClick={() => onDelete(item.id)}
                title="Eliminar"
                aria-label="Eliminar"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
