import type { ShopOption } from '../../lib/api/shops.api'
import { ShopSelect } from '../form/ShopSelect'

interface ScanContextFieldsProps {
  shops: ShopOption[]
  selectedShopId: number | null
  onShopChange: (id: number | null) => void
  expiresAt: string
  onExpiresAtChange: (date: string) => void
  todayDate: string
}

export function ScanContextFields({
  shops,
  selectedShopId,
  onShopChange,
  expiresAt,
  onExpiresAtChange,
  todayDate,
}: ScanContextFieldsProps) {
  return (
    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <ShopSelect
          id="scan-shop-select"
          label="Tienda"
          shops={shops}
          value={selectedShopId}
          onChange={onShopChange}
        />
      </div>

      <div>
        <label htmlFor="scan-expiry-date" className="label pb-1">
          <span className="label-text">Caducidad (opcional)</span>
        </label>
        <input
          id="scan-expiry-date"
          type="date"
          min={todayDate}
          className="input input-bordered w-full"
          value={expiresAt}
          onChange={(e) => onExpiresAtChange(e.target.value)}
        />
      </div>
    </div>
  )
}
