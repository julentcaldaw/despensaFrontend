import type { RecipeRequirement } from '../../features/recipes/model/types/recipes.model'
import { IngredientStatusBadge } from './IngredientStatusBadge'

interface IngredientBadgesProps {
  requirements: RecipeRequirement[]
  addingIngredientIds?: number[]
  onAddToShoppingList?: (requirement: RecipeRequirement) => Promise<void> | void
}

function formatRequirement(requirement: RecipeRequirement): string {
  if (typeof requirement.quantity === 'number' && requirement.unit) {
    return `${requirement.ingredientName} (${requirement.quantity} ${requirement.unit})`
  }

  return requirement.ingredientName
}

export function IngredientBadges({
  requirements,
  addingIngredientIds = [],
  onAddToShoppingList,
}: IngredientBadgesProps) {
  if (requirements.length === 0) {
    return null
  }

  const addingSet = new Set(addingIngredientIds)

  return (
    <div className="flex flex-wrap gap-2">
      {requirements.map((requirement) => (
        <IngredientStatusBadge
          key={requirement.ingredientId}
          label={formatRequirement(requirement)}
          requirement={requirement}
          isAdding={addingSet.has(requirement.ingredientId)}
          onAddToShoppingList={onAddToShoppingList}
        />
      ))}
    </div>
  )
}
