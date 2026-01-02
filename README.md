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

### D&D 5e Aside Elements
Custom buttons to insert Foundry-specific aside elements:
- **Advice/Quest**: `<aside class="advice">...</aside>`
- **Narrative**: `<aside class="fvtt narrative">...</aside>`
- **Notable**: `<aside class="notable">...</aside>`

### D&D 5e Roll Commands & Enrichers
Buttons to insert Foundry's inline roll syntax and enrichers:

#### Roll Enrichers
- **Ability/Skill Checks**: `[[/check acrobatics]]`, `[[/check strength]]`, `[[/check skill=perception dc=15]]`
- **Saving Throws**: `[[/save dexterity]]`, `[[/save constitution 20]]`, `[[/concentration dc=15]]`
- **Attack Rolls**: `[[/attack +5]]`, `[[/attack formula=5 attackMode=thrown]]`
- **Damage Rolls**: `[[/damage 2d6 fire]]`, `[[/damage 1d4 fire cold average]]`
- **Healing Rolls**: `[[/heal 2d4 + 2]]`, `[[/heal 10 temp]]`, `[[/heal formula="2d4 + 2" type=healing]]`
- **Item Usage**: `[[/item Bite]]`, `[[/item Bite activity=Poison]]`, `[[/item Actor.xxx.Item.yyy]]`
- **Reference Enricher**: `&Reference[prone]`, `&Reference[condition=blinded apply=false]`, `&Reference[strength]`, `&Reference[skill=perception]`, `&Reference[rule="Difficult Terrain"]`

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

### GitHub Pages Deployment

The project is configured for automatic deployment to GitHub Pages:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy the site
3. The site will be available at `https://<username>.github.io/dnd5e-editor/`

**Note:** If your repository name is different, update the `base` path in `vite.config.ts` to match your repository name.

To manually trigger a deployment, go to the Actions tab in GitHub and run the "Deploy to GitHub Pages" workflow.

## Usage

1. Edit your content in the left pane using the toolbar buttons
2. Preview how it will look in Foundry VTT in the right pane
3. Click "Copy HTML" to copy the generated HTML to your clipboard
4. Paste the HTML into your Foundry VTT journal entry

## Enrichers Documentation

### Check Enricher (`[[/check ...]]`, `[[/skill ...]]`, `[[/tool ...]]`)

Creates ability checks, skill checks, or tool checks.

**Examples:**
- `[[/check dex]]` - Simple dexterity check
- `[[/check ability=dexterity dc=20]]` - Dexterity check with DC
- `[[/check skill=acrobatics dc=15]]` - Acrobatics skill check
- `[[/check skill=perception dc=15 passive=true]]` - Passive perception check
- `[[/skill perception]]` - Skill check (alternative syntax)
- `[[/check activity=RLQlsLo5InKHZadn]]` - Check from activity ID

### Save Enricher (`[[/save ...]]`, `[[/concentration ...]]`)

Creates saving throw rolls.

**Examples:**
- `[[/save dex]]` - Dexterity saving throw
- `[[/save dexterity 20]]` - Dexterity save with DC 20
- `[[/save ability=str/dex dc=20]]` - Multiple ability saves
- `[[/concentration dc=15]]` - Concentration check
- `[[/save activity=RLQlsLo5InKHZadn]]` - Save from activity ID

### Attack Enricher (`[[/attack ...]]`)

Creates attack roll buttons.

**Examples:**
- `[[/attack +5]]` - Attack with +5 modifier
- `[[/attack formula=5 attackMode=thrown]]` - Thrown weapon attack
- `[[/attack activity=jdRTb04FngE1B8cF]]` - Attack from activity ID
- `[[/attack formula=5 format=extended]]` - Extended format display

### Damage Enricher (`[[/damage ...]]`)

Creates damage roll buttons.

**Examples:**
- `[[/damage 2d6 fire]]` - Fire damage roll
- `[[/damage 1d4 fire cold]]` - Multiple damage types
- `[[/damage 2d6 fire average]]` - Show average damage
- `[[/damage 1d6 bludgeoning & 1d4 fire]]` - Multiple damage rolls
- `[[/damage activity=RLQlsLo5InKHZadn]]` - Damage from activity ID

### Heal Enricher (`[[/heal ...]]`)

Creates healing roll buttons.

**Examples:**
- `[[/heal 2d4 + 2]]` - Healing roll
- `[[/heal 10 temp]]` - Temporary hit points
- `[[/heal 2d4 + 2 average]]` - Show average healing
- `[[/heal formula="2d4 + 2" type=healing]]` - Explicit format
- `[[/heal activity=jdRTb04FngE1B8cF]]` - Healing from activity ID

### Item Enricher (`[[/item ...]]`)

Creates item usage buttons that trigger item actions in Foundry VTT.

**Examples:**
- `[[/item Bite]]` - Use item by name
- `[[/item Bite activity=Poison]]` - Use specific activity on item
- `[[/item Tentacles activity="Escape Tentacles"]]` - Activity with spaces (quoted)
- `[[/item Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU]]` - Use item by UUID
- `[[/item amUUCouL69OK1GZU]]` - Use item by relative ID

### Reference Enricher (`&Reference[...]`)

Creates rich tooltips and links to D&D 5e rules. This enricher automatically converts rule names into clickable links with tooltips in Foundry VTT.

**Supported Categories:**
- **Conditions**: `blinded`, `charmed`, `prone`, `stunned`, etc.
- **Abilities**: `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma`
- **Skills**: `acrobatics`, `athletics`, `perception`, `stealth`, etc.
- **Damage Types**: `fire`, `cold`, `lightning`, `necrotic`, `radiant`, etc.
- **Creature Types**: `dragon`, `undead`, `fiend`, `celestial`, etc.
- **Spell Schools**: `evocation`, `abjuration`, `necromancy`, etc.
- **Spell Components**: `concentration`, `material`, `ritual`, `somatic`, `verbal`
- **Area of Effect**: `cone`, `cube`, `sphere`, `line`, `square`
- **Other Rules**: `inspiration`, `carryingCapacity`, `encumbrance`, `hiding`, etc.
- **Generic Rules**: Any custom rule name

**Examples:**
- `&Reference[prone]` - Condition reference (auto-detected)
- `&Reference[condition=blinded apply=false]` - Condition without apply button
- `&Reference[strength]` - Ability reference
- `&Reference[ability=dexterity]` - Explicit ability reference
- `&Reference[skill=perception]` - Skill reference
- `&Reference[fire]` - Damage type reference
- `&Reference[damageType=cold]` - Explicit damage type
- `&Reference[rule="Difficult Terrain"]` - Generic rule reference
- `&Reference[Difficult Terrain]` - Generic rule (auto-detected)

**Abbreviations Supported:**
- Abilities: `str`, `dex`, `con`, `int`, `wis`, `cha`
- Skills: `acr`, `ath`, `prc`, `ste`, etc.
- Spell Schools: `abj`, `con`, `div`, `enc`, `evo`, `ill`, `nec`, `trs`

The enricher automatically normalizes names (case-insensitive) and can infer the category from the name, or you can explicitly specify it.

## Technology Stack

- **React** with TypeScript
- **TipTap** - Modern rich text editor
- **Vite** - Build tool and dev server

## License

ISC

