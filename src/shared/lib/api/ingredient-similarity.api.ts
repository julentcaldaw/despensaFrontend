import { apiClient } from '../http/api-client'

export interface IngredientSimilaritySuggestion {
  id: number
  name: string
  category: {
    id: number
    name: string
    icon: string | null
  } | null
}

export interface IngredientSimilarityResult {
  high: IngredientSimilaritySuggestion[]
  low: IngredientSimilaritySuggestion[]
}

interface IngredientSimilarityRequest {
  barcode: string
  name: string
}

function isSuggestion(value: unknown): value is IngredientSimilaritySuggestion {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as {
    id?: unknown
    name?: unknown
    category?: unknown
  }

  const categoryIsValid =
    candidate.category === null ||
    candidate.category === undefined ||
    (typeof candidate.category === 'object' &&
      candidate.category !== null &&
      typeof (candidate.category as { id?: unknown }).id === 'number' &&
      typeof (candidate.category as { name?: unknown }).name === 'string')

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    categoryIsValid
  )
}

function asSuggestionArray(value: unknown, limit: number): IngredientSimilaritySuggestion[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isSuggestion).slice(0, limit)
}

export async function searchIngredientSimilarity(
  input: IngredientSimilarityRequest,
): Promise<IngredientSimilarityResult> {
  const normalizedBarcode = input.barcode.trim()
  const normalizedName = input.name.trim()
  if (!normalizedBarcode || !normalizedName) {
    return { high: [], low: [] }
  }

  const payload = await apiClient.post<IngredientSimilarityRequest, unknown>(
    '/ingredients/search/similarity',
    {
      barcode: normalizedBarcode,
      name: normalizedName,
    },
  )

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object'
  ) {
    const data = payload.data as { high?: unknown; low?: unknown }
    return {
      high: asSuggestionArray(data.high, 2),
      low: asSuggestionArray(data.low, 4),
    }
  }

  return { high: [], low: [] }
}