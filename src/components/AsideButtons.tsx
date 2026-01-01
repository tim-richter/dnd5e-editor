import { Editor } from '@tiptap/react'

interface AsideButtonsProps {
  editor: Editor
}

type BlockType = 'advice' | 'narrative' | 'notable'

const blockTypes: { type: BlockType; label: string; icon: string }[] = [
  { type: 'advice', label: 'Advice/Quest', icon: '💬' },
  { type: 'narrative', label: 'Narrative', icon: '📖' },
  { type: 'notable', label: 'Notable', icon: '⭐' },
]

export default function AsideButtons({ editor }: AsideButtonsProps) {
  const insertBlock = (type: BlockType) => {
    switch (type) {
      case 'advice':
        editor
          .chain()
          .focus()
          .insertContent(
            `<div class="fvtt advice"><figure class="icon"><img src="icons/equipment/chest/robe-layered-red.webp" class="round"></figure><article><h4></h4><p></p></article></div>`
          )
          .run()
        break
      case 'narrative':
        editor
          .chain()
          .focus()
          .insertContent(`<aside class="fvtt narrative"><p></p></aside>`)
          .run()
        break
      case 'notable':
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'aside',
            attrs: { class: 'notable' },
            content: [
              {
                type: 'heading',
                attrs: { level: 4 },
                content: [],
              },
              {
                type: 'paragraph',
                content: [],
              },
            ],
          })
          .run()
        break
    }
  }

  return (
    <div className="toolbar-group">
      {blockTypes.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => insertBlock(type)}
          title={`Insert ${label} Block`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

