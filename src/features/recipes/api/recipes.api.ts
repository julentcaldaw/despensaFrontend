import { apiClient } from '../../../shared/lib/http/api-client'
import type {
  CreateRecipeRequestDTO,
  CreateRecipeResponseDTO,
  RecipeDetailDTO,
  RecipeDetailResponseDTO,
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

function extractRecipeDetailData(payload: unknown): RecipeDetailDTO | null {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return null
  }

  const data = (payload as RecipeDetailResponseDTO).data

  if (!data || typeof data !== 'object' || !('id' in data) || !('name' in data)) {
    return null
  }

  return data
}

export async function fetchCookableRecipes(): Promise<RecipesCookableDataDTO> {
  const response = await apiClient.get<unknown>(ENDPOINT)
  return extractCookableData(response)
}

export async function fetchRecipeDetail(recipeId: number): Promise<RecipeDetailDTO | null> {
  const response = await apiClient.get<unknown>(`/recipes/${recipeId}`)
  return extractRecipeDetailData(response)
}

export async function createRecipe(input: CreateRecipeRequestDTO): Promise<RecipeDetailDTO | null> {
  const response = await apiClient.post<CreateRecipeRequestDTO, unknown>('/recipes', input)

  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as CreateRecipeResponseDTO).data
    if (data && typeof data === 'object' && 'id' in data && 'name' in data) {
      return data
    }
  }

  return null
}

export async function updateRecipeLike(recipeId: number, like: boolean): Promise<void> {
  await apiClient.post<{ like: boolean }, unknown>(`/recipes/${recipeId}/like`, { like })
}
