import { MissingIngredientsChips } from './MissingIngredientsChips'
import type { RecipeRequirement } from '../../features/recipes/model/types/recipes.model'

interface RecipeDetailSidebarProps {
  recipeId: number
  missingRequirements: RecipeRequirement[]
  addableMissingCount: number
  isAddingMissingToShoppingList: boolean
  onAddMissingToShoppingList: () => Promise<void>
}

export function RecipeDetailSidebar({
  recipeId,
  missingRequirements,
  addableMissingCount,
  isAddingMissingToShoppingList,
  onAddMissingToShoppingList,
}: RecipeDetailSidebarProps) {
  return (
    <aside className="h-full">
      <article className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm h-full">
        <h2 className="text-xl font-semibold text-base-content">Lo que te falta</h2>
        <p className="mt-1 text-sm text-base-content/70">
          Revisa rápidamente qué ingredientes no tienes todavía en la despensa.
        </p>

        <div className="mt-4">
          {missingRequirements.length > 0 ? (
            <MissingIngredientsChips recipeId={recipeId} requirements={missingRequirements} />
          ) : (
            <p className="text-sm text-success">Ya tienes todo lo necesario para esta receta.</p>
          )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="btn btn-primary btn-sm w-full"
            disabled={addableMissingCount === 0 || isAddingMissingToShoppingList}
            onClick={() => {
              void onAddMissingToShoppingList()
            }}
          >
            {isAddingMissingToShoppingList
              ? 'Añadiendo ingredientes...'
              : 'Añadir a la lista de la compra'}
          </button>
        </div>
      </article>
    </aside>
  )
}