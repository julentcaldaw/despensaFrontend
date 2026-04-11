import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  consumePantryItem,
  createPantryItem,
  deletePantryItem,
  fetchPantryItems,
  updatePantryItem,
} from '../../api/pantry.api'
import { mapPantryItemsResponse } from '../mappers/pantry.mapper'
import type {
  CreatePantryItemInput,
  PantryItem,
  PantryItemStatus,
} from '../types/pantry.model'
import { queryKeys } from '../../../../shared/lib/query/query-keys'

export type PantryToastType = 'success' | 'warning'

export interface PantryToast {
  type: PantryToastType
  message: string
}

export function usePantryInventory() {
  const queryClient = useQueryClient()

  const [toast, setToast] = useState<PantryToast | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<PantryItemStatus | 'all'>('all')
  const [selectedConservation, setSelectedConservation] = useState<string | 'all'>('all')

  // Fetch pantry items
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.pantry.items(),
    queryFn: async () => {
      const dtos = await fetchPantryItems()
      return mapPantryItemsResponse(dtos)
    },
  })

  const items = data

  const conservations = useMemo(() => {
    const values = new Set(items.map((item) => item.conservation))
    return Array.from(values).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusMatch = selectedStatus === 'all' || item.status === selectedStatus
      const conservationMatch =
        selectedConservation === 'all' || item.conservation === selectedConservation
      return statusMatch && conservationMatch
    })
  }, [items, selectedStatus, selectedConservation])

  const groupedItems = useMemo(() => {
    const groups: Record<string, PantryItem[]> = {}

    filteredItems.forEach((item) => {
      if (!groups[item.conservation]) {
        groups[item.conservation] = []
      }

      groups[item.conservation].push(item)
    })

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([conservation, grouped]) => ({
        conservation,
        items: grouped,
      }))
  }, [filteredItems])

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: createPantryItem,
    onSuccess: () => {
      setToast({ type: 'success', message: 'Elemento añadido correctamente' })
      queryClient.invalidateQueries({ queryKey: queryKeys.pantry.items() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al añadir elemento'
      setToast({ type: 'warning', message })
    },
  })

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: CreatePantryItemInput }) =>
      updatePantryItem(itemId, {
        ingredientId: input.ingredientId,
        quantity: input.quantity,
        unit: input.unit,
        conservation: input.conservation,
        expiresAt: input.expiresAt,
      }),
    onSuccess: () => {
      setToast({ type: 'success', message: 'Elemento actualizado correctamente' })
      queryClient.invalidateQueries({ queryKey: queryKeys.pantry.items() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al actualizar elemento'
      setToast({ type: 'warning', message })
    },
  })

  // Consume item mutation
  const consumeMutation = useMutation({
    mutationFn: consumePantryItem,
    onSuccess: () => {
      setToast({ type: 'success', message: 'Elemento marcado como consumido' })
      queryClient.invalidateQueries({ queryKey: queryKeys.pantry.items() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al actualizar elemento'
      setToast({ type: 'warning', message })
    },
  })

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: deletePantryItem,
    onSuccess: () => {
      setToast({ type: 'success', message: 'Elemento eliminado correctamente' })
      queryClient.invalidateQueries({ queryKey: queryKeys.pantry.items() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al eliminar elemento'
      setToast({ type: 'warning', message })
    },
  })

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    consumeMutation.isPending ||
    deleteMutation.isPending

  async function handleAdd(input: CreatePantryItemInput) {
    return createMutation.mutateAsync(input)
  }

  async function handleEdit(selectedItemId: string, input: CreatePantryItemInput) {
    return updateMutation.mutateAsync({ itemId: selectedItemId, input })
  }

  async function handleConsume(itemId: string) {
    return consumeMutation.mutateAsync(itemId)
  }

  async function handleDelete(itemId: string) {
    return deleteMutation.mutateAsync(itemId)
  }

  function clearFilters() {
    setSelectedStatus('all')
    setSelectedConservation('all')
  }

  return {
    items,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    selectedStatus,
    setSelectedStatus,
    selectedConservation,
    setSelectedConservation,
    conservations,
    filteredItems,
    groupedItems,
    handleAdd,
    handleEdit,
    handleConsume,
    handleDelete,
    clearFilters,
  }
}
