import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../../shared/lib/query/query-keys'
import { searchRecipes } from '../../api/recipes.api'
import { mapExplorerRecipesResponse } from '../mappers/recipes.mapper'
import type { RecipeSummary } from '../types/recipes.model'

export function useRecipeSearch(query: string) {
  const normalizedQuery = query.trim()

  const { data, isLoading, error } = useQuery<RecipeSummary[]>({
    queryKey: queryKeys.recipes.search(normalizedQuery),
    queryFn: async () => {
      const dto = await searchRecipes(normalizedQuery)
      return mapExplorerRecipesResponse(dto)
    },
    enabled: normalizedQuery.length >= 2,
  })

  return {
    data: data ?? [],
    isLoading,
    error: error?.message ?? null,
  }
}
