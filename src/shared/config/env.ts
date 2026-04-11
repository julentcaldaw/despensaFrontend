const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const openFoodFactsApiBaseUrl = import.meta.env.VITE_OPENFOODFACTS_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('Missing required environment variable: VITE_API_BASE_URL')
}

if (!openFoodFactsApiBaseUrl) {
  throw new Error('Missing required environment variable: VITE_OPENFOODFACTS_API_BASE_URL')
}

export const env = {
  apiBaseUrl,
  openFoodFactsApiBaseUrl,
}
