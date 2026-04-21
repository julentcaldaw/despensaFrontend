import { useQuery } from '@tanstack/react-query'
import type { Order, OrderItem, OrdersListResponse } from '../model/orders.model'
import { apiClient } from '../../../shared/lib/http/api-client'

type RawShoppingItem = {
  id?: string | number
  ingredientId?: number
  shopId?: number | null
  orderId?: string | number
  quantity?: number
  unit?: string
  checked?: boolean
  ingredient?: {
    id?: number
    name?: string
    category?: {
      id?: number
      name?: string
      icon?: string
    }
  }
  shop?: {
    id?: number
    name?: string
  }
}

type RawOrder = {
  id: string | number
  userId: string | number
  shopId?: number | null
  date?: string
  createdAt?: string
  updatedAt?: string
  items?: RawShoppingItem[]
  shoppingItems?: RawShoppingItem[]
  price?: number
  total?: number
  ticket?: string | null
  user?: {
    id?: string | number
    email?: string
    username?: string
    avatar?: string
  }
  shop?: {
    id?: number
    name?: string
  }
}

function mapOrderItem(item: RawShoppingItem): OrderItem {
  return {
    id: String(item.id ?? item.ingredientId ?? ''),
    productId: String(item.ingredientId ?? item.id ?? ''),
    ingredientId: item.ingredientId ?? item.ingredient?.id ?? 0,
    orderId: String(item.orderId ?? ''),
    shopId: item.shopId ?? item.shop?.id ?? null,
    quantity: item.quantity ?? 0,
    unit: item.unit ?? 'UNIT',
    checked: Boolean(item.checked),
    name: item.ingredient?.name ?? 'Ingrediente sin nombre',
    categoryName: item.ingredient?.category?.name ?? null,
    categoryIcon: item.ingredient?.category?.icon ?? null,
    shopName: item.shop?.name ?? null,
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const data = await apiClient.get<OrdersListResponse | RawOrder[]>('/orders')
  let orders: RawOrder[] = []

  if (Array.isArray(data)) {
    orders = data
  } else if (data && Array.isArray(data.data)) {
    orders = data.data as unknown as RawOrder[]
  }

  return orders.map((order) => {
    const shoppingItems = Array.isArray(order.shoppingItems)
      ? order.shoppingItems
      : Array.isArray(order.items)
        ? order.items
        : []

    return {
      id: String(order.id),
      userId: String(order.userId),
      shopId: order.shopId ?? order.shop?.id ?? null,
      date: order.date ?? '',
      createdAt: order.createdAt ?? order.date ?? '',
      updatedAt: order.updatedAt ?? order.createdAt ?? order.date ?? '',
      total: order.price ?? order.total ?? 0,
      ticket: order.ticket ?? null,
      items: shoppingItems.map(mapOrderItem),
      shop: order.shop ? { id: order.shop.id ?? 0, name: order.shop.name ?? 'Tienda desconocida' } : undefined,
      shopName: order.shop?.name,
      user: order.user
        ? {
            id: String(order.user.id ?? ''),
            email: order.user.email ?? '',
            username: order.user.username ?? '',
            avatar: order.user.avatar ?? '',
          }
        : undefined,
    }
  })
}

export function useOrders() {
  return useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })
}
