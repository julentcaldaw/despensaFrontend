import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, Plus, ShoppingCart, Tag, Trash2, X } from 'lucide-react'
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic'
import { searchIngredients, type IngredientSearchResult } from '../../features/pantry/api/pantry.api'
import {
  PANTRY_ITEM_UNITS,
  PANTRY_UNIT_LABELS,
  type PantryItemUnit,
} from '../../features/pantry/model/types/pantry.model'
import { useShoppingList } from '../../features/shopping-list/model/hooks/useShoppingList'
import type {
  ShoppingListGroup,
  ShoppingToast,
} from '../../features/shopping-list/model/hooks/useShoppingList'
import type {
  ShoppingListGrouping,
  ShoppingListItem,
} from '../../features/shopping-list/model/types/shopping-list.model'
import { fetchShops, type ShopOption } from '../../shared/lib/api/shops.api'
import { AppToast } from '../../shared/ui/feedback/AppToast'
import { SearchableSelect, type SearchableSelectOption } from '../../shared/ui/form/SearchableSelect'
import { ShopSelect } from '../../shared/ui/form/ShopSelect'

const LUCIDE_ICON_NAMES = new Set(iconNames as string[])

interface AddShoppingItemModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: { ingredientId: number; quantity: number; unit: PantryItemUnit }) => Promise<void>
}

function AddShoppingItemModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: AddShoppingItemModalProps) {
  const [ingredientQuery, setIngredientQuery] = useState('')
  const [selectedIngredientId, setSelectedIngredientId] = useState<number>(0)
  const [quantityInput, setQuantityInput] = useState('1')
  const [unit, setUnit] = useState<PantryItemUnit>('UNIT')
  const [ingredientOptions, setIngredientOptions] = useState<IngredientSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const options: SearchableSelectOption<number>[] = ingredientOptions.map((ingredient) => ({
    value: ingredient.id,
    label: ingredient.name,
  }))

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const normalizedQuery = ingredientQuery.trim()
    if (normalizedQuery.length < 2) {
      setIsSearching(false)
      setSearchError(null)
      setIngredientOptions([])
      return
    }

    let isActive = true
    setIsSearching(true)
    setSearchError(null)

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchIngredients(normalizedQuery)
        if (isActive) {
          setIngredientOptions(results)
        }
      } catch {
        if (isActive) {
          setSearchError('No se pudo buscar ingredientes')
          setIngredientOptions([])
        }
      } finally {
        if (isActive) {
          setIsSearching(false)
        }
      }
    }, 250)

    return () => {
      isActive = false
      window.clearTimeout(timeoutId)
    }
  }, [ingredientQuery, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setIngredientQuery('')
      setSelectedIngredientId(0)
      setQuantityInput('1')
      setUnit('UNIT')
      setIngredientOptions([])
      setSearchError(null)
      setFormError(null)
    }
  }, [isOpen])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const selectedIngredient = ingredientOptions.find((item) => item.id === selectedIngredientId)
    const quantity = Number(quantityInput.replace(',', '.'))

    if (!selectedIngredient) {
      setFormError('Selecciona un ingrediente existente de la lista')
      return
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFormError('La cantidad debe ser mayor que 0')
      return
    }

    setFormError(null)

    try {
      await onSubmit({
        ingredientId: selectedIngredient.id,
        quantity,
        unit,
      })
      onClose()
    } catch {
      // El feedback lo maneja el hook.
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <dialog className="modal modal-open">
      <form className="modal-box h-dvh max-h-dvh w-full max-w-full rounded-none sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-box" onSubmit={handleSubmit} noValidate>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Añadir producto</h3>
            <p className="mt-1 text-sm text-base-content/70">
              Busca un ingrediente existente y añádelo a tu lista.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <SearchableSelect
            id="shopping-item-ingredient"
            label="Ingrediente"
            placeholder="Escribe para buscar..."
            query={ingredientQuery}
            options={options}
            onQueryChange={(nextQuery) => {
              setIngredientQuery(nextQuery)
              setFormError(null)
              setSearchError(null)

              const exactMatch = ingredientOptions.find(
                (option) => option.name.toLowerCase() === nextQuery.trim().toLowerCase(),
              )
              setSelectedIngredientId(exactMatch?.id ?? 0)
            }}
            onSelect={(option) => {
              setIngredientQuery(option.label)
              setSelectedIngredientId(option.value)
              setFormError(null)
            }}
            isLoading={isSearching}
            helperText={searchError ?? undefined}
            helperTextIsError={Boolean(searchError)}
            loadingText="Buscando ingredientes..."
            emptyText="No se encontraron ingredientes"
            minQueryLength={2}
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="shopping-item-quantity" className="label pb-1">
                <span className="label-text">Cantidad</span>
              </label>
              <input
                id="shopping-item-quantity"
                type="number"
                min="0.1"
                step="0.1"
                className="input input-bordered w-full"
                value={quantityInput}
                onChange={(event) => {
                  setQuantityInput(event.target.value)
                  setFormError(null)
                }}
              />
            </div>

            <div>
              <label htmlFor="shopping-item-unit" className="label pb-1">
                <span className="label-text">Unidad</span>
              </label>
              <select
                id="shopping-item-unit"
                className="select select-bordered w-full"
                value={unit}
                onChange={(event) => setUnit(event.target.value as PantryItemUnit)}
              >
                {PANTRY_ITEM_UNITS.map((unitOption) => (
                  <option key={unitOption} value={unitOption}>
                    {PANTRY_UNIT_LABELS[unitOption]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formError ? <p className="text-sm text-error">{formError}</p> : null}
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Añadiendo...' : 'Añadir'}
          </button>
        </div>
      </form>

      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button" />
      </form>
    </dialog>
  )
}

function getGroupingFromToggles(groupByShop: boolean, groupByCategory: boolean): ShoppingListGrouping {
  if (groupByShop && groupByCategory) {
    return 'shop_category'
  }

  if (groupByShop) {
    return 'shop'
  }

  if (groupByCategory) {
    return 'category'
  }

  return 'none'
}

function normalizeIconName(iconName: string): string {
  return iconName
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

function resolveCategoryIconName(iconName: string | null): IconName | null {
  if (!iconName) {
    return null
  }

  if (LUCIDE_ICON_NAMES.has(iconName)) {
    return iconName as IconName
  }

  const normalized = normalizeIconName(iconName)

  if (LUCIDE_ICON_NAMES.has(normalized)) {
    return normalized as IconName
  }

  return null
}

function EditShoppingItemModal({
  item,
  shops,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  item: ShoppingListItem | null
  shops: ShopOption[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: { quantity: number; unit: PantryItemUnit; shopId: number | null }) => Promise<void>
}) {
  const [quantityInput, setQuantityInput] = useState(() => (item ? String(item.quantity) : '1'))
  const [unit, setUnit] = useState<PantryItemUnit>(() => (item ? item.unit : 'UNIT'))
  const [shopId, setShopId] = useState<number | null>(() => (item ? item.shopId : null))
  const [error, setError] = useState<string | null>(null)

  if (!item) {
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedQuantity = Number(quantityInput.replace(',', '.'))

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('La cantidad debe ser mayor que 0')
      return
    }

    setError(null)

    try {
      await onSubmit({
        quantity: parsedQuantity,
        unit,
        shopId,
      })
      onClose()
    } catch {
      // El hook ya maneja errores.
    }
  }

  return (
    <dialog className="modal modal-open">
      <form className="modal-box h-dvh max-h-dvh w-full max-w-full rounded-none sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-box" onSubmit={handleSubmit} noValidate>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Editar producto</h3>
            <p className="mt-1 text-sm text-base-content/70">{item.name}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-shopping-item-quantity" className="label pb-1">
              <span className="label-text">Cantidad</span>
            </label>
            <input
              id="edit-shopping-item-quantity"
              type="number"
              min="0.1"
              step="0.1"
              className="input input-bordered w-full"
              value={quantityInput}
              onChange={(event) => {
                setQuantityInput(event.target.value)
                setError(null)
              }}
            />
          </div>

          <div>
            <label htmlFor="edit-shopping-item-unit" className="label pb-1">
              <span className="label-text">Unidad</span>
            </label>
            <select
              id="edit-shopping-item-unit"
              className="select select-bordered w-full"
              value={unit}
              onChange={(event) => setUnit(event.target.value as PantryItemUnit)}
            >
              {PANTRY_ITEM_UNITS.map((unitOption) => (
                <option key={unitOption} value={unitOption}>
                  {PANTRY_UNIT_LABELS[unitOption]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <ShopSelect
            id="edit-shopping-item-shop"
            label="Tienda"
            shops={shops}
            value={shopId}
            onChange={setShopId}
          />
        </div>

        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button" />
      </form>
    </dialog>
  )
}

function ShoppingListItems({
  groups,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  groups: ShoppingListGroup[]
  onEdit: (item: ShoppingListItem) => void
  onToggleStatus: (item: ShoppingListItem) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
}) {
  const totalItems = groups.reduce((acc, group) => acc + group.items.length, 0)

  if (totalItems === 0) {
    return (
      <div className="rounded-box border border-base-300 bg-base-100 p-6 text-center">
        <p className="text-base-content/70">No tienes elementos en tu lista de la compra.</p>
      </div>
    )
  }

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4">
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.key}>
            {group.label !== 'Todos' ? (
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-base-content/60">
                {group.label}
              </h3>
            ) : null}
            <ul className="space-y-2">
              {group.items.map((item) => {
                const categoryIconName = resolveCategoryIconName(item.categoryIcon)

                return (
                <li key={item.id} className="relative overflow-hidden rounded-box border border-base-300 bg-base-100 p-3">
                  <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-base-content/10">
                    {categoryIconName ? (
                      <DynamicIcon name={categoryIconName} size={100} strokeWidth={1.6} />
                    ) : (
                      <Tag size={100} strokeWidth={1.6} />
                    )}
                  </div>
                  <div className="relative z-10 flex flex-col gap-3">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 text-left"
                      onClick={() => void onToggleStatus(item)}
                    >
                      <span className="flex w-7 shrink-0 items-center justify-center">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            item.status === 'completed'
                              ? 'border-success bg-success text-success-content'
                              : 'border-base-300 bg-base-100'
                          }`}
                          aria-hidden="true"
                        >
                          {item.status === 'completed' ? <Check size={12} /> : null}
                        </span>
                      </span>

                      <span className="min-w-0 flex grow flex-col items-start justify-center">
                        <span
                          className={`block w-full truncate font-medium ${
                            item.status === 'completed' ? 'line-through text-base-content/60' : ''
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="text-sm text-base-content/70">
                          {item.quantity} {PANTRY_UNIT_LABELS[item.unit]}
                        </span>
                      </span>

                      <span className="flex shrink-0 flex-col items-start justify-center gap-1">
                        <span
                          className="max-w-[140px] truncate text-xs text-base-content/60"
                          title={item.shopName ?? 'Sin tienda'}
                        >
                          {item.shopName ?? 'Sin tienda'}
                        </span>
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-circle btn-sm btn-outline btn-warning"
                            onClick={(event) => {
                              event.stopPropagation()
                              onEdit(item)
                            }}
                            title="Editar"
                            aria-label="Editar"
                          >
                            <Pencil size={14} strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-circle btn-sm btn-outline btn-error"
                            onClick={(event) => {
                              event.stopPropagation()
                              void onDelete(item.id)
                            }}
                            title="Eliminar"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </span>
                      </span>
                    </button>
                  </div>
                </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ShoppingListPage() {
  const {
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
  } = useShoppingList()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<ShoppingListItem | null>(null)
  const [shops, setShops] = useState<ShopOption[]>([])
  const [groupByShop, setGroupByShop] = useState(false)
  const [groupByCategory, setGroupByCategory] = useState(false)

  const activeGrouping = useMemo(
    () => getGroupingFromToggles(groupByShop, groupByCategory),
    [groupByShop, groupByCategory],
  )

  useEffect(() => {
    if (grouping !== activeGrouping) {
      setGrouping(activeGrouping)
    }
  }, [activeGrouping, grouping, setGrouping])

  useEffect(() => {
    let isMounted = true

    async function loadShops() {
      try {
        const result = await fetchShops()
        if (isMounted) {
          setShops(result)
        }
      } catch {
        if (isMounted) {
          setShops([])
        }
      }
    }

    void loadShops()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-base-content">Lista de la compra</h1>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={14} />
              Añadir producto
            </button>
          </div>
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-base-content/80">
              <ShoppingCart size={15} />
              Agrupar por
            </div>
            <div className="join">
              <button
                type="button"
                className={`btn btn-sm join-item ${groupByShop ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setGroupByShop((prev) => !prev)}
              >
                Tienda
              </button>
              <button
                type="button"
                className={`btn btn-sm join-item ${groupByCategory ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setGroupByCategory((prev) => !prev)}
              >
                Categoría
              </button>
            </div>
          </div>
        </section>

        <ShoppingListItems
          groups={groupedItems}
          onEdit={setSelectedItemToEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteItem}
        />
      </div>

      <AddShoppingItemModal
        isOpen={isAddModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddManualItem}
      />

      <EditShoppingItemModal
        key={selectedItemToEdit?.id ?? 'closed'}
        item={selectedItemToEdit}
        shops={shops}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedItemToEdit(null)}
        onSubmit={async (input) => {
          if (!selectedItemToEdit) {
            return
          }

          await handleEditItem(selectedItemToEdit.id, input)
        }}
      />

      {toast ? (
        <AppToast
          message={toast.message}
          type={toast.type as ShoppingToast['type']}
          autoCloseMs={3000}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  )
}
