import type { OpenFoodFactsProduct } from '../../lib/integrations/open-food-facts'
import type { IngredientSimilaritySuggestion } from '../../lib/api/ingredient-similarity.api'

// ─── SuggestionList ───────────────────────────────────────────────────────────

interface SuggestionListProps {
  suggestions: IngredientSimilaritySuggestion[]
  selectedId: number | null
  onSelect: (id: number) => void
}

function SuggestionList({ suggestions, selectedId, onSelect }: SuggestionListProps) {
  return (
    <ul className="space-y-2">
      {suggestions.map((suggestion) => (
        <li key={suggestion.id}>
          <button
            type="button"
            className={`w-full rounded-box border px-3 py-2 text-left ${
              selectedId === suggestion.id
                ? 'border-primary bg-primary/10'
                : 'border-base-300 bg-base-100'
            }`}
            onClick={() => onSelect(suggestion.id)}
          >
            <p className="font-medium">{suggestion.name}</p>
            {suggestion.category?.name ? (
              <p className="text-xs text-base-content/70">{suggestion.category.name}</p>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  )
}

// ─── ScanProductResult ────────────────────────────────────────────────────────

interface ScanProductResultProps {
  detectedCode: string
  productInfo: OpenFoodFactsProduct | null
  lookupError: string | null
  highSuggestions: IngredientSimilaritySuggestion[]
  lowSuggestions: IngredientSimilaritySuggestion[]
  isLoadingSuggestions: boolean
  suggestionsError: string | null
  selectedSuggestionId: number | null
  onSuggestionSelect: (id: number) => void
  canConfirm: boolean
  onAddToPantry: () => void
  onAddAndScanAnother: () => void
}

export function ScanProductResult({
  detectedCode,
  productInfo,
  lookupError,
  highSuggestions,
  lowSuggestions,
  isLoadingSuggestions,
  suggestionsError,
  selectedSuggestionId,
  onSuggestionSelect,
  canConfirm,
  onAddToPantry,
  onAddAndScanAnother,
}: ScanProductResultProps) {
  return (
    <div className="mt-3 rounded-box border border-base-300 bg-base-100 p-3">
      <p className="text-xs text-base-content/60">Codigo detectado</p>
      <p className="font-semibold">{detectedCode}</p>

      {productInfo ? (
        <div className="mt-3 flex gap-3">
          {productInfo.imageUrl ? (
            <img
              src={productInfo.imageUrl}
              alt={productInfo.productName ?? 'Producto'}
              className="h-16 w-16 rounded-box border border-base-300 object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-medium">
              {productInfo.productName ?? 'Producto sin nombre'}
            </p>
            {productInfo.quantity ? (
              <p className="text-sm text-base-content/70">
                Cantidad: {productInfo.quantity.amount} {productInfo.quantity.unit.toLowerCase()}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {isLoadingSuggestions ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-base-content/70">
          <span className="loading loading-spinner loading-sm" />
          Buscando ingredientes similares...
        </div>
      ) : null}

      {!isLoadingSuggestions && highSuggestions.length > 0 ? (
        <div className="mt-3 rounded-box border border-base-300 bg-base-200/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">
            Sugerencias principales
          </p>
          <SuggestionList
            suggestions={highSuggestions}
            selectedId={selectedSuggestionId}
            onSelect={onSuggestionSelect}
          />
        </div>
      ) : null}

      {!isLoadingSuggestions && lowSuggestions.length > 0 ? (
        <div className="collapse collapse-arrow mt-3 rounded-box border border-base-300 bg-base-200/40">
          <input type="checkbox" />
          <div className="collapse-title py-3 text-sm font-medium">Ver mas opciones</div>
          <div className="collapse-content pt-0">
            <SuggestionList
              suggestions={lowSuggestions}
              selectedId={selectedSuggestionId}
              onSelect={onSuggestionSelect}
            />
          </div>
        </div>
      ) : null}

      {suggestionsError ? (
        <div role="alert" className="alert alert-warning mt-3 py-2">
          <span className="text-sm">{suggestionsError}</span>
        </div>
      ) : null}

      {lookupError ? (
        <div role="alert" className="alert alert-warning mt-3 py-2">
          <span className="text-sm">{lookupError}</span>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline btn-primary"
          onClick={onAddToPantry}
          disabled={!canConfirm}
        >
          Añadir a despensa
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={onAddAndScanAnother}
          disabled={!canConfirm}
        >
          Añadir y escanear otro
        </button>
      </div>
    </div>
  )
}
