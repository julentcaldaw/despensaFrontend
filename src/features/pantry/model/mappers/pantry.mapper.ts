/**
 * Mapper: DTO → Domain Model
 * Converts raw API responses to type-safe frontend models
 */

import type { PantryItemDTO } from '../dto/pantry.dto'
import { PANTRY_ITEM_UNITS, type PantryItem, type PantryItemUnit } from '../types/pantry.model'

const PANTRY_UNIT_SET = new Set<string>(PANTRY_ITEM_UNITS)

/**
 * Safely parse ISO date string to Date or null
 */
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

function parseUnit(unit: string | null | undefined): PantryItemUnit {
  if (!unit) return 'UNIT'
  const normalized = unit.trim().toUpperCase()
  return PANTRY_UNIT_SET.has(normalized) ? (normalized as PantryItemUnit) : 'UNIT'
}

/**
 * Convert DTO to domain model
 */
export function mapPantryItemDtoToModel(dto: PantryItemDTO): PantryItem {
  const quantity = dto.quantity ?? 1
  const status = quantity <= 0 ? 'consumed' : quantity <= 1 ? 'low_stock' : 'in_stock'
  const category = dto.category ?? dto.ingredient?.category ?? null

  return {
    id: String(dto.id),
    userId: String(dto.userId),
    ingredientId: dto.ingredientId ?? dto.ingredient?.id ?? 0,
    ingredientName: dto.ingredient?.name ?? `Ingrediente ${dto.ingredientId ?? dto.id}`,
    shopName: dto.shop?.name ?? null,
    categoryName: category?.name ?? null,
    categoryIcon: category?.icon ?? null,
    quantity,
    unit: parseUnit(dto.unit),
    conservation: dto.conservation,
    status,
    acquiredAt: parseDate(dto.acquiredAt),
    expiresAt: parseDate(dto.expiresAt),
    createdAt: parseDate(dto.createdAt) ?? new Date(),
    updatedAt: parseDate(dto.updatedAt) ?? new Date(),
  }
}

/**
 * Convert multiple DTOs to domain models
 */
export function mapPantryItemsResponse(dtos: PantryItemDTO[]): PantryItem[] {
  return dtos.map(mapPantryItemDtoToModel)
}
