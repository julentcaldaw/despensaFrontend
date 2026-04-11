import { env } from '../../config/env'

/** Subset of PantryItemUnit used by this integration. Structurally compatible with that type. */
export type OffUnit =
  | 'G'
  | 'KG'
  | 'ML'
  | 'L'
  | 'UNIT'
  | 'PACK'
  | 'CAN'
  | 'BOTTLE'
  | 'JAR'
  | 'BOX'
  | 'BAG'
  | 'TBSP'
  | 'TSP'
  | 'SLICE'
  | 'CLOVE'

export interface OpenFoodFactsProduct {
  barcode: string
  productName: string | null
  quantity: { amount: number; unit: OffUnit } | null
  imageUrl: string | null
}

interface OpenFoodFactsLookupResult {
  found: boolean
  product: OpenFoodFactsProduct | null
}

/** Maps an OFF unit text token to an OffUnit. Returns null if unrecognised. */
const UNIT_MAP: Array<[RegExp, OffUnit, multiplier?: number]> = [
  [/^g$|^gr$|^gram(s)?$/i, 'G'],
  [/^kg$|^kilogram(s)?$/i, 'KG'],
  [/^ml$|^millilitre(s)?$|^milliliter(s)?$/i, 'ML'],
  [/^cl$|^centilitre(s)?$/i, 'ML', 10], // 1 cl = 10 ml
  [/^l$|^litre(s)?$|^liter(s)?$/i, 'L'],
  [/^tbsp$|^tablespoon(s)?$/i, 'TBSP'],
  [/^tsp$|^teaspoon(s)?$/i, 'TSP'],
  [/^unit(s)?$|^unidad(es)?$|^ud(s)?$|^pz$|^pieza(s)?$|^piece(s)?$/i, 'UNIT'],
  [/^pack(s)?$|^paquete(s)?$/i, 'PACK'],
  [/^can(s)?$|^lata(s)?$/i, 'CAN'],
  [/^bottle(s)?$|^botella(s)?$/i, 'BOTTLE'],
  [/^jar(s)?$|^tarro(s)?$/i, 'JAR'],
  [/^box(es)?$|^caja(s)?$/i, 'BOX'],
  [/^bag(s)?$|^bolsa(s)?$/i, 'BAG'],
  [/^slice(s)?$|^rebanada(s)?$/i, 'SLICE'],
  [/^clove(s)?$|^diente(s)?$/i, 'CLOVE'],
]

function parseOffQuantity(raw: string | null | undefined): { amount: number; unit: OffUnit } | null {
  if (!raw) return null
  // Matches simple patterns like "100g", "100 g", "1.5 kg", "500 ml". Skips multipacks ("6 x 100g").
  const match = raw.trim().match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Záéíóú]+)$/)
  if (!match) return null
  const amount = parseFloat(match[1].replace(',', '.'))
  const token = match[2]
  for (const [pattern, unit, multiplier] of UNIT_MAP) {
    if (pattern.test(token)) {
      return { amount: amount * (multiplier ?? 1), unit }
    }
  }
  return null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

export async function lookupOpenFoodFactsByBarcode(
  barcode: string,
): Promise<OpenFoodFactsLookupResult> {
  const normalizedBarcode = barcode.trim()
  if (!normalizedBarcode) {
    return { found: false, product: null }
  }

  const fields = 'code,product_name,product_name_es,quantity,image_front_url,image_url'
  const response = await fetch(
    `${env.openFoodFactsApiBaseUrl}/product/${encodeURIComponent(normalizedBarcode)}.json?fields=${fields}`,
  )

  if (!response.ok) {
    throw new Error('No se pudo consultar Open Food Facts')
  }

  const payload = (await response.json().catch(() => null)) as
    | {
        status?: number
        code?: string
        product?: {
          product_name?: string
          product_name_es?: string
          quantity?: string
          image_url?: string
          image_front_url?: string
        }
      }
    | null

  if (!payload || payload.status !== 1 || !payload.product) {
    return { found: false, product: null }
  }

  const productName =
    asString(payload.product.product_name_es) ?? asString(payload.product.product_name)

  return {
    found: true,
    product: {
      barcode: asString(payload.code) ?? normalizedBarcode,
      productName,
      quantity: parseOffQuantity(payload.product.quantity),
      imageUrl:
        asString(payload.product.image_front_url) ?? asString(payload.product.image_url),
    },
  }
}
