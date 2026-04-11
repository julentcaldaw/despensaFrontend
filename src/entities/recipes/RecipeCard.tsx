import { LikeHeartControl } from '../../shared/ui/feedback/LikeHeartControl'
import type { RecipeSummary } from '../../features/recipes/model/types/recipes.model'
import { MissingIngredientsChips } from './MissingIngredientsChips'
import { RecipeMetaBadges } from './RecipeMetaBadges'

interface RecipeCardProps {
  recipe: RecipeSummary
  liked: boolean
  isUpdatingLike: boolean
  onToggleLike: () => void | Promise<void>
}

export function RecipeCard({ recipe, liked, isUpdatingLike, onToggleLike }: RecipeCardProps) {
  const missingRequirements = recipe.ingredients.filter((ingredient) => !ingredient.inStock)
  const inStockRequirements = recipe.ingredients.filter((ingredient) => ingredient.inStock)
  const hasMissingIngredients = missingRequirements.length > 0 || recipe.availability === 'almost'
  const cardClassName = hasMissingIngredients
    ? 'border-warning/35 bg-warning/10'
    : 'border-success/30 bg-success/5'

  return (
    <article className={`rounded-box border p-4 ${cardClassName}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-semibold text-base-content">{recipe.name}</h3>
        <div className="flex items-center">
          <p className="text-xs text-base-content/70">{recipe.authorName}</p>
          <LikeHeartControl
            liked={liked}
            disabled={isUpdatingLike}
            labelLiked="Quitar receta de favoritas"
            labelUnliked="Marcar receta como favorita"
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

      <MissingIngredientsChips recipeId={recipe.id} requirements={missingRequirements} />
    </article>
  )
}
