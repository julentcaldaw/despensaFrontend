import { useQuery } from '@tanstack/react-query';
import type { Order, OrdersListResponse } from "../model/orders.model";
import { apiClient } from '../../../shared/lib/http/api-client';

export async function fetchOrders(): Promise<Order[]> {
  // apiClient.get añade el token automáticamente
  const data = await apiClient.get<OrdersListResponse | Order[]>('/orders');
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as OrdersListResponse).data)) return (data as OrdersListResponse).data;
  return [];
}

export function useOrders() {
  return useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
}
