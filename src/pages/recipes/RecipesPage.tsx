import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { createShoppingItem } from '../../features/shopping-list/api/shopping-list.api'
import { PANTRY_ITEM_UNITS, type PantryItemUnit } from '../../features/pantry/model/types/pantry.model'
import { useRecipes } from '../../features/recipes/model/hooks/useRecipes'
import { useRecipeSearch } from '../../features/recipes/model/hooks/useRecipeSearch'
import { useRecipeLikes } from '../../features/recipes/model/hooks/useRecipeLikes'
import type { RecipeRequirement } from '../../features/recipes/model/types/recipes.model'
import { queryKeys } from '../../shared/lib/query/query-keys'
import { AppToast } from '../../shared/ui/feedback/AppToast'
import { LikeHeartControl } from '../../shared/ui/feedback/LikeHeartControl'
import { RecipeCard } from '../../entities/recipes/RecipeCard'
import { RecipesSectionHeader } from '../../entities/recipes/RecipesSectionHeader'
import { PageLoadingState } from '../../shared/ui/states/PageLoadingState'
import { PageErrorState } from '../../shared/ui/states/PageErrorState'
import { PageEmptyState } from '../../shared/ui/states/PageEmptyState'

function normalizeRequirementUnit(unit: string | null): PantryItemUnit {
  const normalized = unit?.trim().toUpperCase() ?? ''

  if ((PANTRY_ITEM_UNITS as readonly string[]).includes(normalized)) {
    return normalized as PantryItemUnit
  }

  if (normalized === 'UD' || normalized === 'U') {
    return 'UNIT'
  }

  if (normalized === 'GR') {
    return 'G'
  }

  return 'UNIT'
}

function mapRequirementToShoppingItemInput(requirement: RecipeRequirement) {
  return {
    ingredientId: requirement.ingredientId,
    quantity: requirement.quantity && requirement.quantity > 0 ? requirement.quantity : 1,
    unit: normalizeRequirementUnit(requirement.unit),
  }
}

function buildRequirementKey(recipeId: number, ingredientId: number): string {
  return `${recipeId}-${ingredientId}`
}

export function RecipesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [explorerPage, setExplorerPage] = useState(1)
  const [addedRequirementKeys, setAddedRequirementKeys] = useState<string[]>([])
  const [addingRequirementKeys, setAddingRequirementKeys] = useState<string[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'warning'; message: string } | null>(null)
  const { data, isLoading, error } = useRecipes(explorerPage)
  const {
    data: searchSuggestions,
    isLoading: isSearchLoading,
    error: searchError,
  } = useRecipeSearch(debouncedSearchQuery)
  const { updatingLikeId, getRecipeLikeValue, toggleRecipeLike } = useRecipeLikes()

  const addIngredientToShoppingListMutation = useMutation({
    mutationFn: createShoppingItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.items() })
      setToast({ type: 'success', message: 'Ingrediente añadido a la lista de la compra.' })
    },
    onError: () => {
      setToast({ type: 'warning', message: 'No se pudo añadir el ingrediente a la lista de la compra.' })
    },
  })

  const pantryRecipes = useMemo(
    () => [...data.cookable.items, ...data.almostCookable.items],
    [data.cookable.items, data.almostCookable.items],
  )
  const explorerRecipes = data.recipes.items

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 250)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [searchQuery])

  const showSuggestions = searchQuery.trim().length >= 2

  if (isLoading) {
    return <PageLoadingState />
  }

  const pantryRecipesWithShoppingState = pantryRecipes.map((recipe) => ({
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      inShoppingList:
        ingredient.inShoppingList ||
        addedRequirementKeys.includes(buildRequirementKey(recipe.id, ingredient.ingredientId)),
    })),
  }))

  const explorerRecipesWithShoppingState = explorerRecipes.map((recipe) => ({
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      inShoppingList:
        ingredient.inShoppingList ||
        addedRequirementKeys.includes(buildRequirementKey(recipe.id, ingredient.ingredientId)),
    })),
  }))

  async function handleAddMissingIngredient(recipeId: number, requirement: RecipeRequirement): Promise<void> {
    if (requirement.inStock || requirement.inShoppingList) {
      return
    }

    const key = buildRequirementKey(recipeId, requirement.ingredientId)

    if (addingRequirementKeys.includes(key)) {
      return
    }

    setAddingRequirementKeys((prev) => [...prev, key])

    try {
      await addIngredientToShoppingListMutation.mutateAsync(mapRequirementToShoppingItemInput(requirement))
      setAddedRequirementKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
    } finally {
      setAddingRequirementKeys((prev) => prev.filter((item) => item !== key))
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-box border border-base-300 bg-base-100 p-6">
          <div className="grid gap-3 md:gap-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            <h1 className="text-2xl font-semibold text-base-content">Recetas</h1>
            <div className="relative w-full">
              <label className="input input-bordered flex w-full items-center gap-2">
                <Search size={16} className="text-base-content/60" />
                <input
                  type="search"
                  className="grow"
                  placeholder="Buscar recetas"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>

              {showSuggestions ? (
                <div className="absolute z-20 mt-2 w-full rounded-box border border-base-300 bg-base-100 shadow-lg">
                  {isSearchLoading ? (
                    <p className="px-4 py-3 text-sm text-base-content/70">Buscando sugerencias...</p>
                  ) : null}

                  {!isSearchLoading && searchError ? (
                    <p className="px-4 py-3 text-sm text-error">No se pudieron cargar sugerencias.</p>
                  ) : null}

                  {!isSearchLoading && !searchError && searchSuggestions.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-base-content/70">Sin sugerencias para esta búsqueda.</p>
                  ) : null}

                  {!isSearchLoading && !searchError && searchSuggestions.length > 0 ? (
                    <ul className="max-h-72 overflow-auto py-1">
                      {searchSuggestions.map((recipe) => (
                        <li key={`suggestion-${recipe.id}`}>
                          <div className="flex items-center justify-between gap-2 px-2 py-1.5 hover:bg-base-200">
                            <Link
                              to={`/recipes/${recipe.id}`}
                              className="min-w-0 flex-1 px-2 py-1 text-sm"
                            >
                              <span className="flex items-center gap-2">
                                <span className="truncate font-medium text-base-content">{recipe.name}</span>
                                <span
                                  className={`badge badge-outline badge-sm ${
                                    recipe.ingredientsCount > 0
                                      ? recipe.pantryIngredientsCount / recipe.ingredientsCount >= 0.75
                                        ? 'badge-success'
                                        : recipe.pantryIngredientsCount / recipe.ingredientsCount >= 0.4
                                          ? 'badge-warning'
                                          : 'badge-error'
                                      : 'badge-error'
                                  }`}
                                >
                                  {recipe.pantryIngredientsCount}/{recipe.ingredientsCount} ingredientes
                                </span>
                              </span>
                            </Link>

                            <LikeHeartControl
                              liked={getRecipeLikeValue(recipe)}
                              disabled={updatingLikeId === recipe.id}
                              stopPropagation
                              preventDefault
                              labelLiked="Quitar receta de favoritas"
                              labelUnliked="Marcar receta como favorita"
                              onToggle={() => toggleRecipeLike(recipe)}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Link to="/recipes/new" className="btn btn-primary btn-sm">
              <Plus size={16} /> Crear receta
            </Link>
          </div>
        </header>

        {error ? <PageErrorState error={error} title="Error al cargar recetas" /> : null}

        <section className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
          <RecipesSectionHeader
            title="Recetas con lo que tienes en tu despensa"
            count={pantryRecipes.length}
          />

          {pantryRecipes.length === 0 ? (
            <PageEmptyState
              title="No hay recetas disponibles"
              description="No hay recetas que puedas preparar con tu despensa actual."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pantryRecipesWithShoppingState.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  liked={getRecipeLikeValue(recipe)}
                  isUpdatingLike={updatingLikeId === recipe.id}
                  onToggleLike={() => toggleRecipeLike(recipe)}
                  addingMissingIngredientIds={addingRequirementKeys
                    .filter((key) => key.startsWith(`${recipe.id}-`))
                    .map((key) => Number(key.split('-')[1]))}
                  onAddMissingIngredientToShoppingList={(requirement) =>
                    handleAddMissingIngredient(recipe.id, requirement)}
                  detailHref={`/recipes/${recipe.id}`}
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
          <RecipesSectionHeader title="Explorador de recetas" count={explorerRecipes.length} />

          {explorerRecipes.length === 0 ? (
            <PageEmptyState
              title="No hay recetas para explorar"
              description="Todavía no hay recetas disponibles en el explorador."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {explorerRecipesWithShoppingState.map((recipe) => (
                <RecipeCard
                  key={`explorer-${recipe.id}`}
                  recipe={recipe}
                  liked={getRecipeLikeValue(recipe)}
                  isUpdatingLike={updatingLikeId === recipe.id}
                  onToggleLike={() => toggleRecipeLike(recipe)}
                  addingMissingIngredientIds={addingRequirementKeys
                    .filter((key) => key.startsWith(`${recipe.id}-`))
                    .map((key) => Number(key.split('-')[1]))}
                  onAddMissingIngredientToShoppingList={(requirement) =>
                    handleAddMissingIngredient(recipe.id, requirement)}
                  detailHref={`/recipes/${recipe.id}`}
                />
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm text-base-content/70">
              Página {data.recipes.page} de {Math.max(data.recipes.totalPages, 1)} · {data.recipes.total} recetas
            </p>

            <div className="join">
              <button
                type="button"
                className="btn btn-sm join-item"
                disabled={data.recipes.page <= 1}
                onClick={() => setExplorerPage((prev) => Math.max(prev - 1, 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn btn-sm join-item"
                disabled={data.recipes.page >= data.recipes.totalPages}
                onClick={() => setExplorerPage((prev) => Math.min(prev + 1, data.recipes.totalPages))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </div>

      {toast ? (
        <AppToast
          message={toast.message}
          type={toast.type}
          autoCloseMs={2800}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  )
}
