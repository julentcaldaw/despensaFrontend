import { useQuery } from '@tanstack/react-query';
import type { Order } from "../model/orders.model";
import { apiClient } from '../../../shared/lib/http/api-client';

type RawOrder = {
  id: string | number;
  userId: string | number;
  date?: string;
  createdAt?: string;
  items?: any[];
  price?: number;
  total?: number;
  [key: string]: any; 
};

export async function fetchOrders(): Promise<Order[]> {
  // apiClient.get añade el token automáticamente
  const data = await apiClient.get<{ data?: RawOrder[]; ok?: boolean } | RawOrder[]>('/orders');
  let orders: RawOrder[] = [];
  if (Array.isArray(data)) orders = data;
  else if (data && Array.isArray(data.data)) orders = data.data;

  return orders.map((order) => ({
    id: String(order.id),
    userId: String(order.userId),
    createdAt: order.date || order.createdAt || '',
    items: order.items || [],
    total: order.price || order.total || 0,
    shop: order.shop ?? undefined,
  }));
}

export function useOrders() {
  return useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
}
