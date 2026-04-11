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
  ingredient: RecipeIngredientDTO
}

export interface RecipeSummaryDTO {
  id: number
  name: string
  difficulty: RecipeDifficultyDTO
  prepTime: number | null
  createdAt: string
  updatedAt: string
  like: boolean
  author: RecipeAuthorDTO | null
  ingredientsCount: number
  ingredients: RecipeRequirementDTO[]
}

export interface RecipesCookableBucketDTO {
  items: RecipeSummaryDTO[]
  count: number
}

export interface RecipesCookableDataDTO {
  cookable: RecipesCookableBucketDTO
  almostCookable: RecipesCookableBucketDTO
}

export interface RecipesCookableResponseDTO {
  ok: boolean
  data: RecipesCookableDataDTO
}
