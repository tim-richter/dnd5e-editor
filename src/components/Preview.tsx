import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
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

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      // Strip spans from roll commands, keeping only the command syntax
      let cleanedHtml = htmlContent
      
      // Helper function to unescape HTML entities from attribute values
      const unescapeHtml = (str: string): string => {
        return str
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
      }
      
      // Replace roll command spans with just the command text
      // Matches spans with data-command attribute and roll-command class
      // Handles attributes in any order
      cleanedHtml = cleanedHtml.replace(
        /<span[^>]*data-command="([^"]*)"[^>]*class="roll-command"[^>]*>([^<]*)<\/span>/g,
        (match, command) => {
          return unescapeHtml(command)
        }
      )
      
      // Also handle roll commands with class="roll-command" but attribute order might differ
      cleanedHtml = cleanedHtml.replace(
        /<span[^>]*class="roll-command"[^>]*data-command="([^"]*)"[^>]*>([^<]*)<\/span>/g,
        (match, command) => {
          return unescapeHtml(command)
        }
      )
      
      // Fallback: handle roll commands with data-command but without explicit class
      // Only replace if it looks like a roll command
      cleanedHtml = cleanedHtml.replace(
        /<span[^>]*data-command="([^"]*)"[^>]*>([^<]*)<\/span>/g,
        (match, command) => {
          const unescaped = unescapeHtml(command)
          // Only replace if it looks like a roll command
          if (unescaped.match(/\[\[\/(check|skill|tool|attack)/)) {
            return unescaped
          }
          return match
        }
      )
      
      await navigator.clipboard.writeText(cleanedHtml)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#2c3e50] text-white p-4 flex justify-between items-center shadow-md">
        <h2 className="text-xl font-semibold m-0">Preview</h2>
        <Button
          onClick={handleCopy}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {copied ? 'Copied!' : 'Copy HTML'}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div ref={previewRef} className="foundry-preview"></div>
      </div>
    </div>
  )
}

