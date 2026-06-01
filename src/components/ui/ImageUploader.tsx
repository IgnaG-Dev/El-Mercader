import { useRef, useState, useCallback, useEffect } from 'react'
import { uploadProductImage, deleteProductImage } from '../../services/storage'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 3 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (files: File[]) => {
    const slots = maxImages - images.length
    if (slots <= 0) return
    const valid = files
      .filter(f => f.type.startsWith('image/'))
      .slice(0, slots)
    if (valid.length === 0) return

    setUploading(true)
    setError('')
    try {
      const urls = await Promise.all(valid.map(uploadProductImage))
      onChange([...images, ...urls])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }, [images, maxImages, onChange])

  // Global paste listener — works anywhere in the modal
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (images.length >= maxImages) return
      const files = Array.from(e.clipboardData?.items ?? [])
        .filter(i => i.type.startsWith('image/'))
        .map(i => i.getAsFile())
        .filter(Boolean) as File[]
      if (files.length) upload(files)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [upload, images.length, maxImages])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    upload(Array.from(e.dataTransfer.files))
  }

  async function removeImage(idx: number) {
    const url = images[idx]
    onChange(images.filter((_, i) => i !== idx))
    // best-effort delete from storage (don't block UI)
    deleteProductImage(url).catch(() => {})
  }

  const canAdd = images.length < maxImages && !uploading

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { upload(Array.from(e.target.files ?? [])); e.target.value = '' }}
      />

      {/* Primary image slot */}
      <div
        onDragOver={e => { e.preventDefault(); if (canAdd) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="relative"
      >
        {images[0] ? (
          <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 bg-surface-container">
            <img src={images[0]} alt="Principal" className="w-full h-48 object-cover" />
            <span className="absolute top-2 left-2 bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
              Principal
            </span>
            <button
              type="button"
              onClick={() => removeImage(0)}
              className="absolute top-2 right-2 w-6 h-6 bg-error/90 hover:bg-error text-white rounded-full flex items-center justify-center shadow transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => canAdd && inputRef.current?.click()}
            disabled={!canAdd}
            className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors
              ${dragOver ? 'border-primary bg-primary/10' : 'border-outline-variant hover:border-primary hover:bg-surface-container'}
              ${uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}
            `}
          >
            {uploading ? (
              <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '32px' }}>progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '36px' }}>add_photo_alternate</span>
                <span className="text-sm font-bold text-primary">Subir imagen principal</span>
                <span className="text-xs text-on-surface-variant text-center px-4">
                  Arrastrá, copiá y pegá (Ctrl+V)<br />o hacé click
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Secondary image slots */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2].map(idx => {
          const url = images[idx]
          const isNext = idx === images.length

          if (url) {
            return (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-outline-variant/40 bg-surface-container">
                <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-error/90 hover:bg-error text-white rounded-full flex items-center justify-center shadow transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                </button>
              </div>
            )
          }

          if (isNext && canAdd) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => inputRef.current?.click()}
                className="h-24 border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-surface-container transition-colors cursor-pointer"
              >
                {uploading ? (
                  <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '20px' }}>progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>add_photo_alternate</span>
                    <span className="text-xs text-on-surface-variant">Agregar</span>
                  </>
                )}
              </button>
            )
          }

          // Empty locked slot
          return (
            <div key={idx} className="h-24 border border-dashed border-outline-variant/30 rounded-lg flex items-center justify-center opacity-30">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>image</span>
            </div>
          )
        })}
      </div>

      {error && (
        <p className="text-error text-xs flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
          {error}
        </p>
      )}

      <p className="text-xs text-on-surface-variant text-center">
        Arrastrá · Pegá (Ctrl+V) · o hacé click · Máx {maxImages} imágenes · 5 MB
      </p>
    </div>
  )
}
