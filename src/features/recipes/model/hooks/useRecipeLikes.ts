import { useState } from 'react'
import { updateRecipeLike } from '../../api/recipes.api'
import type { RecipeSummary } from '../types/recipes.model'

export function useRecipeLikes() {
  const [updatingLikeId, setUpdatingLikeId] = useState<number | null>(null)
  const [likeOverrides, setLikeOverrides] = useState<Record<number, boolean>>({})

  function getRecipeLikeValue(recipe: RecipeSummary): boolean {
    if (recipe.id in likeOverrides) {
      return likeOverrides[recipe.id]
    }

    return recipe.liked
  }

  async function toggleRecipeLike(recipe: RecipeSummary): Promise<void> {
    if (updatingLikeId === recipe.id) {
      return
    }

    const currentLike = getRecipeLikeValue(recipe)
    const nextLike = !currentLike

    setUpdatingLikeId(recipe.id)
    setLikeOverrides((prev) => ({ ...prev, [recipe.id]: nextLike }))

    try {
      await updateRecipeLike(recipe.id, nextLike)
    } catch {
      setLikeOverrides((prev) => ({ ...prev, [recipe.id]: currentLike }))
    } finally {
      setUpdatingLikeId(null)
    }
  }

  return {
    updatingLikeId,
    getRecipeLikeValue,
    toggleRecipeLike,
  }
}
