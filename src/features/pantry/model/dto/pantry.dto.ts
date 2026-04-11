/**
 * Data Transfer Objects for Pantry API responses
 * Represents the raw shape of data from the backend
 */

export type PantryItemConservation = 'NEVERA' | 'CONGELADOR' | 'DESPENSA'

export interface PantryCategoryDTO {
  id?: number
  name?: string
  icon?: string | null
}

export interface PantryIngredientDTO {
  id: number
  name: string
  category?: PantryCategoryDTO | null
}

export interface PantryShopDTO {
  id: number
  name: string
}

export interface PantryItemDTO {
  id: number
  userId: number
  ingredientId?: number
  acquiredAt: string
  expiresAt: string | null
  quantity: number | null
  unit: string | null
  conservation: PantryItemConservation
  shopId?: number | null
  createdAt: string
  updatedAt: string
  ingredient: PantryIngredientDTO
  category?: PantryCategoryDTO | null
  shop: PantryShopDTO | null
}

export interface CreatePantryItemRequest {
  ingredientId: number
  quantity: number
  unit: string
  conservation: PantryItemConservation
  expiresAt?: string | null
}

export interface UpdatePantryItemRequest {
  ingredientId?: number
  quantity?: number
  unit?: string
  conservation?: PantryItemConservation
  expiresAt?: string | null
}

export interface PantryItemsEnvelopeResponse {
  ok: boolean
  data: PantryItemDTO[]
}

export interface PantryItemEnvelopeResponse {
  ok: boolean
  data: PantryItemDTO
}
