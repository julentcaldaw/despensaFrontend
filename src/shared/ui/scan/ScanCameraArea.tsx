import { Camera } from 'lucide-react'

interface ScanCameraAreaProps {
  scannerElementId: string
  isHidden: boolean
  isStarting: boolean
  isLookingUpProduct: boolean
  scanError: string | null
}

export function ScanCameraArea({
  scannerElementId,
  isHidden,
  isStarting,
  isLookingUpProduct,
  scanError,
}: ScanCameraAreaProps) {
  return (
    <>
      <div
        id={scannerElementId}
        className={`mx-auto min-h-[280px] overflow-hidden rounded-box border border-base-300 bg-base-100 ${
          isHidden ? 'hidden' : ''
        }`}
      />

      {isStarting ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-base-content/70">
          <span className="loading loading-spinner loading-sm" />
          Iniciando camara...
        </div>
      ) : null}

      {isLookingUpProduct ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-base-content/70">
          <span className="loading loading-spinner loading-sm" />
          Consultando Open Food Facts...
        </div>
      ) : null}

      {scanError ? (
        <div role="alert" className="alert alert-warning mt-3 py-2">
          <Camera size={16} />
          <span className="text-sm">{scanError}</span>
        </div>
      ) : null}
    </>
  )
}
