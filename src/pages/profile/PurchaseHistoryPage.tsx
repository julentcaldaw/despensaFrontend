import React from 'react';
import { useOrders } from '../../features/orders/api/orders.api';
import { PageLoadingState } from '../../shared/ui/states/PageLoadingState';
import { PageErrorState } from '../../shared/ui/states/PageErrorState';

export function PurchaseHistoryPage() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error.message} title="Error al cargar historial de compras" />;

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-box border border-base-300 bg-base-100 p-6">
          <h1 className="text-2xl font-semibold text-base-content">Historial de compras</h1>
        </header>
        <section className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
          {(!orders || orders.length === 0) ? (
            <div className="text-center text-base-content/70 py-8">No hay compras registradas.</div>
          ) : (
            <ul className="space-y-4">
              {orders.map(order => (
                <li key={order.id} className="border border-base-200 rounded-lg p-4 bg-base-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">
                      Pedido en {order.shop?.name || (typeof order.shop === 'string' ? order.shop : '') || 'Tienda desconocida'}                    </span>
                    <span className="text-sm text-base-content/60">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <ul className="text-sm text-base-content/80 mb-2">
                    {order.items.map(item => (
                      <li key={item.productId} className="flex justify-between">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-right font-bold text-base-content">Total: {order.total.toFixed(2)}€</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
