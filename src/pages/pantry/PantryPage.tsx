/**
 * PantryPage
 * Main page for pantry inventory management
 */

import { useState } from 'react'
import type { CreatePantryItemInput, PantryItem } from '../../features/pantry/model/types/pantry.model'
import { usePantryInventory } from '../../features/pantry/model/hooks/usePantryInventory'
import { PantryHeader } from '../../entities/pantry/PantryHeader'
import { PantryFilters } from '../../entities/pantry/PantryFilters'
import { PantryItemCard } from '../../entities/pantry/PantryItemCard'
import { PantryItemFormModal } from '../../entities/pantry/PantryItemFormModal'
import { EmptyStatePantry } from '../../entities/pantry/EmptyStatePantry'
import { DeletePantryItemModal } from '../../entities/pantry/DeletePantryItemModal'
import { AppToast } from '../../shared/ui/feedback/AppToast'

export function PantryPage() {
  const {
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
    handleAdd: addPantryItem,
    handleEdit: editPantryItem,
    handleConsume,
    handleDelete,
    clearFilters,
  } = usePantryInventory()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function handleAdd(input: CreatePantryItemInput) {
    try {
      await addPantryItem(input)
      setIsFormOpen(false)
    } catch {
      // El hook ya gestiona el feedback de error.
    }
  }

  async function handleEdit(input: CreatePantryItemInput) {
    if (!selectedItem) return

    try {
      await editPantryItem(selectedItem.id, input)
      setIsFormOpen(false)
      setSelectedItem(null)
    } catch {
      // El hook ya gestiona el feedback de error.
    }
  }

  function handleOpenForm(item?: PantryItem) {
    setSelectedItem(item || null)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setSelectedItem(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <PantryHeader itemCount={items.length} onAddClick={() => handleOpenForm()} />

        {/* Empty State */}
        {items.length === 0 ? (
          <EmptyStatePantry onAddClick={() => handleOpenForm()} />
        ) : (
          <>
            {/* Filters */}
            <PantryFilters
              selectedStatus={selectedStatus}
              selectedConservation={selectedConservation}
              conservations={conservations}
              onStatusChange={setSelectedStatus}
              onConservationChange={setSelectedConservation}
            />

            {/* Items Grid Grouped by Category */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-base-content/70">
                <p className="mb-3">No hay elementos que coincidan con los filtros</p>
                <button className="link link-primary" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                {groupedItems.map(({ conservation, items }) => (
                  <div key={conservation} className="mb-8">
                    <h2 className="text-xl font-semibold text-base-content mb-3">
                      {conservation}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <div key={item.id} className="relative">
                          <PantryItemCard
                            item={item}
                            onEdit={() => handleOpenForm(item)}
                            onConsume={() => handleConsume(item.id)}
                            onDelete={() => setConfirmDelete(item.id)}
                          />

                          {confirmDelete === item.id ? (
                            <DeletePantryItemModal
                              itemName={item.ingredientName}
                              onCancel={() => setConfirmDelete(null)}
                              onConfirm={async () => {
                                try {
                                  await handleDelete(item.id)
                                  setConfirmDelete(null)
                                } catch {
                                  // El hook ya gestiona el feedback de error.
                                }
                              }}
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <PantryItemFormModal
        item={selectedItem}
        isOpen={isFormOpen}
        isSubmitting={isSubmitting}
        onSubmit={selectedItem ? handleEdit : handleAdd}
        onClose={handleCloseForm}
      />

      {/* Toast */}
      {toast && (
        <AppToast
          message={toast.message}
          type={toast.type}
          autoCloseMs={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
