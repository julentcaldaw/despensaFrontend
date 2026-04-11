/**
 * Domain types for frontend logic
 * Normalized and type-safe representation of pantry items
 */

export type PantryItemStatus = 'in_stock' | 'low_stock' | 'consumed'
export type PantryItemConservation = 'NEVERA' | 'CONGELADOR' | 'DESPENSA'
export const PANTRY_ITEM_UNITS = [
  'G',
  'KG',
  'ML',
  'L',
  'UNIT',
  'PACK',
  'CAN',
  'BOTTLE',
  'JAR',
  'BOX',
  'BAG',
  'TBSP',
  'TSP',
  'SLICE',
  'CLOVE',
] as const
export type PantryItemUnit = (typeof PANTRY_ITEM_UNITS)[number]

export const PANTRY_UNIT_LABELS: Record<PantryItemUnit, string> = {
  G: 'g',
  KG: 'kg',
  ML: 'ml',
  L: 'l',
  UNIT: 'unidad',
  PACK: 'paquete',
  CAN: 'lata',
  BOTTLE: 'botella',
  JAR: 'tarro',
  BOX: 'caja',
  BAG: 'bolsa',
  TBSP: 'cucharada',
  TSP: 'cucharadita',
  SLICE: 'rebanada',
  CLOVE: 'diente',
}

export interface PantryItem {
  id: string
  userId: string
  ingredientId: number
  ingredientName: string
  shopName: string | null
  categoryName: string | null
  categoryIcon: string | null
  quantity: number
  unit: PantryItemUnit
  conservation: PantryItemConservation
  status: PantryItemStatus
  acquiredAt: Date | null
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreatePantryItemInput {
  ingredientId: number
  quantity: number
  unit: PantryItemUnit
  conservation: PantryItemConservation
  expiresAt?: Date | null
}

export interface UpdatePantryItemInput {
  ingredientId?: number
  quantity?: number
  unit?: PantryItemUnit
  conservation?: PantryItemConservation
  expiresAt?: Date | null
}
