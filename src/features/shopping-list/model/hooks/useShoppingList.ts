import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createShoppingItem,
  deleteShoppingItem,
  fetchShoppingItems,
  updateShoppingItem,
} from '../../api/shopping-list.api'
import { mapShoppingItemsResponse } from '../mappers/shopping-list.mapper'
import type {
  CreateShoppingItemInput,
  ShoppingListGrouping,
  ShoppingListItem,
} from '../types/shopping-list.model'
import { queryKeys } from '../../../../shared/lib/query/query-keys'

export type ShoppingToastType = 'success' | 'warning'

export interface ShoppingToast {
  type: ShoppingToastType
  message: string
}

export interface ShoppingListGroup {
  key: string
  label: string
  items: ShoppingListItem[]
}

interface UseShoppingListResult {
  items: ShoppingListItem[]
  isLoading: boolean
  isSubmitting: boolean
  toast: ShoppingToast | null
  setToast: (toast: ShoppingToast | null) => void
  grouping: ShoppingListGrouping
  setGrouping: (grouping: ShoppingListGrouping) => void
  groupedItems: ShoppingListGroup[]
  handleAddManualItem: (input: CreateShoppingItemInput) => Promise<void>
  handleEditItem: (
    itemId: string,
    input: { quantity: number; unit: ShoppingListItem['unit']; shopId: number | null },
  ) => Promise<void>
  handleToggleStatus: (item: ShoppingListItem) => Promise<void>
  handleDeleteItem: (itemId: string) => Promise<void>
}

function sortByStatusAndName(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1
    }

    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  })
}

function buildGroupLabel(item: ShoppingListItem, grouping: ShoppingListGrouping): string {
  const shop = item.shopName ?? 'Sin tienda'
  const category = item.categoryName ?? 'Sin categoría'

  if (grouping === 'shop') {
    return shop
  }

  if (grouping === 'category') {
    return category
  }

  if (grouping === 'shop_category') {
    return `${shop} - ${category}`
  }

  return 'Todos'
}

function groupItems(items: ShoppingListItem[], grouping: ShoppingListGrouping): ShoppingListGroup[] {
  if (grouping === 'none') {
    return [{ key: 'all', label: 'Todos', items }]
  }

  const groups = new Map<string, ShoppingListItem[]>()

  items.forEach((item) => {
    const label = buildGroupLabel(item, grouping)
    const current = groups.get(label) ?? []
    groups.set(label, [...current, item])
  })

  return Array.from(groups.entries()).map(([label, groupedItems]) => ({
      key: label,
      label,
      items: groupedItems,
    }))
}

export function useShoppingList(): UseShoppingListResult {
  const queryClient = useQueryClient()

  const [toast, setToast] = useState<ShoppingToast | null>(null)
  const [grouping, setGrouping] = useState<ShoppingListGrouping>('none')

  // Fetch shopping items
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.shoppingList.items(),
    queryFn: async () => {
      const dtos = await fetchShoppingItems()
      return mapShoppingItemsResponse(dtos)
    },
  })

  const items = data
  const sortedItems = useMemo(() => sortByStatusAndName(items), [items])

  const groupedItems = useMemo(() => groupItems(sortedItems, grouping), [sortedItems, grouping])

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: createShoppingItem,
    onSuccess: () => {
      setToast({ type: 'success', message: 'Producto añadido a la lista' })
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.items() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo añadir el producto'
      setToast({ type: 'warning', message })
    },
  })

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ itemId, nextStatus }: { itemId: string; nextStatus: 'pending' | 'completed' }) =>
      updateShoppingItem(itemId, { status: nextStatus }),
    onSuccess: (_, { nextStatus }) => {
      setToast({
        type: 'success',
        message: nextStatus === 'completed' ? 'Marcado como comprado' : 'Marcado como pendiente',
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.items() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el estado del producto'
      setToast({ type: 'warning', message })
    },
  })

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ itemId, input }: {
      itemId: string
      input: { quantity: number; unit: ShoppingListItem['unit']; shopId: number | null }
    }) =>
      updateShoppingItem(itemId, {
        quantity: input.quantity,
        unit: input.unit,
        shopId: input.shopId,
      }),
    onSuccess: () => {
      setToast({ type: 'success', message: 'Producto actualizado' })
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.items() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el producto'
      setToast({ type: 'warning', message })
    },
  })

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: deleteShoppingItem,
    onSuccess: () => {
      setToast({ type: 'success', message: 'Producto eliminado de la lista' })
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.items() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el producto'
      setToast({ type: 'warning', message })
    },
  })

  const isSubmitting =
    createMutation.isPending ||
    toggleStatusMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  async function handleAddManualItem(input: CreateShoppingItemInput): Promise<void> {
    await createMutation.mutateAsync(input)
  }

  async function handleToggleStatus(item: ShoppingListItem): Promise<void> {
    const nextStatus = item.status === 'pending' ? 'completed' : 'pending'

    await toggleStatusMutation.mutateAsync({
      itemId: item.id,
      nextStatus,
    })
  }

  async function handleEditItem(
    itemId: string,
    input: { quantity: number; unit: ShoppingListItem['unit']; shopId: number | null },
  ): Promise<void> {
    await updateMutation.mutateAsync({ itemId, input })
  }

  async function handleDeleteItem(itemId: string): Promise<void> {
    await deleteMutation.mutateAsync(itemId)
  }

  return {
    items: sortedItems,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    grouping,
    setGrouping,
    groupedItems,
    handleAddManualItem,
    handleEditItem,
    handleToggleStatus,
    handleDeleteItem,
  }
}
