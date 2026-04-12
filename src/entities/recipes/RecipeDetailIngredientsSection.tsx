import type { RecipeSummary } from '../../features/recipes/model/types/recipes.model'

interface RecipeDetailIngredientsSectionProps {
  recipe: RecipeSummary
}

export function RecipeDetailIngredientsSection({ recipe }: RecipeDetailIngredientsSectionProps) {
  return (
    <article className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-base-content">Ingredientes</h2>
        <span className="text-sm text-base-content/60">{recipe.ingredientsCount} en total</span>
      </div>

      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {recipe.ingredients.map((ingredient) => (
          <li
            key={`${recipe.id}-${ingredient.ingredientId}`}
            className="rounded-box border border-base-300 px-4 py-3"
          >
            <div>
              <p className="font-medium text-base-content">{ingredient.ingredientName}</p>
              <p className="text-sm text-base-content/60">
                {ingredient.quantity ? ingredient.quantity : 'Cantidad'}
                {ingredient.unit ? ` ${ingredient.unit}` : ' por definir'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}