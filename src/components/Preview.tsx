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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-background">
        <div ref={previewRef} className="foundry-preview"></div>
      </div>
    </div>
  )
}

