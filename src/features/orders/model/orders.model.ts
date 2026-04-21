// Tipos para órdenes de compra
export type Order = {
  id: string;
  userId: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
}

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrdersListResponse = {
  data: Order[];
}
