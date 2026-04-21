export type OrderUser = {
  id: string
  email: string
  username: string
  avatar: string
}

export type OrderShop = {
  id: number
  name: string
}

export type OrderItem = {
  id: string
  productId: string
  ingredientId: number
  orderId: string
  shopId: number | null
  quantity: number
  unit: string
  checked: boolean
  name: string
  categoryName: string | null
  categoryIcon: string | null
  shopName: string | null
}

export type Order = {
  id: string
  userId: string
  shopId: number | null
  date: string
  createdAt: string
  updatedAt: string
  total: number
  ticket: string | null
  items: OrderItem[]
  shop?: OrderShop
  shopName?: string
  user?: OrderUser
}

export type OrdersListResponse = {
  data: Order[]
}
