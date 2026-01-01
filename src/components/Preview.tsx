import { useEffect, useRef } from 'react'
import '../styles/foundry-preview.css'

interface PreviewProps {
  htmlContent: string
}

export default function Preview({ htmlContent }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (previewRef.current) {
      // Process the HTML to style roll commands
      let processedHtml = htmlContent

      // Ensure roll commands are properly styled
      processedHtml = processedHtml.replace(
        /<span[^>]*data-command="([^"]*)"[^>]*class="roll-command"[^>]*>([^<]*)<\/span>/g,
        '<span class="roll-command" data-command="$1">$2</span>'
      )

      // Also handle roll commands without the class attribute
      processedHtml = processedHtml.replace(
        /<span[^>]*data-command="([^"]*)"[^>]*>([^<]*)<\/span>/g,
        (match, command, text) => {
          if (!match.includes('class=')) {
            return `<span class="roll-command" data-command="${command}">${text}</span>`
          }
          return match
        }
      )

      previewRef.current.innerHTML = processedHtml
    }
  }, [htmlContent])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent)
      // Show feedback
      const button = document.querySelector('.copy-button') as HTMLButtonElement
      if (button) {
        const originalText = button.textContent
        button.textContent = 'Copied!'
        button.style.background = '#28a745'
        setTimeout(() => {
          button.textContent = originalText
          button.style.background = ''
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h2>Preview</h2>
        <button className="copy-button" onClick={handleCopy}>
          Copy HTML
        </button>
      </div>
      <div className="preview-content">
        <div ref={previewRef} className="foundry-preview"></div>
      </div>
    </div>
  )
}

