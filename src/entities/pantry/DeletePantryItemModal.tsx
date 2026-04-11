interface DeletePantryItemModalProps {
  itemName: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeletePantryItemModal({
  itemName,
  onCancel,
  onConfirm,
}: DeletePantryItemModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="card bg-base-100 shadow-xl max-w-sm mx-4">
        <div className="card-body">
          <h3 className="font-bold text-lg">Confirmar eliminación</h3>
          <p className="text-base-content/70">
            ¿Estas seguro de que deseas eliminar "{itemName}"?
          </p>
          <div className="card-actions justify-end gap-2 mt-4">
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>
              Cancelar
            </button>
            <button className="btn btn-error btn-sm" onClick={onConfirm}>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
