import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  lookupOpenFoodFactsByBarcode,
  type OpenFoodFactsProduct,
} from '../../lib/integrations/open-food-facts'
import {
  searchIngredientSimilarity,
  type IngredientSimilaritySuggestion,
} from '../../lib/api/ingredient-similarity.api'
import { fetchShops, type ShopOption } from '../../lib/api/shops.api'

export interface ScanDetectedPayload {
  code: string
  source: 'camera' | 'manual'
  product: OpenFoodFactsProduct | null
  shopId: number | null
  shopName: string | null
  ingredientId: number
  ingredientName: string
  expiresAt: string | null
  action: 'add' | 'add_and_continue'
}

export interface ScanModalState {
  scannerElementId: string
  isStarting: boolean
  scanError: string | null
  isLookingUpProduct: boolean
  detectedCode: string | null
  productInfo: OpenFoodFactsProduct | null
  lookupError: string | null
  highSuggestions: IngredientSimilaritySuggestion[]
  lowSuggestions: IngredientSimilaritySuggestion[]
  isLoadingSuggestions: boolean
  suggestionsError: string | null
  shops: ShopOption[]
  selectedShopId: number | null
  setSelectedShopId: (id: number | null) => void
  selectedSuggestionId: number | null
  setSelectedSuggestionId: (id: number | null) => void
  expiresAt: string
  setExpiresAt: (date: string) => void
  todayDate: string
  canConfirm: boolean
  handleCloseModal: () => void
  handleAddToPantry: () => void
  handleAddAndScanAnother: () => void
}

interface ScanModalOptions {
  isOpen: boolean
  onClose: () => void
  onDetected: (payload: ScanDetectedPayload) => void
}

export function useScanModal({ isOpen, onClose, onDetected }: ScanModalOptions): ScanModalState {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef<{ value: string; timestamp: number } | null>(null)
  const regionId = useId()
  const scannerElementId = useMemo(() => `scan-region-${regionId.replace(/:/g, '')}`, [regionId])
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [isStarting, setIsStarting] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [restartToken, setRestartToken] = useState(0)
  const [isLookingUpProduct, setIsLookingUpProduct] = useState(false)
  const [detectedCode, setDetectedCode] = useState<string | null>(null)
  const [detectedSource, setDetectedSource] = useState<'camera' | 'manual' | null>(null)
  const [productInfo, setProductInfo] = useState<OpenFoodFactsProduct | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [highSuggestions, setHighSuggestions] = useState<IngredientSimilaritySuggestion[]>([])
  const [lowSuggestions, setLowSuggestions] = useState<IngredientSimilaritySuggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const [shops, setShops] = useState<ShopOption[]>([])
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>(null)
  const [expiresAt, setExpiresAt] = useState('')

  // ─── Scanner lifecycle ─────────────────────────────────────────────────────

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) {
      return
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop()
      }
      await scanner.clear()
    } catch {
      // Ignorar errores de cierre para no bloquear UX.
    } finally {
      scannerRef.current = null
    }
  }, [])

  const handleDetectedCode = useCallback(
    async (code: string, source: 'camera' | 'manual') => {
      const normalized = code.trim()
      if (!normalized) {
        return
      }

      setDetectedCode(normalized)
      setDetectedSource(source)
      setProductInfo(null)
      setLookupError(null)
      setHighSuggestions([])
      setLowSuggestions([])
      setSuggestionsError(null)
      setSelectedSuggestionId(null)
      setIsLookingUpProduct(true)
      await stopScanner()

      try {
        const lookupResult = await lookupOpenFoodFactsByBarcode(normalized)

        if (!lookupResult.found) {
          setLookupError('No se encontro informacion del producto en Open Food Facts.')
          return
        }

        setProductInfo(lookupResult.product)

        const productName = lookupResult.product?.productName?.trim()
        if (productName) {
          setIsLoadingSuggestions(true)
          try {
            const result = await searchIngredientSimilarity({ barcode: normalized, name: productName })
            setHighSuggestions(result.high.slice(0, 2))
            setLowSuggestions(result.low.slice(0, 4))
          } catch {
            setSuggestionsError('No se pudieron cargar sugerencias de ingredientes.')
          } finally {
            setIsLoadingSuggestions(false)
          }
        }
      } catch {
        setLookupError('No se pudo consultar Open Food Facts en este momento.')
        setIsLoadingSuggestions(false)
      } finally {
        setIsLookingUpProduct(false)
      }
    },
    [stopScanner],
  )

  useEffect(() => {
    if (!isOpen) {
      void stopScanner()
      setScanError(null)
      setIsLookingUpProduct(false)
      setDetectedCode(null)
      setDetectedSource(null)
      setProductInfo(null)
      setLookupError(null)
      setHighSuggestions([])
      setLowSuggestions([])
      setIsLoadingSuggestions(false)
      setSuggestionsError(null)
      setSelectedSuggestionId(null)
      setExpiresAt('')
      return
    }

    fetchShops().then(setShops).catch(() => setShops([]))

    let cancelled = false

    async function initScanner() {
      setIsStarting(true)
      setScanError(null)

      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.333334 }

      const onSuccess = (decodedText: string) => {
        const normalized = decodedText.trim()
        if (!normalized) {
          return
        }

        const now = Date.now()
        if (
          lastScanRef.current &&
          lastScanRef.current.value === normalized &&
          now - lastScanRef.current.timestamp < 2000
        ) {
          return
        }

        lastScanRef.current = { value: normalized, timestamp: now }
        void handleDetectedCode(normalized, 'camera')
      }

      const onDecodeError = () => {
        // Errores de frame se ignoran; son esperables durante el escaneo.
      }

      try {
        const scanner = new Html5Qrcode(scannerElementId, { verbose: false })
        scannerRef.current = scanner

        try {
          await scanner.start({ facingMode: { exact: 'environment' } }, config, onSuccess, onDecodeError)
        } catch {
          await scanner.start({ facingMode: 'environment' }, config, onSuccess, onDecodeError)
        }

        if (cancelled) {
          await stopScanner()
        }
      } catch {
        setScanError('No se pudo iniciar la camara. Revisa permisos o usa entrada manual.')
      } finally {
        if (!cancelled) {
          setIsStarting(false)
        }
      }
    }

    void initScanner()

    return () => {
      cancelled = true
      void stopScanner()
    }
  }, [handleDetectedCode, isOpen, scannerElementId, restartToken, stopScanner])

  // Defensive: garantiza que la camara se detenga en cuanto hay un resultado
  useEffect(() => {
    if (detectedCode) {
      void stopScanner()
    }
  }, [detectedCode, stopScanner])

  // ─── Actions ───────────────────────────────────────────────────────────────

  function buildPayload(action: 'add' | 'add_and_continue'): ScanDetectedPayload | null {
    if (!detectedCode || !detectedSource || selectedSuggestionId === null) {
      return null
    }

    const suggestion = [...highSuggestions, ...lowSuggestions].find(
      (s) => s.id === selectedSuggestionId,
    )

    if (!suggestion) {
      return null
    }

    return {
      code: detectedCode,
      source: detectedSource,
      product: productInfo,
      shopId: selectedShopId,
      shopName: shops.find((s) => s.id === selectedShopId)?.name ?? null,
      ingredientId: suggestion.id,
      ingredientName: suggestion.name,
      expiresAt: expiresAt || null,
      action,
    }
  }

  function resetForNextScan() {
    setDetectedCode(null)
    setDetectedSource(null)
    setProductInfo(null)
    setLookupError(null)
    setHighSuggestions([])
    setLowSuggestions([])
    setIsLoadingSuggestions(false)
    setSuggestionsError(null)
    setSelectedSuggestionId(null)
    setIsLookingUpProduct(false)
    lastScanRef.current = null
    setRestartToken((prev) => prev + 1)
  }

  function handleAddToPantry() {
    const payload = buildPayload('add')
    if (payload) {
      onDetected(payload)
    }
  }

  function handleAddAndScanAnother() {
    const payload = buildPayload('add_and_continue')
    if (payload) {
      onDetected(payload)
      resetForNextScan()
    }
  }

  const handleCloseModal = useCallback(() => {
    void stopScanner()
    onClose()
  }, [onClose, stopScanner])

  // ─── Return ────────────────────────────────────────────────────────────────

  return {
    scannerElementId,
    isStarting,
    scanError,
    isLookingUpProduct,
    detectedCode,
    productInfo,
    lookupError,
    highSuggestions,
    lowSuggestions,
    isLoadingSuggestions,
    suggestionsError,
    shops,
    selectedShopId,
    setSelectedShopId,
    selectedSuggestionId,
    setSelectedSuggestionId,
    expiresAt,
    setExpiresAt,
    todayDate,
    canConfirm: selectedSuggestionId !== null && !isLookingUpProduct,
    handleCloseModal,
    handleAddToPantry,
    handleAddAndScanAnother,
  }
}
