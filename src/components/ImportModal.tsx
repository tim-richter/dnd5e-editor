import { useState } from 'react'
import './ImportModal.css'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (html: string) => void
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [htmlContent, setHtmlContent] = useState('')

  if (!isOpen) return null

  const handleImport = () => {
    if (htmlContent.trim()) {
      onImport(htmlContent.trim())
      setHtmlContent('')
      onClose()
    }
  }

  const handleClose = () => {
    setHtmlContent('')
    onClose()
  }

  return (
    <div className="import-modal-overlay" onClick={handleClose}>
      <div className="import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-modal-header">
          <h2>Import HTML</h2>
          <button className="import-modal-close" onClick={handleClose} title="Close">
            ×
          </button>
        </div>
        <div className="import-modal-body">
          <p className="import-modal-description">
            Paste your HTML content below. The HTML will be imported into the editor and you can edit it normally.
          </p>
          <textarea
            className="import-modal-textarea"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Paste HTML here..."
            autoFocus
          />
        </div>
        <div className="import-modal-footer">
          <button className="import-modal-button import-modal-button-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="import-modal-button import-modal-button-import"
            onClick={handleImport}
            disabled={!htmlContent.trim()}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  )
}


