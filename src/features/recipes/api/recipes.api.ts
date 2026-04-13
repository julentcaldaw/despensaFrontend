import { apiClient } from '../../../shared/lib/http/api-client'
import type {
  CreateRecipeRequestDTO,
  CreateRecipeResponseDTO,
  RecipeDetailDTO,
  RecipeDetailResponseDTO,
  RecipeSummaryDTO,
  RecipesOverviewDataDTO,
  RecipesOverviewResponseDTO,
  RecipesCookableDataDTO,
  RecipesCookableResponseDTO,
  RecipesExplorerResponseDTO,
} from '../model/dto/recipes.dto'

const COOKABLE_ENDPOINT = '/recipes/cookable'

function emptyData(): RecipesCookableDataDTO {
  return {
    cookable: { items: [], count: 0 },
    almostCookable: { items: [], count: 0 },
  }
}

function emptyOverviewData(): RecipesOverviewDataDTO {
  return {
    cookable: [],
    almostCookable: [],
    recipes: {
      items: [],
      total: 0,
      page: 1,
      pageSize: 30,
      totalPages: 1,
    },
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

function extractOverviewData(payload: unknown): RecipesOverviewDataDTO {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return emptyOverviewData()
  }

  const data = (payload as RecipesOverviewResponseDTO).data
  if (!data || typeof data !== 'object') {
    return emptyOverviewData()
  }

  const cookable = Array.isArray(data.cookable) ? data.cookable.filter((item) => isRecipeSummaryDTO(item)) : []
  const almostCookable = Array.isArray(data.almostCookable)
    ? data.almostCookable.filter((item) => isRecipeSummaryDTO(item))
    : []

  const recipesData =
    data.recipes &&
    typeof data.recipes === 'object' &&
    'items' in data.recipes &&
    Array.isArray(data.recipes.items)
      ? data.recipes
      : emptyOverviewData().recipes

  return {
    cookable,
    almostCookable,
    recipes: {
      items: recipesData.items.filter((item) => isRecipeSummaryDTO(item)),
      total: typeof recipesData.total === 'number' ? recipesData.total : 0,
      page: typeof recipesData.page === 'number' ? recipesData.page : 1,
      pageSize: typeof recipesData.pageSize === 'number' ? recipesData.pageSize : 30,
      totalPages: typeof recipesData.totalPages === 'number' ? recipesData.totalPages : 1,
    },
  }
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

function isRecipeSummaryDTO(value: unknown): value is RecipeSummaryDTO {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'id' in value &&
      'name' in value,
  )
}

function extractExplorerRecipes(payload: unknown): RecipeSummaryDTO[] {
  if (Array.isArray(payload)) {
    return payload.filter((item) => isRecipeSummaryDTO(item))
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'items' in payload &&
    Array.isArray((payload as { items: unknown[] }).items)
  ) {
    return (payload as { items: unknown[] }).items.filter((item) => isRecipeSummaryDTO(item))
  }

  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return []
  }

  const data = (payload as RecipesExplorerResponseDTO).data

  if (Array.isArray(data)) {
    return data.filter((item) => isRecipeSummaryDTO(item))
  }

  if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
    return data.items.filter((item) => isRecipeSummaryDTO(item))
  }

  return []
}

export async function fetchCookableRecipes(): Promise<RecipesCookableDataDTO> {
  const response = await apiClient.get<unknown>(COOKABLE_ENDPOINT)
  return extractCookableData(response)
}

export async function fetchRecipesOverview(page: number): Promise<RecipesOverviewDataDTO> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const response = await apiClient.get<unknown>(`/recipes/overview?page=${safePage}`)
  return extractOverviewData(response)
}

export async function fetchRecipeDetail(recipeId: number): Promise<RecipeDetailDTO | null> {
  const response = await apiClient.get<unknown>(`/recipes/${recipeId}`)
  return extractRecipeDetailData(response)
}

export async function fetchExplorerRecipes(): Promise<RecipeSummaryDTO[]> {
  const response = await apiClient.get<unknown>('/recipes')
  return extractExplorerRecipes(response)
}

export async function searchRecipes(query: string): Promise<RecipeSummaryDTO[]> {
  const normalized = query.trim()

  if (!normalized) {
    return []
  }

  const encodedQuery = encodeURIComponent(normalized)
  const response = await apiClient.get<unknown>(`/recipes/search?query=${encodedQuery}`)
  return extractExplorerRecipes(response)
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
