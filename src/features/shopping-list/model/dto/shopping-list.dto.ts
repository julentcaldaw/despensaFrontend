export interface ShoppingCategoryDTO {
  id?: number
  name?: string
  icon?: string | null
}

export interface ShoppingIngredientDTO {
  id?: number
  name?: string
  category?: ShoppingCategoryDTO | null
}

export interface ShoppingShopDTO {
  id?: number
  name?: string
}

export interface ShoppingListItemDTO {
  id: number
  userId: number
  ingredientId?: number
  orderId?: number | null
  shopId?: number | null
  name?: string
  quantity: number | null
  unit: string | null
  checked?: boolean
  source?: string
  status?: string
  shop?: ShoppingShopDTO | null
  category?: ShoppingCategoryDTO | null
  ingredient?: ShoppingIngredientDTO | null
  createdAt: string
  updatedAt: string
}

export interface CreateShoppingItemRequest {
  ingredientId: number
  quantity: number
  unit: string
  source?: 'manual'
}

export interface UpdateShoppingItemRequest {
  name?: string
  quantity?: number
  unit?: string
  shopId?: number | null
  status?: 'pending' | 'completed'
  checked?: boolean
}

export interface ShoppingItemsEnvelopeResponse {
  ok?: boolean
  data: ShoppingListItemDTO[]
}

export interface ShoppingItemsPaginatedEnvelopeResponse {
  ok?: boolean
  data: {
    items: ShoppingListItemDTO[]
    count?: number
  }
}

export interface ShoppingItemEnvelopeResponse {
  ok?: boolean
  data: ShoppingListItemDTO
}
