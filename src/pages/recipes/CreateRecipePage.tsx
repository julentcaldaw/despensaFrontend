import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRecipe } from '../../features/recipes/api/recipes.api'
import { searchIngredients, type IngredientSearchResult } from '../../features/pantry/api/pantry.api'
import { PANTRY_ITEM_UNITS, PANTRY_UNIT_LABELS, type PantryItemUnit } from '../../features/pantry/model/types/pantry.model'
import { ApiClientError } from '../../shared/lib/http/api-client'
import { queryKeys } from '../../shared/lib/query/query-keys'
import { AppToast } from '../../shared/ui/feedback/AppToast'
import { SearchableSelect, type SearchableSelectOption } from '../../shared/ui/form/SearchableSelect'
import { TextField } from '../../shared/ui/form/TextField'

type RecipeDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

interface RecipeIngredientDraft {
  id: string
  ingredientQuery: string
  ingredientId: number
  quantity: string
  unit: PantryItemUnit
}

interface CreateRecipeDraft {
  name: string
  detail: string
  prepTime: string
  difficulty: RecipeDifficulty
  ingredients: RecipeIngredientDraft[]
}

function createEmptyIngredient(): RecipeIngredientDraft {
  return {
    id: crypto.randomUUID(),
    ingredientQuery: '',
    ingredientId: 0,
    quantity: '',
    unit: 'UNIT',
  }
}

const initialDraft: CreateRecipeDraft = {
  name: '',
  detail: '',
  prepTime: '',
  difficulty: 'EASY',
  ingredients: [createEmptyIngredient()],
}

export function CreateRecipePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<CreateRecipeDraft>(initialDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ type: 'success' | 'warning'; message: string } | null>(null)
  const [ingredientOptionsByRow, setIngredientOptionsByRow] = useState<Record<string, IngredientSearchResult[]>>({})
  const [isSearchingByRow, setIsSearchingByRow] = useState<Record<string, boolean>>({})
  const [ingredientSearchErrorByRow, setIngredientSearchErrorByRow] = useState<Record<string, string | null>>({})
  const searchTimeoutsRef = useRef<Record<string, number>>({})

  const createRecipeMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: async (createdRecipe) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all })
      setToast({ type: 'success', message: 'Receta creada correctamente.' })

      window.setTimeout(() => {
        if (createdRecipe?.id) {
          navigate(`/recipes/${createdRecipe.id}`, { replace: true })
          return
        }

        navigate('/recipes', { replace: true })
      }, 500)
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setToast({ type: 'warning', message: error.message })
        return
      }

      setToast({ type: 'warning', message: 'No se ha podido crear la receta. Intentalo de nuevo.' })
    },
  })

  const isSubmitting = createRecipeMutation.isPending

  const isDisabled = useMemo(() => {
    return isSubmitting || !draft.name.trim() || draft.ingredients.length === 0
  }, [draft.name, draft.ingredients.length, isSubmitting])

  function setField<K extends keyof CreateRecipeDraft>(field: K, value: CreateRecipeDraft[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  function setIngredientField(
    id: string,
    field: keyof RecipeIngredientDraft,
    value: string | number | PantryItemUnit,
  ) {
    setDraft((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient) => (
        ingredient.id === id ? { ...ingredient, [field]: value as never } : ingredient
      )),
    }))
  }

  function resetIngredientSearchState(id: string) {
    setIngredientOptionsByRow((prev) => ({ ...prev, [id]: [] }))
    setIngredientSearchErrorByRow((prev) => ({ ...prev, [id]: null }))
    setIsSearchingByRow((prev) => ({ ...prev, [id]: false }))
  }

  function handleIngredientQueryChange(id: string, query: string) {
    setIngredientField(id, 'ingredientQuery', query)
    setIngredientField(id, 'ingredientId', 0)

    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) {
      resetIngredientSearchState(id)
      return
    }

    if (searchTimeoutsRef.current[id]) {
      window.clearTimeout(searchTimeoutsRef.current[id])
    }

    setIsSearchingByRow((prev) => ({ ...prev, [id]: true }))
    setIngredientSearchErrorByRow((prev) => ({ ...prev, [id]: null }))

    searchTimeoutsRef.current[id] = window.setTimeout(async () => {
      try {
        const results = await searchIngredients(normalizedQuery)
        setIngredientOptionsByRow((prev) => ({ ...prev, [id]: results }))
      } catch {
        setIngredientOptionsByRow((prev) => ({ ...prev, [id]: [] }))
        setIngredientSearchErrorByRow((prev) => ({
          ...prev,
          [id]: 'No se pudo buscar ingredientes',
        }))
      } finally {
        setIsSearchingByRow((prev) => ({ ...prev, [id]: false }))
      }
    }, 250)
  }

  function handleAddIngredient() {
    const nextIngredient = createEmptyIngredient()

    setDraft((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, nextIngredient],
    }))

    resetIngredientSearchState(nextIngredient.id)
  }

  function handleRemoveIngredient(id: string) {
    setDraft((prev) => {
      if (prev.ingredients.length === 1) {
        return prev
      }

      return {
        ...prev,
        ingredients: prev.ingredients.filter((ingredient) => ingredient.id !== id),
      }
    })

    if (searchTimeoutsRef.current[id]) {
      window.clearTimeout(searchTimeoutsRef.current[id])
      delete searchTimeoutsRef.current[id]
    }

    setIngredientOptionsByRow((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setIsSearchingByRow((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setIngredientSearchErrorByRow((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function validateForm(): Record<string, string> {
    const nextErrors: Record<string, string> = {}

    if (!draft.name.trim()) {
      nextErrors.name = 'El nombre de la receta es obligatorio'
    }

    if (draft.prepTime.trim() && Number(draft.prepTime) <= 0) {
      nextErrors.prepTime = 'El tiempo debe ser mayor que 0'
    }

    if (!draft.prepTime.trim()) {
      nextErrors.prepTime = 'El tiempo de preparación es obligatorio'
    }

    if (!draft.ingredients.length) {
      nextErrors.ingredients = 'Añade al menos un ingrediente'
    }

    draft.ingredients.forEach((ingredient, index) => {
      if (!ingredient.ingredientId || ingredient.ingredientId <= 0) {
        nextErrors[`ingredient-id-${ingredient.id}`] = `Selecciona un ingrediente valido para el item ${index + 1}`
      }

      const quantity = Number(ingredient.quantity.replace(',', '.'))
      if (!ingredient.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) {
        nextErrors[`ingredient-quantity-${ingredient.id}`] = `La cantidad del ingrediente ${index + 1} debe ser mayor que 0`
      }

      if (!ingredient.unit.trim()) {
        nextErrors[`ingredient-unit-${ingredient.id}`] = `Completa la unidad del ingrediente ${index + 1}`
      }
    })

    return nextErrors
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const payload = {
      name: draft.name.trim(),
      detail: draft.detail.trim(),
      difficulty: draft.difficulty,
      prepTime: Number(draft.prepTime),
      ingredients: draft.ingredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        quantity: Number(ingredient.quantity.replace(',', '.')),
        unit: ingredient.unit,
      })),
    }

    await createRecipeMutation.mutateAsync(payload)
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-box border border-base-300 bg-base-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-base-content">Crear receta</h1>
              <p className="mt-1 text-sm text-base-content/70">
                Define los datos principales y los ingredientes para publicar una nueva receta.
              </p>
            </div>
            <Link to="/recipes" className="btn btn-ghost btn-sm">
              Volver a recetas
            </Link>
          </div>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <section className="rounded-box border border-base-300 bg-base-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-base-content">Datos de la receta</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextField
                  id="recipe-name"
                  label="Nombre"
                  value={draft.name}
                  onChange={(event) => setField('name', event.target.value)}
                  error={errors.name}
                  placeholder="Ej: Salmorejo cordobés"
                  required
                />
              </div>

              <TextField
                id="recipe-prep-time"
                label="Tiempo de preparación (min)"
                value={draft.prepTime}
                onChange={(event) => setField('prepTime', event.target.value)}
                error={errors.prepTime}
                inputMode="numeric"
                placeholder="20"
              />

              <div className="w-full space-y-2">
                <label className="label px-0 pb-0" htmlFor="recipe-difficulty">
                  <span className="label-text font-medium text-base-content">Dificultad</span>
                </label>
                <select
                  id="recipe-difficulty"
                  className="select select-bordered w-full"
                  value={draft.difficulty}
                  onChange={(event) => setField('difficulty', event.target.value as RecipeDifficulty)}
                >
                  <option value="EASY">Facil</option>
                  <option value="MEDIUM">Intermedia</option>
                  <option value="HARD">Dificil</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="label px-0 pb-0" htmlFor="recipe-detail">
                  <span className="label-text font-medium text-base-content">Descripcion</span>
                </label>
                <textarea
                  id="recipe-detail"
                  className="textarea textarea-bordered w-full"
                  rows={4}
                  value={draft.detail}
                  onChange={(event) => setField('detail', event.target.value)}
                  placeholder="Describe brevemente la receta"
                />
              </div>
            </div>
          </section>

          <section className="rounded-box border border-base-300 bg-base-100 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-base-content">Ingredientes</h2>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleAddIngredient}>
                <Plus size={16} /> Añadir ingrediente
              </button>
            </div>

            <div className="space-y-4">
              {draft.ingredients.map((ingredient, index) => (
                <article key={ingredient.id} className="rounded-box border border-base-300 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-base-content">Ingrediente {index + 1}</p>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleRemoveIngredient(ingredient.id)}
                      disabled={draft.ingredients.length === 1}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_8rem]">
                    <SearchableSelect<number>
                      id={`ingredient-name-${ingredient.id}`}
                      label="Ingrediente"
                      query={ingredient.ingredientQuery}
                      options={(ingredientOptionsByRow[ingredient.id] ?? []).map((option) => ({
                        value: option.id,
                        label: option.name,
                      }) satisfies SearchableSelectOption<number>)}
                      onQueryChange={(query) => handleIngredientQueryChange(ingredient.id, query)}
                      onSelect={(option) => {
                        setIngredientField(ingredient.id, 'ingredientQuery', option.label)
                        setIngredientField(ingredient.id, 'ingredientId', option.value)
                        setIngredientSearchErrorByRow((prev) => ({ ...prev, [ingredient.id]: null }))
                      }}
                      isLoading={Boolean(isSearchingByRow[ingredient.id])}
                      helperText={ingredientSearchErrorByRow[ingredient.id] ?? undefined}
                      helperTextIsError={Boolean(ingredientSearchErrorByRow[ingredient.id])}
                      loadingText="Buscando ingredientes..."
                      emptyText="No se encontraron ingredientes"
                      minQueryLength={2}
                      error={errors[`ingredient-id-${ingredient.id}`]}
                      required
                      disabled={isSubmitting}
                    />

                    <TextField
                      id={`ingredient-quantity-${ingredient.id}`}
                      label="Cantidad"
                      value={ingredient.quantity}
                      onChange={(event) => setIngredientField(ingredient.id, 'quantity', event.target.value)}
                      error={errors[`ingredient-quantity-${ingredient.id}`]}
                      inputMode="decimal"
                      placeholder="1000"
                      disabled={isSubmitting}
                    />

                    <div className="w-full space-y-2">
                      <label className="label px-0 pb-0" htmlFor={`ingredient-unit-${ingredient.id}`}>
                        <span className="label-text font-medium text-base-content">Unidad</span>
                      </label>
                      <select
                        id={`ingredient-unit-${ingredient.id}`}
                        className={`select select-bordered w-full ${errors[`ingredient-unit-${ingredient.id}`] ? 'select-error' : ''}`}
                        value={ingredient.unit}
                        onChange={(event) => setIngredientField(ingredient.id, 'unit', event.target.value as PantryItemUnit)}
                        disabled={isSubmitting}
                      >
                        {PANTRY_ITEM_UNITS.map((unitOption) => (
                          <option key={unitOption} value={unitOption}>
                            {PANTRY_UNIT_LABELS[unitOption]}
                          </option>
                        ))}
                      </select>
                      {errors[`ingredient-unit-${ingredient.id}`] ? (
                        <p className="label px-0 pt-0 text-sm text-error" role="alert">
                          {errors[`ingredient-unit-${ingredient.id}`]}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}

              {errors.ingredients ? <p className="text-sm text-error">{errors.ingredients}</p> : null}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link to="/recipes" className="btn btn-ghost">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isDisabled}>
              {isSubmitting ? 'Guardando...' : 'Crear receta'}
            </button>
          </div>
        </form>
      </div>

      {toast ? (
        <AppToast
          message={toast.message}
          type={toast.type}
          autoCloseMs={3200}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  )
}