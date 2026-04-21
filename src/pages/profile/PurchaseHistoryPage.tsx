import { useState } from "react";
import { CalendarDays, Package2, Store } from "lucide-react";
import { useOrders } from "../../features/orders/api/orders.api";
import type { Order } from "../../features/orders/model/orders.model";
import { PageLoadingState } from "../../shared/ui/states/PageLoadingState";
import { PageErrorState } from "../../shared/ui/states/PageErrorState";
import { OrderDetailModal } from "./OrderDetailModal";

function formatOrderDate(value: string): string {
  if (!value) {
    return "Fecha no disponible";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getShopName(order: Order): string {
  return order.shop?.name ?? order.shopName ?? "Tienda desconocida";
}

function getDistinctIngredientsCount(order: Order): number {
  return order.items.length;
}

export function PurchaseHistoryPage() {
  const { data: orders, isLoading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading) return <PageLoadingState />;
  if (error)
    return (
      <PageErrorState
        error={error.message}
        title="Error al cargar historial de compras"
      />
    );

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-box border border-base-300 bg-base-100 p-6">
          <h1 className="text-2xl font-semibold text-base-content">
            Historial de compras
          </h1>
          <p className="mt-2 text-sm text-base-content/70">
            Consulta tus pedidos anteriores y abre cada compra para revisar el
            detalle completo.
          </p>
        </header>
        <section className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
          {!orders || orders.length === 0 ? (
            <div className="text-center text-base-content/70 py-8">
              No hay compras registradas.
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-[1.75rem] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-base-200/55 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-4">
                      <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
                        <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/90 px-3.5 py-2">
                          <Store size={14} />
                          {getShopName(order)}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/90 px-3.5 py-2">
                          <CalendarDays size={14} />
                          {formatOrderDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-end gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Package2 size={24} strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="text-sm text-base-content/65">
                            Ingredientes del pedido
                          </p>
                          <p className="text-3xl font-semibold leading-none text-base-content tabular-nums">
                            {getDistinctIngredientsCount(order)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-4 sm:items-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-base-content/50">
                          Total
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-base-content tabular-nums">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      <div className="mt-5 flex justify-end pt-4">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm min-h-11 px-5"
                          onClick={() => setSelectedOrder(order)}
                          aria-haspopup="dialog"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
