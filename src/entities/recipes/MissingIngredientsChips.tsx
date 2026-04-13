import type { RecipeRequirement } from '../../features/recipes/model/types/recipes.model'
import { IngredientBadges } from './IngredientBadges'

interface MissingIngredientsChipsProps {
  requirements: RecipeRequirement[]
  addingIngredientIds?: number[]
  onAddToShoppingList?: (requirement: RecipeRequirement) => Promise<void> | void
}

export function MissingIngredientsChips({
  requirements,
  addingIngredientIds,
  onAddToShoppingList,
}: MissingIngredientsChipsProps) {
  return (
    <IngredientBadges
      requirements={requirements}
      addingIngredientIds={addingIngredientIds}
      onAddToShoppingList={onAddToShoppingList}
    />
  )
}
