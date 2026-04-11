import { X } from 'lucide-react'
import { useScanModal } from './useScanModal'
import { ScanContextFields } from './ScanContextFields'
import { ScanCameraArea } from './ScanCameraArea'
import { ScanProductResult } from './ScanProductResult'

export type { ScanDetectedPayload } from './useScanModal'

interface ScanCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onDetected: (payload: import('./useScanModal').ScanDetectedPayload) => void
  title?: string
  description?: string
}

export function ScanCodeModal({
  isOpen,
  onClose,
  onDetected,
  title = 'Escanear codigo',
  description = 'Apunta la camara al codigo de barras o QR del producto.',
}: ScanCodeModalProps) {
  const {
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
    canConfirm,
    handleCloseModal,
    handleAddToPantry,
    handleAddAndScanAnother,
  } = useScanModal({ isOpen, onClose, onDetected })

  if (!isOpen) {
    return null
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box h-dvh max-h-dvh w-full max-w-full rounded-none sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-box">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm text-base-content/70">{description}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={handleCloseModal}>
            <X size={16} />
          </button>
        </div>

        <div className="rounded-box">
          <ScanContextFields
            shops={shops}
            selectedShopId={selectedShopId}
            onShopChange={setSelectedShopId}
            expiresAt={expiresAt}
            onExpiresAtChange={setExpiresAt}
            todayDate={todayDate}
          />

          <ScanCameraArea
            scannerElementId={scannerElementId}
            isHidden={Boolean(detectedCode)}
            isStarting={isStarting}
            isLookingUpProduct={isLookingUpProduct}
            scanError={scanError}
          />

          {detectedCode ? (
            <ScanProductResult
              detectedCode={detectedCode}
              productInfo={productInfo}
              lookupError={lookupError}
              highSuggestions={highSuggestions}
              lowSuggestions={lowSuggestions}
              isLoadingSuggestions={isLoadingSuggestions}
              suggestionsError={suggestionsError}
              selectedSuggestionId={selectedSuggestionId}
              onSuggestionSelect={setSelectedSuggestionId}
              canConfirm={canConfirm}
              onAddToPantry={handleAddToPantry}
              onAddAndScanAnother={handleAddAndScanAnother}
            />
          ) : null}
        </div>
      </div>

      <form method="dialog" className="modal-backdrop" onClick={handleCloseModal}>
        <button type="button" />
      </form>
    </dialog>
  )
}
