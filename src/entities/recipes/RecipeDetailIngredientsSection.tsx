import type { RecipeSummary } from '../../features/recipes/model/types/recipes.model'
import { resolveCategoryIconName, DynamicIcon } from '../../shared/ui/icon/resolveCategoryIconName'
import { Tag } from 'lucide-react'

interface RecipeDetailIngredientsSectionProps {
  recipe: RecipeSummary
}

export function RecipeDetailIngredientsSection({ recipe }: RecipeDetailIngredientsSectionProps) {
  function getBorderColor(ing: typeof recipe.ingredients[number]) {
    if (ing.inStock) return 'border-success'
    if (ing.inShoppingList) return 'border-warning'
    return 'border-error'
  }

  return (
    <article className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-base-content">Ingredientes</h2>
        <span className="text-sm text-base-content/60">{recipe.ingredientsCount} en total</span>
      </div>

      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {recipe.ingredients.map((ingredient) => {
          const iconName = resolveCategoryIconName(ingredient.categoryIcon)
          return (
            <li
              key={`${recipe.id}-${ingredient.ingredientId}`}
              className={`relative flex items-center gap-4 rounded-box border px-4 py-3 bg-base-100 ${getBorderColor(ingredient)}`}
            >
              <span className="pointer-events-none text-base-content/20">
                {iconName ? (
                  <DynamicIcon name={iconName} size={38} strokeWidth={1.7} />
                ) : (
                  <Tag size={38} strokeWidth={1.7} />
                )}
              </span>
              <div>
                <p className="font-medium text-base-content">{ingredient.ingredientName}</p>
                <p className="text-sm text-base-content/60">
                  {ingredient.quantity ? ingredient.quantity : 'Cantidad'}
                  {ingredient.unit ? ` ${ingredient.unit}` : ' por definir'}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </article>
  )
}