import { Check, ClipboardList, PlusCircle } from 'lucide-react'
import type { MouseEvent } from 'react'
import type { RecipeRequirement } from '../../features/recipes/model/types/recipes.model'

interface IngredientStatusBadgeProps {
  label: string
  requirement: RecipeRequirement
  isAdding?: boolean
  onAddToShoppingList?: (requirement: RecipeRequirement) => Promise<void> | void
}

export function IngredientStatusBadge({
  label,
  requirement,
  isAdding = false,
  onAddToShoppingList,
}: IngredientStatusBadgeProps) {
  const isInPantry = requirement.inStock
  const isInShoppingList = requirement.inShoppingList
  const canAddToShoppingList = !isInPantry && !isInShoppingList && Boolean(onAddToShoppingList)

  const variantClass = isInPantry
    ? 'badge-success'
    : isInShoppingList
      ? 'badge-warning'
      : 'badge-error'

  const icon = isInPantry
    ? <Check size={12} aria-hidden="true" />
    : isInShoppingList
      ? <ClipboardList size={12} aria-hidden="true" />
      : <PlusCircle size={12} aria-hidden="true" />

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!canAddToShoppingList || isAdding || !onAddToShoppingList) {
      return
    }

    event.stopPropagation()
    event.preventDefault()
    void onAddToShoppingList(requirement)
  }

  if (canAddToShoppingList) {
    return (
      <div className="tooltip tooltip-top" data-tip="Añadir a la lista de la compra">
        <button
          type="button"
          className={`badge badge-outline badge-sm gap-1 ${variantClass} ${
            isAdding ? 'cursor-wait opacity-70' : 'cursor-pointer'
          }`}
          onClick={handleClick}
          disabled={isAdding}
        >
          {icon}
          {label}
        </button>
      </div>
    )
  }

  return (
    <span className={`badge badge-outline badge-sm gap-1 ${variantClass}`}>
      {icon}
      {label}
    </span>
  )
}
