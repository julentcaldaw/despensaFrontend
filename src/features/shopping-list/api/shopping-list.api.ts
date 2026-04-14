import { apiClient } from '../../../shared/lib/http/api-client'
import type {
  CreateShoppingItemRequest,
  ShoppingItemEnvelopeResponse,
  ShoppingItemsEnvelopeResponse,
  ShoppingItemsPaginatedEnvelopeResponse,
  ShoppingListItemDTO,
  UpdateShoppingItemRequest,
} from '../model/dto/shopping-list.dto'
import type {
  CreateOrderInput,
  CreateShoppingItemInput,
  UpdateShoppingItemInput,
} from '../model/types/shopping-list.model'

const ENDPOINT = '/shopping-items'

function isShoppingListItemDTO(value: unknown): value is ShoppingListItemDTO {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'userId' in value &&
    'createdAt' in value &&
    'updatedAt' in value
  )
}

function extractItemsFromResponse(payload: unknown): ShoppingListItemDTO[] {
  if (Array.isArray(payload)) {
    return payload.filter(isShoppingListItemDTO)
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as ShoppingItemsEnvelopeResponse).data)
  ) {
    return (payload as ShoppingItemsEnvelopeResponse).data.filter(isShoppingListItemDTO)
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as ShoppingItemsPaginatedEnvelopeResponse).data &&
    Array.isArray((payload as ShoppingItemsPaginatedEnvelopeResponse).data.items)
  ) {
    return (payload as ShoppingItemsPaginatedEnvelopeResponse).data.items.filter(
      isShoppingListItemDTO,
    )
  }

  return []
}

function extractItemFromResponse(payload: unknown): ShoppingListItemDTO {
  if (isShoppingListItemDTO(payload)) {
    return payload
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    isShoppingListItemDTO((payload as ShoppingItemEnvelopeResponse).data)
  ) {
    return (payload as ShoppingItemEnvelopeResponse).data
  }

  throw new Error('Formato de respuesta no valido')
}

function mapCreateRequest(input: CreateShoppingItemInput): CreateShoppingItemRequest {
  return {
    ingredientId: input.ingredientId,
    quantity: input.quantity,
    unit: input.unit,
    source: 'manual',
  }
}

function mapUpdateRequest(input: UpdateShoppingItemInput): UpdateShoppingItemRequest {
  const checked =
    input.status === undefined ? undefined : input.status === 'completed'

  return {
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    shopId: input.shopId,
    checked,
  }
}

export async function fetchShoppingItems(): Promise<ShoppingListItemDTO[]> {
  const response = await apiClient.get<unknown>(ENDPOINT)
  return extractItemsFromResponse(response)
}

export async function createShoppingItem(
  input: CreateShoppingItemInput,
): Promise<ShoppingListItemDTO> {
  const response = await apiClient.post<CreateShoppingItemRequest, unknown>(
    ENDPOINT,
    mapCreateRequest(input),
  )

  return extractItemFromResponse(response)
}

export async function updateShoppingItem(
  itemId: string,
  input: UpdateShoppingItemInput,
): Promise<ShoppingListItemDTO> {
  const response = await apiClient.patch<UpdateShoppingItemRequest, unknown>(
    `${ENDPOINT}/${itemId}`,
    mapUpdateRequest(input),
  )

  return extractItemFromResponse(response)
}

export async function deleteShoppingItem(itemId: string): Promise<void> {
  await apiClient.delete<unknown>(`${ENDPOINT}/${itemId}`)
}

export async function createOrder(input: CreateOrderInput): Promise<void> {
  const formData = new FormData()
  formData.append('shopId', String(input.shopId))
  formData.append('price', String(input.price))
  formData.append('date', input.date)
  input.shopItems.forEach((itemId) => {
    formData.append('shopItems[]', String(itemId))
  })

  if (input.imageFile) {
    formData.append('image', input.imageFile)
  }

  await apiClient.postFormData<unknown>('/orders', formData)
}
