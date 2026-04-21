import { Tag } from 'lucide-react'
import { PANTRY_ITEM_UNITS, PANTRY_UNIT_LABELS } from '../../features/pantry/model/types/pantry.model'
import type { OrderItem } from '../../features/orders/model/orders.model'
import { DynamicIcon, resolveCategoryIconName } from '../../shared/ui/icon/resolveCategoryIconName'

interface OrderDetailIngredientCardProps {
  item: OrderItem
}

function formatUnit(unit: string): string {
  const normalizedUnit = unit.trim().toUpperCase()

  if ((PANTRY_ITEM_UNITS as readonly string[]).includes(normalizedUnit)) {
    return PANTRY_UNIT_LABELS[normalizedUnit as keyof typeof PANTRY_UNIT_LABELS]
  }

  return unit.toLowerCase()
}

export function OrderDetailIngredientCard({ item }: OrderDetailIngredientCardProps) {
  const categoryIconName = resolveCategoryIconName(item.categoryIcon)

  return (
    <li className="relative overflow-hidden rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
      <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-base-content/10">
        {categoryIconName ? (
          <DynamicIcon name={categoryIconName} size={96} strokeWidth={1.6} />
        ) : (
          <Tag size={96} strokeWidth={1.6} />
        )}
      </div>

      <div className="relative z-10 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 font-medium text-base-content">{item.name}</p>
          {item.categoryName ? <span className="badge badge-outline badge-sm shrink-0">{item.categoryName}</span> : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-base-content/70">
          <span className="rounded-full bg-base-200/80 px-2.5 py-1">
            {item.quantity} {formatUnit(item.unit)}
          </span>
        </div>
      </div>
    </li>
  )
}