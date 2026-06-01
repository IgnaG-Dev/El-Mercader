import Modal from './Modal'
import Button from './Button'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

export default function ConfirmDialog({
  open, onClose, onConfirm,
  title = 'Confirmar eliminación',
  message,
  confirmLabel = 'Eliminar',
  loading,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <div className="p-6">
        <p className="text-body-md text-on-surface mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
