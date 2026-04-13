export type RecipeDifficultyDTO = 'EASY' | 'MEDIUM' | 'HARD'

export interface RecipeAuthorDTO {
  id: number
  username: string
  avatar: string | null
}

export interface RecipeIngredientCategoryDTO {
  id: number
  name: string
  icon: string | null
}

export interface RecipeIngredientDTO {
  id: number
  name: string
  category: RecipeIngredientCategoryDTO | null
}

export interface RecipeRequirementDTO {
  ingredientId: number
  quantity: number | null
  unit: string | null
  inStock: boolean
  inShoppingList?: boolean
  ingredient: RecipeIngredientDTO
}

export interface RecipeSummaryDTO {
  id: number
  name: string
  detail?: string | null
  image?: string | null
  difficulty: RecipeDifficultyDTO
  prepTime: number | null
  authorId?: number | null
  createdAt: string
  updatedAt: string
  liked?: boolean
  like?: boolean
  author: RecipeAuthorDTO | null
  ingredientsCount?: number
  pantryIngredientsCount?: number
  shoppingListIngredientsCount?: number
  ingredients: RecipeRequirementDTO[]
}

export type RecipeDetailDTO = RecipeSummaryDTO & {
  recipeIngredients?: RecipeRequirementDTO[]
}

export interface RecipesCookableBucketDTO {
  items: RecipeSummaryDTO[]
  count: number
}

export interface RecipesOverviewPageDTO {
  items: RecipeSummaryDTO[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RecipesCookableDataDTO {
  cookable: RecipesCookableBucketDTO
  almostCookable: RecipesCookableBucketDTO
}

export interface RecipesOverviewDataDTO {
  cookable: RecipeSummaryDTO[]
  almostCookable: RecipeSummaryDTO[]
  recipes: RecipesOverviewPageDTO
}

export interface RecipesCookableResponseDTO {
  ok: boolean
  data: RecipesCookableDataDTO
}

export interface RecipesOverviewResponseDTO {
  ok: boolean
  data: RecipesOverviewDataDTO
}

export interface RecipesExplorerResponseDTO {
  ok: boolean
  data: RecipeSummaryDTO[] | { items: RecipeSummaryDTO[] }
}

export interface RecipeDetailResponseDTO {
  ok: boolean
  data: RecipeDetailDTO
}

export interface CreateRecipeIngredientRequestDTO {
  ingredientId: number
  quantity: number
  unit: string
}

export interface CreateRecipeRequestDTO {
  name: string
  detail: string
  image?: string
  difficulty: RecipeDifficultyDTO
  prepTime: number
  ingredients: CreateRecipeIngredientRequestDTO[]
}

export interface CreateRecipeResponseDTO {
  ok: boolean
  data: RecipeDetailDTO
}
