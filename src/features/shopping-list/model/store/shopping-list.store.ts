import { create } from 'zustand'
import type { ShoppingListItem } from '../types/shopping-list.model'

interface ShoppingListState {
  items: ShoppingListItem[]
  isLoading: boolean
  error: string | null
  setItems: (items: ShoppingListItem[]) => void
  addItem: (item: ShoppingListItem) => void
  updateItem: (item: ShoppingListItem) => void
  removeItem: (itemId: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useShoppingListStore = create<ShoppingListState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (item) =>
    set((state) => ({
      items: state.items.map((existing) => (existing.id === item.id ? item : existing)),
    })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
