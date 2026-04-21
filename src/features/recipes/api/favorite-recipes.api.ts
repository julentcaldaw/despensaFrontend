import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../shared/lib/http/api-client'

type FavoriteRecipe = {
  like?: boolean
  liked?: boolean
  [key: string]: unknown
}

type FavoriteRecipesEnvelope = {
  data: FavoriteRecipe[]
  [key: string]: unknown
}

function isFavoriteRecipeArray(value: unknown): value is FavoriteRecipe[] {
  return Array.isArray(value)
}

function isFavoriteRecipesEnvelope(value: unknown): value is FavoriteRecipesEnvelope {
  return value !== null && typeof value === 'object' && 'data' in value && Array.isArray((value as { data?: unknown }).data)
}

export async function fetchFavoriteRecipes() {
  const data = await apiClient.get<unknown>('/recipes/favorites')

  if (isFavoriteRecipeArray(data)) {
    return data.map((recipe) => ({
      ...recipe,
      liked: recipe.like ?? false,
    }))
  }

  if (isFavoriteRecipesEnvelope(data)) {
    return {
      ...data,
      data: data.data.map((recipe) => ({
        ...recipe,
        liked: recipe.like ?? false,
      })),
    }
  }

  return data
}

export function useFavoriteRecipes() {
  return useQuery({
    queryKey: ['recipes', 'favorites'],
    queryFn: fetchFavoriteRecipes,
  })
}
