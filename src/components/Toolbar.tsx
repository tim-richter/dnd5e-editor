import { Editor } from '@tiptap/react'
import { useState } from 'react'
import AsideButtons from './AsideButtons'
import RollCommandButtons from './RollCommandButtons'
import ImportModal from './ImportModal'
import { parseRollCommand } from '../utils/rollCommandParser'
import './Toolbar.css'

interface ToolbarProps {
  editor: Editor
}

export default function Toolbar({ editor }: ToolbarProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleImport = (html: string) => {
    // Process HTML to convert plain text roll commands to proper span elements
    const processedHtml = processHtmlForRollCommands(html)
    editor.commands.setContent(processedHtml)
  }

  /**
   * Processes HTML to detect and convert plain text roll commands to proper span elements
   */
  function processHtmlForRollCommands(html: string): string {
    // Match roll command patterns: [[/check ...]], [[/skill ...]], [[/tool ...]], [[/attack ...]]
    // This regex matches the full command including the brackets
    const rollCommandRegex = /\[\[\/(check|skill|tool|attack)([^\]]*)\]\]/g

    return html.replace(rollCommandRegex, (match) => {
      // Parse the command to validate it
      const parsed = parseRollCommand(match)
      if (!parsed) {
        // If parsing fails, return the original match
        return match
      }

      // Escape the command for HTML attribute (only quotes and ampersands)
      const escapedForAttr = match.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      // Escape the command for HTML text content
      const escapedForText = match
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<span class="roll-command" data-command="${escapedForAttr}">${escapedForText}</span>`
    })
  }

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-section">
          <div className="toolbar-group">
            <button
              onClick={() => setIsImportModalOpen(true)}
              title="Import HTML"
            >
              📥 Import
            </button>
          </div>
          <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
            title="Underline"
          >
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            title="Numbered List"
          >
            1.
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => {
              const url = window.prompt('Enter URL:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            className={editor.isActive('link') ? 'is-active' : ''}
            title="Insert Link"
          >
            🔗
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
            title="Align Left"
          >
            ⬅
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
            title="Align Center"
          >
            ⬌
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
            title="Align Right"
          >
            ➡
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            ↶
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-divider"></div>
        <span className="toolbar-label">Foundry</span>
        <AsideButtons editor={editor} />
      </div>

      <div className="toolbar-section">
        <div className="toolbar-divider"></div>
        <span className="toolbar-label">D&D 5e</span>
        <RollCommandButtons editor={editor} />
      </div>
    </div>
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </>
  )
}

