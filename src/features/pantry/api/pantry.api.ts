/**
 * Pantry API functions
 * Handles all HTTP calls to /api/pantry-items
 */

import { apiClient } from '../../../shared/lib/http/api-client'
import type {
  CreatePantryItemRequest,
  PantryItemDTO,
  PantryItemEnvelopeResponse,
  PantryItemsEnvelopeResponse,
  UpdatePantryItemRequest,
} from '../model/dto/pantry.dto'
import type { CreatePantryItemInput, UpdatePantryItemInput } from '../model/types/pantry.model'

const ENDPOINT = '/pantry-items'

export interface IngredientSearchResult {
  id: number
  name: string
}

function extractItemsFromResponse(payload: unknown): PantryItemDTO[] {
  if (Array.isArray(payload)) {
    return payload as PantryItemDTO[]
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as PantryItemsEnvelopeResponse).data)
  ) {
    return (payload as PantryItemsEnvelopeResponse).data
  }

  return []
}

function extractItemFromResponse(payload: unknown): PantryItemDTO {
  if (payload && typeof payload === 'object' && 'ingredientId' in payload) {
    return payload as PantryItemDTO
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as PantryItemEnvelopeResponse).data
  ) {
    return (payload as PantryItemEnvelopeResponse).data
  }

  throw new Error('Formato de respuesta no valido')
}

function extractIngredientsFromResponse(payload: unknown): IngredientSearchResult[] {
  if (Array.isArray(payload)) {
    return payload
      .filter((item): item is IngredientSearchResult => {
        return (
          Boolean(item) &&
          typeof item === 'object' &&
          'id' in item &&
          'name' in item &&
          typeof (item as { id: unknown }).id === 'number' &&
          typeof (item as { name: unknown }).name === 'string'
        )
      })
      .slice(0, 10)
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return extractIngredientsFromResponse((payload as { data: unknown[] }).data)
  }

  return []
}

/**
 * Fetch all pantry items for the authenticated user
 */
export async function fetchPantryItems(): Promise<PantryItemDTO[]> {
  const response = await apiClient.get<unknown>(ENDPOINT)
  return extractItemsFromResponse(response)
}

export async function searchIngredients(query: string): Promise<IngredientSearchResult[]> {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) {
    return []
  }

  const response = await apiClient.get<unknown>(
    `/ingredients/search?query=${encodeURIComponent(normalizedQuery)}`,
  )

  return extractIngredientsFromResponse(response)
}

/**
 * Create a new pantry item
 */
export async function createPantryItem(input: CreatePantryItemInput): Promise<PantryItemDTO> {
  const requestBody: CreatePantryItemRequest = {
    ingredientId: input.ingredientId,
    quantity: input.quantity,
    unit: input.unit,
    conservation: input.conservation,
    expiresAt: input.expiresAt
      ? input.expiresAt instanceof Date
        ? input.expiresAt.toISOString()
        : String(input.expiresAt)
      : null,
  }

  const response = await apiClient.post<typeof requestBody, unknown>(
    ENDPOINT,
    requestBody,
  )
  return extractItemFromResponse(response)
}

/**
 * Update an existing pantry item
 */
export async function updatePantryItem(
  itemId: string,
  input: UpdatePantryItemInput,
): Promise<PantryItemDTO> {
  const requestBody: UpdatePantryItemRequest = {
    ...(input.ingredientId !== undefined && { ingredientId: input.ingredientId }),
    ...(input.quantity !== undefined && { quantity: input.quantity }),
    ...(input.unit !== undefined && { unit: input.unit }),
    ...(input.conservation !== undefined && { conservation: input.conservation }),
    ...(input.expiresAt !== undefined && {
      expiresAt: input.expiresAt
        ? input.expiresAt instanceof Date
          ? input.expiresAt.toISOString()
          : String(input.expiresAt)
        : null,
    }),
  }

  const response = await apiClient.patch<typeof requestBody, unknown>(
    `${ENDPOINT}/${itemId}`,
    requestBody,
  )
  return extractItemFromResponse(response)
}

/**
 * Delete a pantry item
 */
export async function deletePantryItem(itemId: string): Promise<void> {
  const response = await apiClient.delete<{ ok: boolean }>(`${ENDPOINT}/${itemId}`)
  if (!response?.ok) {
    throw new Error('Failed to delete pantry item')
  }
}

/**
 * Mark an item as consumed
 */
export async function consumePantryItem(itemId: string): Promise<PantryItemDTO> {
  return updatePantryItem(itemId, { quantity: 0 })
}
