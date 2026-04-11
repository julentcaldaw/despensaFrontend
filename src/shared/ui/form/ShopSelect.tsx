import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { updateShopLike, type ShopOption } from '../../lib/api/shops.api'
import { LikeHeartControl } from '../feedback/LikeHeartControl'

interface ShopSelectProps {
  id: string
  label: string
  shops: ShopOption[]
  value: number | null
  onChange: (shopId: number | null) => void
  placeholder?: string
  disabled?: boolean
}

export function ShopSelect({
  id,
  label,
  shops,
  value,
  onChange,
  placeholder = 'Sin tienda',
  disabled,
}: ShopSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLUListElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const [updatingLikeId, setUpdatingLikeId] = useState<number | null>(null)
  const [likeOverrides, setLikeOverrides] = useState<Record<number, boolean>>({})
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)

  const selectedShop = shops.find((shop) => shop.id === value) ?? null

  function openDropdown() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width })
    setIsOpen(true)
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleScroll(event: Event) {
      if (dropdownRef.current?.contains(event.target as Node)) return
      if (isOpen) setIsOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen && event.key !== 'Enter' && event.key !== ' ') {
        return
      }

      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
        return
      }

      if (!isOpen && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        openDropdown()
        return
      }

      // Keyboard navigation in dropdown
      const totalOptions = shops.length + 1 // +1 for "Sin tienda" option

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedIndex((prev) => {
          if (prev === null) return 0
          return Math.min(prev + 1, totalOptions - 1)
        })
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedIndex((prev) => {
          if (prev === null) return totalOptions - 1
          return Math.max(prev - 1, 0)
        })
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        if (highlightedIndex === 0) {
          onChange(null)
        } else if (highlightedIndex !== null && highlightedIndex > 0) {
          const shop = shops[highlightedIndex - 1]
          if (shop) {
            onChange(shop.id)
          }
        }
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('scroll', handleScroll, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, shops, highlightedIndex, onChange])

  function getLikeValue(shop: ShopOption): boolean {
    if (shop.id in likeOverrides) {
      return likeOverrides[shop.id]
    }

    return shop.like
  }

  async function handleToggleLike(shop: ShopOption): Promise<void> {
    if (disabled || updatingLikeId === shop.id) {
      return
    }

    const currentLike = getLikeValue(shop)
    const nextLike = !currentLike

    setUpdatingLikeId(shop.id)
    setLikeOverrides((prev) => ({ ...prev, [shop.id]: nextLike }))

    try {
      await updateShopLike(shop.id, nextLike)
    } catch {
      setLikeOverrides((prev) => ({ ...prev, [shop.id]: currentLike }))
    } finally {
      setUpdatingLikeId(null)
    }
  }

  function renderHeart(shop: ShopOption) {
    const isLiked = getLikeValue(shop)

    return (
      <LikeHeartControl
        liked={isLiked}
        disabled={disabled || updatingLikeId === shop.id}
        labelLiked="Quitar tienda favorita"
        labelUnliked="Marcar tienda como favorita"
        stopPropagation
        preventDefault
        onToggle={() => handleToggleLike(shop)}
      />
    )
  }

  return (
    <div ref={rootRef} className="w-full space-y-1">
      <label htmlFor={id} className="label pb-1">
        <span className="label-text">{label}</span>
      </label>

      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="btn btn-outline w-full justify-between border-base-300 bg-base-100 font-normal"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
      >
        <span className="truncate text-left">{selectedShop?.name ?? placeholder}</span>
        <span className="ml-2 flex items-center gap-2">
          {selectedShop ? renderHeart(selectedShop) : null}
          <ChevronDown size={14} className="opacity-70" />
        </span>
      </button>

      {isOpen && dropdownRect
        ? createPortal(
            <ul
              ref={dropdownRef}
              id={`${id}-listbox`}
              role="listbox"
              style={{
                position: 'fixed',
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
              }}
              className="z-[9999] mt-1 max-h-64 space-y-1 overflow-auto rounded-box bg-white p-2 text-sm text-black shadow-lg"
            >
              <li className="list-none">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === null}
                  tabIndex={highlightedIndex === 0 ? 0 : -1}
                  className={`flex w-full items-center justify-between rounded-btn px-3 py-2 text-left ${
                    highlightedIndex === 0 ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    onChange(null)
                    setIsOpen(false)
                  }}
                >
                  <span>{placeholder}</span>
                </button>
              </li>
              {shops.map((shop, index) => (
                <li key={shop.id} className="list-none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === shop.id}
                    tabIndex={highlightedIndex === index + 1 ? 0 : -1}
                    className={`flex w-full items-center justify-between rounded-btn px-3 py-2 text-left ${
                      highlightedIndex === index + 1 ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      onChange(shop.id)
                      setIsOpen(false)
                    }}
                  >
                    <span className="truncate">{shop.name}</span>
                    {renderHeart(shop)}
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}
