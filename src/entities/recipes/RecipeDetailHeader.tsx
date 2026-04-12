import { useEffect, useRef, useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { RecipeSummary } from '../../features/recipes/model/types/recipes.model'
import { LikeHeartControl } from '../../shared/ui/feedback/LikeHeartControl'
import { RecipeMetaBadges } from './RecipeMetaBadges'

interface RecipeDetailHeaderProps {
  recipe: RecipeSummary
  liked: boolean
  isUpdatingLike: boolean
  onToggleLike: () => void | Promise<void>
  hasMissingIngredients: boolean
  inStockIngredientsCount: number
  failedImageUrl: string | null
  onImageError: (imageUrl: string | null) => void
}

export function RecipeDetailHeader({
  recipe,
  liked,
  isUpdatingLike,
  onToggleLike,
  hasMissingIngredients,
  inStockIngredientsCount,
  failedImageUrl,
  onImageError,
}: RecipeDetailHeaderProps) {
  const [headerInfoHeight, setHeaderInfoHeight] = useState<number>(0)
  const [isSmUp, setIsSmUp] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia('(min-width: 640px)').matches
  })
  const headerInfoRef = useRef<HTMLDivElement | null>(null)
  const hasRecipeImage = Boolean(recipe.image) && recipe.image !== failedImageUrl

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(min-width: 640px)')
    const handleChange = (event: MediaQueryListEvent) => {
      setIsSmUp(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    const node = headerInfoRef.current
    if (!node || typeof ResizeObserver === 'undefined') {
      return
    }

    const updateHeight = () => {
      requestAnimationFrame(() => {
        const nextHeight = node.offsetHeight
        setHeaderInfoHeight((prevHeight) => (prevHeight === nextHeight ? prevHeight : nextHeight))
      })
    }

    const observer = new ResizeObserver(updateHeight)
    observer.observe(node)
    updateHeight()

    return () => {
      observer.disconnect()
    }
  }, [recipe.id])

  const syncedSize = isSmUp && headerInfoHeight > 0 ? `${headerInfoHeight}px` : undefined

  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
        <div ref={headerInfoRef} className="space-y-3">
          <div className="flex items-start gap-3">
            <LikeHeartControl
              liked={liked}
              disabled={isUpdatingLike}
              size={20}
              controlSize={36}
              className="mt-0.5 shrink-0"
              labelLiked="Quitar receta de favoritas"
              labelUnliked="Marcar receta como favorita"
              onToggle={onToggleLike}
            />

            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-base-content">{recipe.name}</h1>
              <p className="text-sm text-base-content/70">Por {recipe.authorName}</p>
            </div>
          </div>

          <RecipeMetaBadges
            difficulty={recipe.difficulty}
            prepTime={recipe.prepTime}
            ingredientsCount={recipe.ingredientsCount}
            hasMissingIngredients={hasMissingIngredients}
            inStockIngredientsCount={inStockIngredientsCount}
          />
        </div>

        <figure
          className="overflow-hidden rounded-box border border-base-300 bg-base-200/50 h-52 sm:h-auto sm:justify-self-end"
          style={{ height: syncedSize, width: syncedSize, maxWidth: '100%' }}
        >
          {hasRecipeImage ? (
            <img
              src={recipe.image ?? undefined}
              alt={`Imagen de la receta ${recipe.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => onImageError(recipe.image)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-base-200 via-base-100 to-base-300/60 text-base-content/60">
              <ImageOff size={22} />
              <p className="text-xs font-medium">Sin imagen disponible</p>
            </div>
          )}
        </figure>
      </div>
    </section>
  )
}