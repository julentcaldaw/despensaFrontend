import { useQuery } from '@tanstack/react-query'
import { fetchRecipesOverview } from '../../api/recipes.api'
import { mapRecipesOverviewResponse } from '../mappers/recipes.mapper'
import type { RecipesOverviewData } from '../types/recipes.model'
import { queryKeys } from '../../../../shared/lib/query/query-keys'

const emptyData: RecipesOverviewData = {
  cookable: { items: [], count: 0 },
  almostCookable: { items: [], count: 0 },
  recipes: { items: [], total: 0, page: 1, pageSize: 30, totalPages: 1 },
}

export function useRecipes(page: number) {
  const { data, isLoading, error } = useQuery<RecipesOverviewData>({
    queryKey: queryKeys.recipes.overview(page),
    queryFn: async () => {
      const dto = await fetchRecipesOverview(page)
      return mapRecipesOverviewResponse(dto)
    },
  })

  return {
    data: data ?? emptyData,
    isLoading,
    error: error?.message ?? null,
  }
}
