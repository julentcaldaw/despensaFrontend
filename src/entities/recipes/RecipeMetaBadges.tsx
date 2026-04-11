import { Clock3 } from 'lucide-react'
import type { RecipeDifficulty } from '../../features/recipes/model/types/recipes.model'

const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Intermedia',
  HARD: 'Difícil',
}

const DIFFICULTY_BADGE_CLASSES: Record<RecipeDifficulty, string> = {
  EASY: 'badge badge-soft badge-success border-success/30 bg-success/15 text-success',
  MEDIUM: 'badge badge-soft badge-warning border-warning/30 bg-warning/15 text-warning',
  HARD: 'badge badge-soft badge-error border-error/30 bg-error/15 text-error',
}

interface RecipeMetaBadgesProps {
  difficulty: RecipeDifficulty
  prepTime: number | null
  ingredientsCount: number
  hasMissingIngredients: boolean
  inStockIngredientsCount: number
}

export function RecipeMetaBadges({
  difficulty,
  prepTime,
  ingredientsCount,
  hasMissingIngredients,
  inStockIngredientsCount,
}: RecipeMetaBadgesProps) {
  return (
    <div className="mb-3 flex flex-wrap gap-2 text-xs">
      <span className={DIFFICULTY_BADGE_CLASSES[difficulty]}>{DIFFICULTY_LABELS[difficulty]}</span>
      <span className="badge badge-neutral badge-outline gap-1">
        <Clock3 size={12} />
        {prepTime ?? '-'} min
      </span>
      <span className={hasMissingIngredients ? 'badge badge-error badge-outline' : 'badge badge-info badge-outline'}>
        {hasMissingIngredients
          ? `${inStockIngredientsCount}/${ingredientsCount} ingredientes`
          : `${ingredientsCount} ingredientes`}
      </span>
    </div>
  )
}
