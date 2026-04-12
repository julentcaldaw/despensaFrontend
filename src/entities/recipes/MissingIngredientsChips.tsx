import { ClipboardList } from 'lucide-react'
import type { RecipeRequirement } from '../../features/recipes/model/types/recipes.model'

interface MissingIngredientsChipsProps {
  recipeId: number
  requirements: RecipeRequirement[]
}

function formatRequirement(requirement: RecipeRequirement): string {
  if (typeof requirement.quantity === 'number' && requirement.unit) {
    return `${requirement.ingredientName} (${requirement.quantity} ${requirement.unit})`
  }

  return requirement.ingredientName
}

export function MissingIngredientsChips({ recipeId, requirements }: MissingIngredientsChipsProps) {
  if (requirements.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {requirements.map((requirement) => (
        <span
          key={`${recipeId}-${requirement.ingredientId}`}
          className={`badge badge-outline badge-sm gap-1 ${requirement.inShoppingList ? 'badge-warning' : 'badge-error'}`}
        >
          {requirement.inShoppingList ? <ClipboardList size={12} aria-hidden="true" /> : null}
          {formatRequirement(requirement)}
        </span>
      ))}
    </div>
  )
}
