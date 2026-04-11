import { PANTRY_ITEM_UNITS, type PantryItemUnit } from '../../../pantry/model/types/pantry.model'
import type { ShoppingListItemDTO } from '../dto/shopping-list.dto'
import type {
  ShoppingItemSource,
  ShoppingItemStatus,
  ShoppingListItem,
} from '../types/shopping-list.model'

const UNIT_SET = new Set<string>(PANTRY_ITEM_UNITS)

function parseDate(value: string | null | undefined): Date {
  if (!value) {
    return new Date()
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function parseUnit(value: string | null | undefined): PantryItemUnit {
  if (!value) {
    return 'UNIT'
  }

  const normalized = value.trim().toUpperCase()
  return UNIT_SET.has(normalized) ? (normalized as PantryItemUnit) : 'UNIT'
}

function parseSource(value: string | null | undefined): ShoppingItemSource {
  if (value === 'pantry_suggestion' || value === 'recipe_suggestion' || value === 'manual') {
    return value
  }

  return 'manual'
}

function parseStatus(value: string | null | undefined, checked?: boolean): ShoppingItemStatus {
  if (typeof checked === 'boolean') {
    return checked ? 'completed' : 'pending'
  }

  if (value === 'completed') {
    return 'completed'
  }

  return 'pending'
}

function extractCategoryName(dto: ShoppingListItemDTO): string | null {
  if (dto.category?.name) {
    return dto.category.name
  }

  if (dto.ingredient?.category?.name) {
    return dto.ingredient.category.name
  }

  return null
}

function extractCategoryIcon(dto: ShoppingListItemDTO): string | null {
  if (dto.category?.icon) {
    return dto.category.icon
  }

  if (dto.ingredient?.category?.icon) {
    return dto.ingredient.category.icon
  }

  return null
}

export function mapShoppingItemDtoToModel(dto: ShoppingListItemDTO): ShoppingListItem {
  const fallbackName = dto.ingredientId ? `Ingrediente ${dto.ingredientId}` : 'Ingrediente'

  return {
    id: String(dto.id),
    userId: String(dto.userId),
    name: dto.name ?? dto.ingredient?.name ?? fallbackName,
    quantity: dto.quantity ?? 1,
    unit: parseUnit(dto.unit),
    source: parseSource(dto.source),
    status: parseStatus(dto.status, dto.checked),
    shopId: dto.shopId ?? dto.shop?.id ?? null,
    shopName: dto.shop?.name ?? null,
    categoryName: extractCategoryName(dto),
    categoryIcon: extractCategoryIcon(dto),
    createdAt: parseDate(dto.createdAt),
    updatedAt: parseDate(dto.updatedAt),
  }
}

export function mapShoppingItemsResponse(dtos: ShoppingListItemDTO[]): ShoppingListItem[] {
  return dtos.map(mapShoppingItemDtoToModel)
}
