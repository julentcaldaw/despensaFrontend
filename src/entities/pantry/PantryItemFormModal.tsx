/**
 * PantryItemFormModal Component
 * Modal form for adding/editing pantry items
 */

import { useEffect, useState } from 'react'
import {
  searchIngredients,
  type IngredientSearchResult,
} from '../../features/pantry/api/pantry.api'
import type {
  PantryItem,
  CreatePantryItemInput,
  PantryItemConservation,
  PantryItemUnit,
} from '../../features/pantry/model/types/pantry.model'
import {
  PANTRY_ITEM_UNITS,
  PANTRY_UNIT_LABELS,
} from '../../features/pantry/model/types/pantry.model'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '../../shared/ui/form/SearchableSelect'

interface PantryItemFormModalProps {
  item?: PantryItem | null
  isOpen: boolean
  isSubmitting: boolean
  onSubmit: (input: CreatePantryItemInput) => void
  onClose: () => void
}

const INITIAL_VALUES: CreatePantryItemInput = {
  ingredientId: 0,
  quantity: 1,
  unit: 'UNIT',
  conservation: 'DESPENSA',
}

const CONSERVATION_OPTIONS: Array<{ value: PantryItemConservation; label: string }> = [
  { value: 'DESPENSA', label: 'Despensa' },
  { value: 'NEVERA', label: 'Nevera' },
  { value: 'CONGELADOR', label: 'Congelador' },
]

export function PantryItemFormModal({
  item,
  isOpen,
  isSubmitting,
  onSubmit,
  onClose,
}: PantryItemFormModalProps) {
  const [values, setValues] = useState<CreatePantryItemInput>(INITIAL_VALUES)
  const [quantityInput, setQuantityInput] = useState('1')
  const [ingredientQuery, setIngredientQuery] = useState('')
  const [ingredientOptions, setIngredientOptions] = useState<IngredientSearchResult[]>([])
  const [isSearchingIngredients, setIsSearchingIngredients] = useState(false)
  const [ingredientSearchError, setIngredientSearchError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const ingredientSelectOptions: SearchableSelectOption<number>[] = ingredientOptions.map(
    (ingredient) => ({
      value: ingredient.id,
      label: ingredient.name,
    }),
  )

  useEffect(() => {
    if (item) {
      setValues({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
        conservation: item.conservation,
        expiresAt: item.expiresAt,
      })
      setQuantityInput(String(item.quantity))
      setIngredientQuery(item.ingredientName)
      setIngredientOptions([{ id: item.ingredientId, name: item.ingredientName }])
    } else {
      setValues(INITIAL_VALUES)
      setQuantityInput('1')
      setIngredientQuery('')
      setIngredientOptions([])
    }
    setIngredientSearchError(null)
    setErrors({})
  }, [item, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const normalizedQuery = ingredientQuery.trim()
    if (normalizedQuery.length < 2) {
      setIsSearchingIngredients(false)
      setIngredientSearchError(null)
      if (!item || normalizedQuery.toLowerCase() !== item.ingredientName.toLowerCase()) {
        setIngredientOptions([])
      }
      return
    }

    let isActive = true
    setIsSearchingIngredients(true)
    setIngredientSearchError(null)

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchIngredients(normalizedQuery)
        if (isActive) {
          setIngredientOptions(results)
        }
      } catch {
        if (isActive) {
          setIngredientSearchError('No se pudo buscar ingredientes')
          setIngredientOptions([])
        }
      } finally {
        if (isActive) {
          setIsSearchingIngredients(false)
        }
      }
    }, 250)

    return () => {
      isActive = false
      window.clearTimeout(timeoutId)
    }
  }, [ingredientQuery, isOpen, item])

  function validateForm(): CreatePantryItemInput | null {
    const nextErrors: Record<string, string> = {}
    const parsedQuantity = Number(quantityInput.replace(',', '.'))

    if (!values.ingredientId || values.ingredientId <= 0) {
      nextErrors.ingredientId = 'Selecciona un ingrediente valido de la lista'
    }

    if (!quantityInput.trim() || Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      nextErrors.quantity = 'La cantidad debe ser mayor a 0'
    }

    if (!PANTRY_ITEM_UNITS.includes(values.unit)) {
      nextErrors.unit = 'La unidad es requerida'
    }

    if (!values.conservation) {
      nextErrors.conservation = 'La conservacion es requerida'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return null
    }

    return {
      ...values,
      quantity: parsedQuantity,
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const validatedInput = validateForm()
    if (!validatedInput) {
      return
    }

    onSubmit(validatedInput)
  }

  function onChange(field: keyof CreatePantryItemInput, value: string | number | Date | null) {
    setValues((prev: CreatePantryItemInput) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: '' }))
    }
  }

  if (!isOpen) return null

  const expiryDateValue = values.expiresAt
    ? values.expiresAt instanceof Date
      ? values.expiresAt.toISOString().split('T')[0]
      : new Date(values.expiresAt).toISOString().split('T')[0]
    : ''

  return (
    <dialog className="modal modal-open">
      <form className="modal-box h-dvh max-h-dvh w-full max-w-full rounded-none sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-box" onSubmit={handleSubmit} noValidate>
        <h3 className="font-bold text-lg mb-4">
          {item ? 'Editar elemento' : 'Añadir elemento a la despensa'}
        </h3>

        {/* Ingredient */}
        <SearchableSelect
          id="item-ingredient-id"
          label="Ingrediente"
          placeholder="Escribe para buscar..."
          query={ingredientQuery}
          options={ingredientSelectOptions}
          onQueryChange={(nextQuery) => {
            setIngredientQuery(nextQuery)
            setIngredientSearchError(null)

            const exactMatch = ingredientOptions.find(
              (option) => option.name.toLowerCase() === nextQuery.trim().toLowerCase(),
            )

            onChange('ingredientId', exactMatch?.id ?? 0)
          }}
          onSelect={(option) => {
            setIngredientQuery(option.label)
            onChange('ingredientId', option.value)
          }}
          isLoading={isSearchingIngredients}
          helperText={ingredientSearchError ?? undefined}
          helperTextIsError={Boolean(ingredientSearchError)}
          loadingText="Buscando ingredientes..."
          emptyText="No se encontraron ingredientes"
          minQueryLength={2}
          disabled={isSubmitting}
          error={errors.ingredientId}
          required
        />
        <div className="mb-2" />

        <div className="mb-4 grid grid-cols-2 gap-3">
          {/* Quantity */}
          <div className="form-control">
            <label htmlFor="item-quantity" className="label">
              <span className="label-text font-medium">Cantidad</span>
            </label>
            <input
              id="item-quantity"
              type="number"
              min="1"
              step="0.1"
              className="input input-bordered"
              value={quantityInput}
              onChange={(e) => {
                setQuantityInput(e.target.value)
                if (errors.quantity) {
                  setErrors((prev) => ({ ...prev, quantity: '' }))
                }
              }}
            />
            {errors.quantity && <span className="text-error text-sm mt-1">{errors.quantity}</span>}
          </div>

          {/* Unit */}
          <div className="form-control">
            <label htmlFor="item-unit" className="label">
              <span className="label-text font-medium">Unidad</span>
            </label>
            <select
              id="item-unit"
              className="select select-bordered"
              value={values.unit}
              onChange={(e) => onChange('unit', e.target.value as PantryItemUnit)}
            >
              <option value="">Selecciona una unidad</option>
              {PANTRY_ITEM_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {PANTRY_UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
            {errors.unit && <span className="text-error text-sm mt-1">{errors.unit}</span>}
          </div>
        </div>

        {/* Conservation */}
        <div className="form-control mb-4">
          <label htmlFor="item-conservation" className="label">
            <span className="label-text font-medium">Conservación</span>
          </label>
          <select
            id="item-conservation"
            className="select select-bordered"
            value={values.conservation}
            onChange={(e) => onChange('conservation', e.target.value as PantryItemConservation)}
          >
            {CONSERVATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.conservation && <span className="text-error text-sm mt-1">{errors.conservation}</span>}
        </div>

        {/* Expiry Date */}
        <div className="form-control mb-4">
          <label htmlFor="item-expiry" className="label">
            <span className="label-text font-medium">Fecha de caducidad (opcional)</span>
          </label>
          <input
            id="item-expiry"
            type="date"
            className="input input-bordered"
            value={expiryDateValue}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null
              onChange('expiresAt', date)
            }}
          />
        </div>

        {/* Actions */}
        <div className="modal-action gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : item ? 'Guardar cambios' : 'Añadir'}
          </button>
        </div>
      </form>

      {/* Backdrop */}
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button" />
      </form>
    </dialog>
  )
}
