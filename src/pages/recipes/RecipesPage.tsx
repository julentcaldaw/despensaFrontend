import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useRecipes } from '../../features/recipes/model/hooks/useRecipes'
import { useRecipeLikes } from '../../features/recipes/model/hooks/useRecipeLikes'
import { RecipeCard } from '../../entities/recipes/RecipeCard'
import { RecipesSectionHeader } from '../../entities/recipes/RecipesSectionHeader'
import { PageLoadingState } from '../../shared/ui/states/PageLoadingState'
import { PageErrorState } from '../../shared/ui/states/PageErrorState'
import { PageEmptyState } from '../../shared/ui/states/PageEmptyState'

export function RecipesPage() {
  const { data, isLoading, error } = useRecipes()
  const { updatingLikeId, getRecipeLikeValue, toggleRecipeLike } = useRecipeLikes()
  const recipes = [...data.cookable.items, ...data.almostCookable.items]

  if (isLoading) {
    return <PageLoadingState />
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-box border border-base-300 bg-base-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-base-content">Recetas</h1>
            <Link to="/recipes/new" className="btn btn-primary btn-sm">
              <Plus size={16} /> Crear receta
            </Link>
          </div>
        </header>

        {error ? <PageErrorState error={error} title="Error al cargar recetas" /> : null}

        <section className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
          <RecipesSectionHeader
            title="Recetas con lo que tienes en tu despensa"
            count={recipes.length}
          />

          {recipes.length === 0 ? (
            <PageEmptyState
              title="No hay recetas disponibles"
              description="No hay recetas que puedas preparar con tu despensa actual."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  liked={getRecipeLikeValue(recipe)}
                  isUpdatingLike={updatingLikeId === recipe.id}
                  onToggleLike={() => toggleRecipeLike(recipe)}
                  detailHref={`/recipes/${recipe.id}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
