/**
 * Pantry Store
 * Manages client state for pantry inventory
 */

import { create } from 'zustand'
import type { PantryItem } from '../types/pantry.model'

interface PantryState {
  items: PantryItem[]
  isLoading: boolean
  error: string | null

  // Actions
  setItems: (items: PantryItem[]) => void
  addItem: (item: PantryItem) => void
  updateItem: (item: PantryItem) => void
  removeItem: (itemId: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const usePantryStore = create<PantryState>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  setItems: (items: PantryItem[]) => set({ items }),
  addItem: (item: PantryItem) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (item: PantryItem) =>
    set((state) => ({
      items: state.items.map((existing) => (existing.id === item.id ? item : existing)),
    })),
  removeItem: (itemId: string) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}))
