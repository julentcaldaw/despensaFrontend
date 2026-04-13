export type RecipeDifficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type RecipeAvailability = 'cookable' | 'almost'

export interface RecipeRequirement {
  ingredientId: number
  ingredientName: string
  quantity: number | null
  unit: string | null
  inStock: boolean
  inShoppingList: boolean
}

export interface RecipeSummary {
  id: number
  name: string
  detail: string | null
  image: string | null
  availability: RecipeAvailability
  difficulty: RecipeDifficulty
  prepTime: number | null
  liked: boolean
  authorName: string
  authorAvatar: string | null
  ingredientsCount: number
  pantryIngredientsCount: number
  shoppingListIngredientsCount: number
  ingredients: RecipeRequirement[]
  createdAt: Date | null
  updatedAt: Date | null
}

export interface RecipesCookableSection {
  items: RecipeSummary[]
  count: number
}

export interface RecipesPaginatedSection {
  items: RecipeSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RecipesCookableData {
  cookable: RecipesCookableSection
  almostCookable: RecipesCookableSection
}

export interface RecipesOverviewData {
  cookable: RecipesCookableSection
  almostCookable: RecipesCookableSection
  recipes: RecipesPaginatedSection
}
