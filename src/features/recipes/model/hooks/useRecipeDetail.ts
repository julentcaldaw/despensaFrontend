import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../../shared/lib/query/query-keys'
import { fetchRecipeDetail } from '../../api/recipes.api'
import { mapRecipeDetailResponse } from '../mappers/recipes.mapper'
import type { RecipeSummary } from '../types/recipes.model'

export function useRecipeDetail(recipeId: number | null) {
  const { data, isLoading, error } = useQuery<RecipeSummary | null>({
    queryKey: queryKeys.recipes.detail(recipeId ?? -1),
    queryFn: async () => {
      if (recipeId === null) {
        return null
      }

      const dto = await fetchRecipeDetail(recipeId)
      return dto ? mapRecipeDetailResponse(dto) : null
    },
    enabled: recipeId !== null,
  })

  return {
    data,
    isLoading,
    error: error?.message ?? null,
  }
}