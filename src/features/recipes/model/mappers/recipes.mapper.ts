import type {
  RecipeDetailDTO,
  RecipeSummaryDTO,
  RecipesCookableDataDTO,
} from '../dto/recipes.dto'
import type {
  RecipeDifficulty,
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
    ingredients: mapRequirements(requirements),
    createdAt: parseDate(dto.createdAt),
    updatedAt: parseDate(dto.updatedAt),
  }
}

function inferRecipeAvailability(dto: RecipeDetailDTO): RecipeSummary['availability'] {
  const requirements = dto.ingredients ?? dto.recipeIngredients ?? []
  return requirements.every((requirement) => requirement.inStock) ? 'cookable' : 'almost'
}

export function mapRecipeDetailResponse(dto: RecipeDetailDTO): RecipeSummary {
  return mapRecipeSummary(dto, inferRecipeAvailability(dto))
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
