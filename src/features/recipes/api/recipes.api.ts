import { apiClient } from '../../../shared/lib/http/api-client'
import type {
  RecipesCookableDataDTO,
  RecipesCookableResponseDTO,
} from '../model/dto/recipes.dto'

const ENDPOINT = '/recipes/cookable'

function emptyData(): RecipesCookableDataDTO {
  return {
    cookable: { items: [], count: 0 },
    almostCookable: { items: [], count: 0 },
  }
}

function extractCookableData(payload: unknown): RecipesCookableDataDTO {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as RecipesCookableResponseDTO).data

    if (
      data &&
      typeof data === 'object' &&
      'cookable' in data &&
      'almostCookable' in data
    ) {
      return data
    }
  }

  return emptyData()
}

export async function fetchCookableRecipes(): Promise<RecipesCookableDataDTO> {
  const response = await apiClient.get<unknown>(ENDPOINT)
  return extractCookableData(response)
}

export async function updateRecipeLike(recipeId: number, like: boolean): Promise<void> {
  await apiClient.post<{ like: boolean }, unknown>(`/recipes/${recipeId}/like`, { like })
}
