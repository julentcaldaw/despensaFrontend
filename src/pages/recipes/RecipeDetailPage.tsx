import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { RecipeDetailHeader } from '../../entities/recipes/RecipeDetailHeader'
import { RecipeDetailIngredientsSection } from '../../entities/recipes/RecipeDetailIngredientsSection'
import { RecipeDetailSidebar } from '../../entities/recipes/RecipeDetailSidebar'
import { createShoppingItem } from '../../features/shopping-list/api/shopping-list.api'
import { PANTRY_ITEM_UNITS, type PantryItemUnit } from '../../features/pantry/model/types/pantry.model'
import { useRecipeLikes } from '../../features/recipes/model/hooks/useRecipeLikes'
import { useRecipeDetail } from '../../features/recipes/model/hooks/useRecipeDetail'
import type { RecipeRequirement } from '../../features/recipes/model/types/recipes.model'
import { queryKeys } from '../../shared/lib/query/query-keys'
import { AppToast } from '../../shared/ui/feedback/AppToast'
import { PageEmptyState } from '../../shared/ui/states/PageEmptyState'
import { PageErrorState } from '../../shared/ui/states/PageErrorState'
import { PageLoadingState } from '../../shared/ui/states/PageLoadingState'

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

export function RecipeDetailPage() {
  const { recipeId } = useParams<{ recipeId: string }>()
  const queryClient = useQueryClient()
  const numericRecipeId = Number(recipeId)
  const parsedRecipeId = Number.isFinite(numericRecipeId) ? numericRecipeId : null
  const { data: recipe, isLoading, error } = useRecipeDetail(parsedRecipeId)
  const { updatingLikeId, getRecipeLikeValue, toggleRecipeLike } = useRecipeLikes()
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const [addedIngredientIds, setAddedIngredientIds] = useState<number[]>([])
  const [addingIngredientIds, setAddingIngredientIds] = useState<number[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'warning'; message: string } | null>(null)

  const addMissingIngredientsMutation = useMutation({
    mutationFn: async (requirements: RecipeRequirement[]) => {
      const results = await Promise.allSettled(
        requirements.map((requirement) => createShoppingItem(mapRequirementToShoppingItemInput(requirement))),
      )

      const createdIds = requirements
        .filter((_, index) => results[index]?.status === 'fulfilled')
        .map((requirement) => requirement.ingredientId)

      const createdCount = results.filter((result) => result.status === 'fulfilled').length

      if (createdCount === 0) {
        throw new Error('No se pudieron añadir ingredientes a la lista de la compra')
      }

      return { createdCount, createdIds, total: requirements.length }
    },
    onSuccess: async ({ createdCount, createdIds, total }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.items() })
      setAddedIngredientIds((prev) => Array.from(new Set([...prev, ...createdIds])))

      if (total === 1) {
        setToast({
          type: 'success',
          message: 'Ingrediente añadido a la lista de la compra.',
        })
        return
      }

      if (createdCount === total) {
        setToast({
          type: 'success',
          message: 'Todos los ingredientes faltantes se han añadido a la lista de la compra.',
        })
        return
      }

      setToast({
        type: 'warning',
        message: `Se añadieron ${createdCount} de ${total} ingredientes a la lista de la compra.`,
      })
    },
    onError: () => {
      setToast({
        type: 'warning',
        message: 'No se pudieron añadir los ingredientes faltantes a la lista de la compra.',
      })
    },
  })

  if (isLoading) {
    return <PageLoadingState />
  }

  if (error) {
    return <PageErrorState error={error} title="Error al cargar el detalle de la receta" />
  }

  if (!recipe) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <PageEmptyState
            title="Receta no encontrada"
            description="No hemos podido localizar esta receta en la lista disponible ahora mismo."
          />
        </div>
      </div>
    )
  }

  const ingredientsWithShoppingState = recipe.ingredients.map((ingredient) => ({
    ...ingredient,
    inShoppingList: ingredient.inShoppingList || addedIngredientIds.includes(ingredient.ingredientId),
  }))

  const missingRequirements = ingredientsWithShoppingState.filter((ingredient) => !ingredient.inStock)
  const addableMissingRequirements = missingRequirements.filter((ingredient) => !ingredient.inShoppingList)
  const availableRequirements = ingredientsWithShoppingState.filter((ingredient) => ingredient.inStock)
  const hasMissingIngredients = missingRequirements.length > 0 || recipe.availability === 'almost'

  async function handleAddSingleIngredientToShoppingList(requirement: RecipeRequirement): Promise<void> {
    if (requirement.inStock || requirement.inShoppingList || addingIngredientIds.includes(requirement.ingredientId)) {
      return
    }

    setAddingIngredientIds((prev) => [...prev, requirement.ingredientId])

    try {
      await addMissingIngredientsMutation.mutateAsync([requirement])
    } finally {
      setAddingIngredientIds((prev) => prev.filter((item) => item !== requirement.ingredientId))
    }
  }

  return (
    <div className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <RecipeDetailHeader
          recipe={recipe}
          liked={getRecipeLikeValue(recipe)}
          isUpdatingLike={updatingLikeId === recipe.id}
          onToggleLike={() => toggleRecipeLike(recipe)}
          hasMissingIngredients={hasMissingIngredients}
          inStockIngredientsCount={availableRequirements.length}
          failedImageUrl={failedImageUrl}
          onImageError={(imageUrl) => setFailedImageUrl(imageUrl)}
        />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
          <RecipeDetailIngredientsSection recipe={recipe} />
          <RecipeDetailSidebar
            missingRequirements={missingRequirements}
            addingIngredientIds={addingIngredientIds}
            addableMissingCount={addableMissingRequirements.length}
            isAddingMissingToShoppingList={addMissingIngredientsMutation.isPending}
            onAddIngredientToShoppingList={handleAddSingleIngredientToShoppingList}
            onAddMissingToShoppingList={async () => {
              if (addableMissingRequirements.length === 0 || addMissingIngredientsMutation.isPending) {
                return
              }

              await addMissingIngredientsMutation.mutateAsync(addableMissingRequirements)
            }}
          />
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-base-content">Detalle de la receta</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-base-content/80">
            {recipe.detail ?? 'Esta receta no tiene detalle adicional por ahora.'}
          </p>
        </section>
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