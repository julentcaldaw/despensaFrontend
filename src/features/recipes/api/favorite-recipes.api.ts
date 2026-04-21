import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/lib/http/api-client';


export async function fetchFavoriteRecipes() {
  // apiClient.get añade el token automáticamente
  const data = await apiClient.get('/recipes/favorites');
  // Si la respuesta es un array, mapear 'like' a 'liked'
  if (Array.isArray(data)) {
    return data.map((recipe) => ({
      ...recipe,
      liked: recipe.like ?? false,
    }));
  }
  // Si la respuesta es { ok, data }, mapear dentro de data
  if (data && Array.isArray(data.data)) {
    return {
      ...data,
      data: data.data.map((recipe) => ({
        ...recipe,
        liked: recipe.like ?? false,
      })),
    };
  }
  return data;
}

export function useFavoriteRecipes() {
  return useQuery({
    queryKey: ['recipes', 'favorites'],
    queryFn: fetchFavoriteRecipes,
  });
}
