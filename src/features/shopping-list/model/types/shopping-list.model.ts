import type { PantryItemUnit } from '../../../pantry/model/types/pantry.model'

export type ShoppingItemSource = 'manual' | 'pantry_suggestion' | 'recipe_suggestion'
export type ShoppingItemStatus = 'pending' | 'completed'

export type ShoppingListGrouping = 'none' | 'shop' | 'category' | 'shop_category'

export interface ShoppingListItem {
  id: string
  userId: string
  name: string
  quantity: number
  unit: PantryItemUnit
  source: ShoppingItemSource
  status: ShoppingItemStatus
  shopId: number | null
  shopName: string | null
  categoryName: string | null
  categoryIcon: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateShoppingItemInput {
  ingredientId: number
  quantity: number
  unit: PantryItemUnit
}

export interface UpdateShoppingItemInput {
  name?: string
  quantity?: number
  unit?: PantryItemUnit
  status?: ShoppingItemStatus
  shopId?: number | null
}
