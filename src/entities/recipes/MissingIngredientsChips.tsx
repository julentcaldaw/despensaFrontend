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
          className="badge badge-error badge-outline badge-sm"
        >
          {formatRequirement(requirement)}
        </span>
      ))}
    </div>
  )
}
