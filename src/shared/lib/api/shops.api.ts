import { apiClient } from '../http/api-client'

export interface ShopOption {
  id: number
  name: string
  like: boolean
}

function isShopOption(value: unknown): value is ShopOption {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { id?: unknown }).id === 'number' &&
    typeof (value as { name?: unknown }).name === 'string'
  )
}

function asShopOptions(value: unknown): ShopOption[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isShopOption).map((shop) => ({
    ...shop,
    like: typeof shop.like === 'boolean' ? shop.like : false,
  }))
}

export async function fetchShops(): Promise<ShopOption[]> {
  const payload = await apiClient.get<unknown>('/shops')

  if (Array.isArray(payload)) {
    return asShopOptions(payload)
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    'items' in payload.data
  ) {
    return asShopOptions((payload as { data: { items: unknown } }).data.items)
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return asShopOptions((payload as { data: unknown[] }).data)
  }

  return []
}

export async function updateShopLike(shopId: number, like: boolean): Promise<void> {
  await apiClient.post<{ like: boolean }, unknown>(`/shops/${shopId}/like`, { like })
}
