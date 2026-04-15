import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Check, ImagePlus, Pencil, Plus, ShoppingCart, Tag, Trash2, X } from 'lucide-react'
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

interface CompletePurchaseModalProps {
  isOpen: boolean
  shops: ShopOption[]
  selectedCount: number
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (shopId: number, totalPaidEur: number, imageFile?: File | null) => Promise<void>
}

function CompletePurchaseModal({
  isOpen,
  shops,
  selectedCount,
  isSubmitting,
  onClose,
  onConfirm,
}: CompletePurchaseModalProps) {
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [shopId, setShopId] = useState<number | null>(null)
  const [totalPaidInput, setTotalPaidInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const imagePreviewUrl = useMemo(() => {
    if (!imageFile) {
      return null
    }

    return URL.createObjectURL(imageFile)
  }, [imageFile])

  function stopCameraStream() {
    if (!streamRef.current) {
      return
    }

    streamRef.current.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    return () => {
      stopCameraStream()
    }
  }, [])

  useEffect(() => {
    if (!imagePreviewUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  useEffect(() => {
    let isCancelled = false

    async function startCamera() {
      if (!isCameraOpen) {
        stopCameraStream()
        return
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('La cámara no está disponible en este navegador.')
        cameraInputRef.current?.click()
        setIsCameraOpen(false)
        return
      }

      stopCameraStream()
      setCameraError(null)

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play().catch(() => {
            setCameraError('No se pudo iniciar la previsualización de la cámara.')
          })
        }
      } catch {
        setCameraError('No se pudo acceder a la cámara del dispositivo.')
        setIsCameraOpen(false)
      }
    }

    void startCamera()

    return () => {
      isCancelled = true
      stopCameraStream()
    }
  }, [isCameraOpen])

  async function handleCapturePhoto() {
    if (!videoRef.current) {
      return
    }

    const video = videoRef.current
    const width = video.videoWidth
    const height = video.videoHeight

    if (!width || !height) {
      setCameraError('La cámara todavía no está lista para capturar.')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      setCameraError('No se pudo procesar la imagen capturada.')
      return
    }

    context.drawImage(video, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92)
    })

    if (!blob) {
      setCameraError('No se pudo generar la imagen capturada.')
      return
    }

    setImageFile(new File([blob], `ticket-${Date.now()}.jpg`, { type: 'image/jpeg' }))
    setCameraError(null)
    setIsCameraOpen(false)
  }

  if (!isOpen) {
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (shopId === null) {
      setError('Selecciona una tienda para completar la compra')
      return
    }

    const parsedTotalPaid = Number(totalPaidInput.replace(',', '.'))
    if (!Number.isFinite(parsedTotalPaid) || parsedTotalPaid <= 0) {
      setError('Introduce el precio pagado en euros (mayor que 0)')
      return
    }

    setError(null)

    try {
      await onConfirm(shopId, parsedTotalPaid, imageFile)
      onClose()
    } catch {
      // El feedback principal lo maneja el hook.
    }
  }

  return (
    <dialog className="modal modal-open">
      <form
        className="modal-box h-dvh max-h-dvh w-full max-w-full rounded-none sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-box"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Completar compra</h3>
            <p className="mt-1 text-sm text-base-content/70">
              Vas a crear una compra con {selectedCount} ingrediente{selectedCount === 1 ? '' : 's'} seleccionados.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <ShopSelect
          id="complete-purchase-shop"
          label="Tienda"
          shops={shops}
          value={shopId}
          onChange={(nextShopId) => {
            setShopId(nextShopId)
            setError(null)
          }}
        />

        <div className="mt-3">
          <label htmlFor="complete-purchase-total-paid" className="label pb-1">
            <span className="label-text">Precio</span>
          </label>
          <input
            id="complete-purchase-total-paid"
            type="number"
            min="0.01"
            step="0.01"
            className="input input-bordered w-full"
            placeholder="0.00"
            value={totalPaidInput}
            onChange={(event) => {
              setTotalPaidInput(event.target.value)
              setError(null)
            }}
          />
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-base-content">Imagen del ticket</p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setCameraError(null)
                setIsCameraOpen(false)
                galleryInputRef.current?.click()
              }}
            >
              <ImagePlus size={14} /> Cargar imagen
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setCameraError(null)

                if (navigator.mediaDevices?.getUserMedia) {
                  setIsCameraOpen(true)
                  return
                }

                cameraInputRef.current?.click()
              }}
            >
              <Camera size={14} /> Usar cámara
            </button>
            {isCameraOpen ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsCameraOpen(false)}
              >
                Cerrar cámara
              </button>
            ) : null}
            {imageFile ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setImageFile(null)
                  setCameraError(null)
                }}
              >
                Quitar imagen
              </button>
            ) : null}
          </div>

          {isCameraOpen ? (
            <div className="space-y-3 rounded-box border border-base-300 bg-base-200/40 p-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-[4/3] w-full rounded-box bg-black object-cover"
              />
              <div className="flex justify-end">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleCapturePhoto()}>
                  Capturar foto
                </button>
              </div>
            </div>
          ) : null}

          {imagePreviewUrl && !isCameraOpen ? (
            <div className="rounded-box border border-base-300 bg-base-200/40 p-3">
              <img
                src={imagePreviewUrl}
                alt="Vista previa del ticket seleccionado"
                className="max-h-64 w-full rounded-box object-contain"
              />
            </div>
          ) : null}

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              setImageFile(event.target.files?.[0] ?? null)
              setCameraError(null)
            }}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              setImageFile(event.target.files?.[0] ?? null)
              setCameraError(null)
            }}
          />

          {cameraError ? <p className="text-xs text-warning">{cameraError}</p> : null}

          <p className="text-xs text-base-content/60">
            {imageFile ? `Seleccionada: ${imageFile.name}` : 'Puedes adjuntar una imagen del ticket desde el dispositivo o la cámara.'}
          </p>
        </div>

        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Completando...' : 'Completar compra'}
          </button>
        </div>
      </form>

      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button" />
      </form>
    </dialog>
  )
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
                  <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full items-center gap-3 text-left cursor-pointer" onClick={() => void onToggleStatus(item)} role="button" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') { onToggleStatus(item) } }}>
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

                      <span className="max-w-[140px] truncate text-xs text-base-content/60 ml-2" title={item.shopName ?? 'Sin tienda'}>
                        {item.shopName ?? 'Sin tienda'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 md:mt-0">
                      <button
                        type="button"
                        className="btn btn-circle btn-sm btn-outline btn-warning"
                        onClick={event => {
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
                        onClick={event => {
                          event.stopPropagation()
                          void onDelete(item.id)
                        }}
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
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
    handleCompletePurchase,
  } = useShoppingList()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<ShoppingListItem | null>(null)
  const [isCompletePurchaseModalOpen, setIsCompletePurchaseModalOpen] = useState(false)
  const [shops, setShops] = useState<ShopOption[]>([])
  const [groupByShop, setGroupByShop] = useState(false)
  const [groupByCategory, setGroupByCategory] = useState(false)

  const activeGrouping = useMemo(
    () => getGroupingFromToggles(groupByShop, groupByCategory),
    [groupByShop, groupByCategory],
  )
  const completedItems = useMemo(
    () => groupedItems.flatMap((group) => group.items).filter((item) => item.status === 'completed'),
    [groupedItems],
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-success btn-sm"
                disabled={completedItems.length === 0 || isSubmitting}
                onClick={() => setIsCompletePurchaseModalOpen(true)}
              >
                Completar compra
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={14} />
                Añadir producto
              </button>
            </div>
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

      {isCompletePurchaseModalOpen ? (
        <CompletePurchaseModal
          isOpen={isCompletePurchaseModalOpen}
          shops={shops}
          selectedCount={completedItems.length}
          isSubmitting={isSubmitting}
          onClose={() => setIsCompletePurchaseModalOpen(false)}
          onConfirm={async (shopId, totalPaidEur, imageFile) => {
            await handleCompletePurchase(completedItems, shopId, totalPaidEur, imageFile)
          }}
        />
      ) : null}

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
