import { useQuery } from '@tanstack/react-query'
import { fetchCookableRecipes } from '../../api/recipes.api'
import { mapCookableRecipesResponse } from '../mappers/recipes.mapper'
import type { RecipesCookableData } from '../types/recipes.model'
import { queryKeys } from '../../../../shared/lib/query/query-keys'

export function useRecipes() {
  const { data, isLoading, error } = useQuery<RecipesCookableData>({
    queryKey: queryKeys.recipes.cookable(),
    queryFn: async () => {
      const dto = await fetchCookableRecipes()
      return mapCookableRecipesResponse(dto)
    },
  })

  return {
    data: data ?? { cookable: { items: [], count: 0 }, almostCookable: { items: [], count: 0 } },
    isLoading,
    error: error?.message ?? null,
  }
}
