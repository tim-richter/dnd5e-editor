# Foundry VTT D&D 5e HTML Editor

A React-based WYSIWYG HTML editor specifically designed for creating journal entries for Foundry VTT with D&D 5e system support.

## Features

### Standard HTML Editor Features
- Paragraphs and headers (H1-H6)
- Bold, italic, underline
- Ordered and unordered lists
- Links
- Text alignment (left, center, right)
- Undo/redo

### Foundry VTT Aside Elements
Custom buttons to insert Foundry-specific aside elements:
- **Note aside**: `<aside class="note">...</aside>`
- **Secret aside**: `<aside class="secret">...</aside>` (GM-only content)
- **Read-aloud aside**: `<aside class="readaloud">...</aside>`
- **Hint aside**: `<aside class="hint">...</aside>`

### D&D 5e Roll Commands
Buttons to insert Foundry's inline roll syntax:
- **Skill checks**: `@check[acrobatics]`, `@check[perception]`, etc.
- **Ability checks**: `@check[strength]`, `@check[wisdom]`, etc.
- **Saving throws**: `@save[dexterity]`, `@save[constitution]`, etc.
- **Attack rolls**: `@attack[strength]`, etc.
- **Damage rolls**: `@damage[1d6]`, `@damage[2d8+3]`, etc.
- **Spell references**: `@spell[fireball]`
- **Item references**: `@item[longsword]`

### Preview & Copy
- Live HTML preview styled with Foundry-compatible CSS
- One-click copy to clipboard functionality

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The editor will be available at `http://localhost:5173`

### Build

```bash
pnpm build
```

## Usage

1. Edit your content in the left pane using the toolbar buttons
2. Preview how it will look in Foundry VTT in the right pane
3. Click "Copy HTML" to copy the generated HTML to your clipboard
4. Paste the HTML into your Foundry VTT journal entry

## Technology Stack

- **React** with TypeScript
- **TipTap** - Modern rich text editor
- **Vite** - Build tool and dev server

## License

ISC

