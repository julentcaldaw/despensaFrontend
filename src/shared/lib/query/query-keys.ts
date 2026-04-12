/**
 * Query Key Factories
 * Centralized query key definitions for TanStack Query
 */

export const queryKeys = {
  recipes: {
    all: ['recipes'] as const,
    cookable: () => [...queryKeys.recipes.all, 'cookable'] as const,
    detail: (recipeId: number) => [...queryKeys.recipes.all, 'detail', recipeId] as const,
  },
  pantry: {
    all: ['pantry'] as const,
    items: () => [...queryKeys.pantry.all, 'items'] as const,
  },
  shoppingList: {
    all: ['shoppingList'] as const,
    items: () => [...queryKeys.shoppingList.all, 'items'] as const,
  },
}
