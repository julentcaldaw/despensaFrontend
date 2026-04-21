import {
  CalendarDays,
  Package2,
  ReceiptText,
  ScanBarcode,
  Store,
  X,
} from "lucide-react";
import type { Order } from "../../features/orders/model/orders.model";
import { OrderDetailIngredientCard } from "./OrderDetailIngredientCard";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

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
    month: "long",
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

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  if (!isOpen || !order) {
    return null;
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box h-dvh max-h-dvh w-full max-w-full rounded-none p-0 sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-box">
        <div className="border-b border-base-200 bg-base-100 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-base-content/50">
                Pedido
              </p>
              <h3 className="mt-1 text-xl font-semibold text-base-content">
                Detalle de la compra
              </h3>
            </div>

            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={onClose}
                aria-label="Cerrar detalle del pedido"
              >
                <X size={16} />
              </button>

              {order.ticket ? (
                <a
                  href={order.ticket}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  <ScanBarcode size={16} />
                  Abrir ticket en una nueva pestaña
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-box border border-base-200 bg-base-200/60 p-4">
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <Store size={16} />
                <span>Tienda</span>
              </div>
              <p className="mt-2 font-semibold text-base-content">
                {getShopName(order)}
              </p>
            </div>

            <div className="rounded-box border border-base-200 bg-base-200/60 p-4">
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <CalendarDays size={16} />
                <span>Fecha</span>
              </div>
              <p className="mt-2 font-semibold text-base-content">
                {formatOrderDate(order.date || order.createdAt)}
              </p>
            </div>

            <div className="rounded-box border border-base-200 bg-base-200/60 p-4">
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <ReceiptText size={16} />
                <span>Total</span>
              </div>
              <p className="mt-2 font-semibold text-base-content">
                {formatCurrency(order.total)}
              </p>
            </div>
          </section>

          <section className="bg-base-100">
            <div className="mb-4 flex items-center gap-2">
              <Package2 size={18} className="text-base-content/70" />
              <h4 className="font-semibold text-base-content">
                Ingredientes del pedido
              </h4>
            </div>

            {order.items.length === 0 ? (
              <div className="rounded-box border border-dashed border-base-300 bg-base-200/40 px-4 py-6 text-center text-sm text-base-content/70">
                Este pedido no incluye ingredientes visibles en la respuesta
                actual.
              </div>
            ) : (
              <ul className="space-y-3">
                {order.items.map((item, index) => (
                  <OrderDetailIngredientCard
                    key={`${item.id}-${index}`}
                    item={item}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button">Cerrar</button>
      </form>
    </dialog>
  );
}
