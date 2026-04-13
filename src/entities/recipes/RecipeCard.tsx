import { useNavigate } from 'react-router-dom'
import { LikeHeartControl } from '../../shared/ui/feedback/LikeHeartControl'
import type { RecipeRequirement, RecipeSummary } from '../../features/recipes/model/types/recipes.model'
import { MissingIngredientsChips } from './MissingIngredientsChips'
import { RecipeMetaBadges } from './RecipeMetaBadges'

interface RecipeCardProps {
  recipe: RecipeSummary
  liked: boolean
  isUpdatingLike: boolean
  onToggleLike: () => void | Promise<void>
  onAddMissingIngredientToShoppingList?: (requirement: RecipeRequirement) => Promise<void> | void
  addingMissingIngredientIds?: number[]
  detailHref: string
}

export function RecipeCard({
  recipe,
  liked,
  isUpdatingLike,
  onToggleLike,
  onAddMissingIngredientToShoppingList,
  addingMissingIngredientIds,
  detailHref,
}: RecipeCardProps) {
  const navigate = useNavigate()
  const missingRequirements = recipe.ingredients.filter((ingredient) => !ingredient.inStock)
  const inStockRequirements = recipe.ingredients.filter((ingredient) => ingredient.inStock)
  const hasMissingIngredients = missingRequirements.length > 0 || recipe.availability === 'almost'
  const cardClassName = hasMissingIngredients
    ? 'border-warning/35 bg-warning/10 hover:bg-warning/15 hover:border-warning/60'
    : 'border-success/30 bg-success/5 hover:bg-success/10 hover:border-success/55'

  function openDetail() {
    navigate(detailHref)
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Ver detalle de la receta ${recipe.name}`}
      className={`rounded-box border p-4 transition-all duration-200 cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${cardClassName}`}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openDetail()
        }
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold text-base-content">{recipe.name}</h3>
        </div>
        <div className="flex items-center">
          <p className="text-xs text-base-content/70">{recipe.authorName}</p>
          <LikeHeartControl
            liked={liked}
            disabled={isUpdatingLike}
            labelLiked="Quitar receta de favoritas"
            labelUnliked="Marcar receta como favorita"
            stopPropagation
            preventDefault
            onToggle={onToggleLike}
          />
        </div>
      </div>

      <RecipeMetaBadges
        difficulty={recipe.difficulty}
        prepTime={recipe.prepTime}
        ingredientsCount={recipe.ingredientsCount}
        hasMissingIngredients={hasMissingIngredients}
        inStockIngredientsCount={inStockRequirements.length}
      />

      <MissingIngredientsChips
        requirements={missingRequirements}
        addingIngredientIds={addingMissingIngredientIds}
        onAddToShoppingList={onAddMissingIngredientToShoppingList}
      />
    </article>
  )
}
