import type {
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

function mapRequirements(requirements: RecipeSummaryDTO['ingredients']): RecipeRequirement[] {
  return requirements.map((requirement) => ({
    ingredientId: requirement.ingredientId,
    ingredientName: requirement.ingredient?.name ?? `Ingrediente ${requirement.ingredientId}`,
    quantity: requirement.quantity,
    unit: requirement.unit,
    inStock: requirement.inStock,
  }))
}

function mapRecipeSummary(dto: RecipeSummaryDTO, availability: RecipeSummary['availability']): RecipeSummary {
  const dtoWithFallback = dto as RecipeSummaryDTO & { recipeIngredients?: RecipeSummaryDTO['ingredients'] }
  const requirements = dto.ingredients ?? dtoWithFallback.recipeIngredients ?? []

  return {
    id: dto.id,
    name: dto.name,
    availability,
    difficulty: parseDifficulty(dto.difficulty),
    prepTime: typeof dto.prepTime === 'number' ? dto.prepTime : null,
    like: Boolean(dto.like),
    authorName: dto.author?.username ?? 'Usuario',
    authorAvatar: dto.author?.avatar ?? null,
    ingredientsCount: dto.ingredientsCount,
    ingredients: mapRequirements(requirements),
    createdAt: parseDate(dto.createdAt),
    updatedAt: parseDate(dto.updatedAt),
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
