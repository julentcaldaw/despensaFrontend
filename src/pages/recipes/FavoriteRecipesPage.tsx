

import { Link } from 'react-router-dom';
import { useFavoriteRecipes } from '../../features/recipes/api/favorite-recipes.api';
import type { RecipeSummary } from '../../features/recipes/model/types/recipes.model';
import { useRecipeLikes } from '../../features/recipes/model/hooks/useRecipeLikes';
import { RecipeCard } from '../../entities/recipes/RecipeCard';
import { RecipesSectionHeader } from '../../entities/recipes/RecipesSectionHeader';
import { PageLoadingState } from '../../shared/ui/states/PageLoadingState';
import { PageErrorState } from '../../shared/ui/states/PageErrorState';
import { PageEmptyState } from '../../shared/ui/states/PageEmptyState';

export function FavoriteRecipesPage() {
  const { data, isLoading, error } = useFavoriteRecipes();
  const { updatingLikeId, getRecipeLikeValue, toggleRecipeLike } = useRecipeLikes();

  // Loader
  if (isLoading) return <PageLoadingState />;

  // Error amigable
  if (error) {
    let errorMsg = 'Error desconocido';
    if (typeof error === 'string') errorMsg = error;
    else if (error instanceof Error) errorMsg = error.message;
    return (
      <PageErrorState
        error={errorMsg}
        title="Error al cargar recetas favoritas"
      />
    );
  }

  // Validar formato de respuesta
  let favoriteRecipes: RecipeSummary[] | null = null;
  if (Array.isArray(data)) {
    favoriteRecipes = data as RecipeSummary[];
  } else if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    favoriteRecipes = (data as { data: RecipeSummary[] }).data;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-box border border-base-300 bg-base-100 p-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-base-content">Recetas favoritas</h1>
            <Link to="/recipes" className="btn btn-outline btn-sm">Ver todas</Link>
          </div>
        </header>
        <section className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
          <RecipesSectionHeader title="Tus recetas favoritas" count={favoriteRecipes ? favoriteRecipes.length : 0} />
          {!favoriteRecipes || favoriteRecipes.length === 0 ? (
            <PageEmptyState
              title="No hay recetas favoritas"
              description="Marca recetas con el corazón para verlas aquí."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {favoriteRecipes.map((recipe) => (
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
  );
}
