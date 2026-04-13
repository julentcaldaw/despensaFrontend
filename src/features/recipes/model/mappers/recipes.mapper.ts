import type {
  RecipeDetailDTO,
  RecipesOverviewDataDTO,
  RecipeSummaryDTO,
  RecipesCookableDataDTO,
} from '../dto/recipes.dto'
import type {
  RecipeDifficulty,
  RecipesOverviewData,
  RecipeRequirement,
  RecipeSummary,
  RecipesCookableData,
} from '../types/recipes.model'

function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseDifficulty(value: string): RecipeDifficulty {
  if (value === 'EASY' || value === 'MEDIUM' || value === 'HARD') {
    return value
  }

  return 'EASY'
}

function parseImageUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function parseDetail(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function mapRequirements(requirements: RecipeSummaryDTO['ingredients']): RecipeRequirement[] {
  return requirements.map((requirement) => ({
    ingredientId: requirement.ingredientId,
    ingredientName: requirement.ingredient?.name ?? `Ingrediente ${requirement.ingredientId}`,
    quantity: requirement.quantity,
    unit: requirement.unit,
    inStock: requirement.inStock,
    inShoppingList: Boolean(requirement.inShoppingList),
  }))
}

function mapRecipeSummary(dto: RecipeSummaryDTO, availability: RecipeSummary['availability']): RecipeSummary {
  const dtoWithFallback = dto as RecipeSummaryDTO & { recipeIngredients?: RecipeSummaryDTO['ingredients'] }
  const requirements = dto.ingredients ?? dtoWithFallback.recipeIngredients ?? []
  const ingredientsCount = typeof dto.ingredientsCount === 'number' ? dto.ingredientsCount : requirements.length
  const pantryIngredientsCount =
    typeof dto.pantryIngredientsCount === 'number'
      ? dto.pantryIngredientsCount
      : requirements.filter((requirement) => requirement.inStock).length
  const shoppingListIngredientsCount =
    typeof dto.shoppingListIngredientsCount === 'number'
      ? dto.shoppingListIngredientsCount
      : requirements.filter((requirement) => requirement.inShoppingList).length

  return {
    id: dto.id,
    name: dto.name,
    detail: parseDetail(dto.detail),
    image: parseImageUrl(dto.image),
    availability,
    difficulty: parseDifficulty(dto.difficulty),
    prepTime: typeof dto.prepTime === 'number' ? dto.prepTime : null,
    liked: Boolean(dto.liked ?? dto.like),
    authorName: dto.author?.username ?? 'Usuario',
    authorAvatar: dto.author?.avatar ?? null,
    ingredientsCount,
    pantryIngredientsCount,
    shoppingListIngredientsCount,
    ingredients: mapRequirements(requirements),
    createdAt: parseDate(dto.createdAt),
    updatedAt: parseDate(dto.updatedAt),
  }
}

function inferRecipeAvailability(dto: RecipeDetailDTO): RecipeSummary['availability'] {
  const requirements = dto.ingredients ?? dto.recipeIngredients ?? []
  return requirements.every((requirement) => requirement.inStock) ? 'cookable' : 'almost'
}

function inferRecipeSummaryAvailability(dto: RecipeSummaryDTO): RecipeSummary['availability'] {
  const requirements = dto.ingredients ?? []
  if (requirements.length === 0) {
    return 'almost'
  }

  return requirements.every((requirement) => requirement.inStock) ? 'cookable' : 'almost'
}

export function mapRecipeDetailResponse(dto: RecipeDetailDTO): RecipeSummary {
  return mapRecipeSummary(dto, inferRecipeAvailability(dto))
}

export function mapExplorerRecipesResponse(dtos: RecipeSummaryDTO[]): RecipeSummary[] {
  return dtos.map((item) => mapRecipeSummary(item, inferRecipeSummaryAvailability(item)))
}

export function mapRecipesOverviewResponse(dto: RecipesOverviewDataDTO): RecipesOverviewData {
  return {
    cookable: {
      items: dto.cookable.map((item) => mapRecipeSummary(item, 'cookable')),
      count: dto.cookable.length,
    },
    almostCookable: {
      items: dto.almostCookable.map((item) => mapRecipeSummary(item, 'almost')),
      count: dto.almostCookable.length,
    },
    recipes: {
      items: dto.recipes.items.map((item) => mapRecipeSummary(item, inferRecipeSummaryAvailability(item))),
      total: dto.recipes.total,
      page: dto.recipes.page,
      pageSize: dto.recipes.pageSize,
      totalPages: dto.recipes.totalPages,
    },
  }
}

export function mapCookableRecipesResponse(dto: RecipesCookableDataDTO): RecipesCookableData {
  return {
    cookable: {
      items: dto.cookable.items.map((item) => mapRecipeSummary(item, 'cookable')),
      count: dto.cookable.count,
    },
    almostCookable: {
      items: dto.almostCookable.items.map((item) => mapRecipeSummary(item, 'almost')),
      count: dto.almostCookable.count,
    },
  }
}
