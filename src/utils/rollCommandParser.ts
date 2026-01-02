import {
  ABILITIES,
  ABILITY_ABBREVIATIONS,
  SKILLS,
  SKILL_ABBREVIATIONS,
  type CheckEnricherOptions,
  type AttackEnricherOptions,
} from './rollCommands'

/**
 * Normalizes ability name (handles abbreviations and full names)
 */
function normalizeAbility(ability: string): string {
  const lower = ability.toLowerCase()
  if (ABILITY_ABBREVIATIONS[lower]) {
    return ABILITY_ABBREVIATIONS[lower]
  }
  if (ABILITIES.includes(lower as typeof ABILITIES[number])) {
    return lower
  }
  return ability
}

/**
 * Normalizes skill name (handles abbreviations and full names)
 */
function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase()
  if (SKILL_ABBREVIATIONS[lower]) {
    return SKILL_ABBREVIATIONS[lower]
  }
  if (SKILLS.includes(lower as typeof SKILLS[number])) {
    return lower
  }
  return skill
}

/**
 * Parses a roll command string and extracts structured options
 * Supports formats like:
 * - [[/check acrobatics dc=15]]
 * - [[/check dex 15]]
 * - [[/check ability=dexterity dc=20]]
 * - [[/skill perception]]
 * - [[/attack +5]]
 * - [[/attack formula=5 attackMode=thrown]]
 */
export function parseRollCommand(command: string): {
  type: 'check' | 'skill' | 'tool' | 'attack'
  options: CheckEnricherOptions | AttackEnricherOptions
  originalCommand: string
} | null {
  // Match roll command pattern: [[/type ...]]
  const match = command.match(/\[\[\/(check|skill|tool|attack)([^\]]*)\]\]/)
  if (!match) {
    return null
  }

  const type = match[1] as 'check' | 'skill' | 'tool' | 'attack'
  const body = match[2].trim()

  if (type === 'attack') {
    return {
      type: 'attack',
      options: parseAttackCommand(body),
      originalCommand: command,
    }
  } else {
    return {
      type,
      options: parseCheckCommand(body),
      originalCommand: command,
    }
  }
}

/**
 * Parses a check/skill/tool command body
 */
function parseCheckCommand(body: string): CheckEnricherOptions {
  const options: CheckEnricherOptions = {}

  if (!body) {
    return options
  }

  // Check for explicit key=value format
  const hasExplicitFormat = body.includes('=')

  if (hasExplicitFormat) {
    // Parse explicit format: ability=dexterity dc=15 skill=acrobatics
    const parts = body.split(/\s+/)
    for (const part of parts) {
      const [key, ...valueParts] = part.split('=')
      const value = valueParts.join('=') // Handle values that might contain '='

      switch (key) {
        case 'ability':
          options.ability = normalizeAbility(value)
          break
        case 'skill':
          // Handle slash-separated skills: skill=acr/ath
          if (value.includes('/')) {
            options.skill = value.split('/').map(normalizeSkill)
          } else {
            options.skill = normalizeSkill(value)
          }
          break
        case 'tool':
          // Handle slash-separated tools: tool=thieves-tools/other
          if (value.includes('/')) {
            options.tool = value.split('/')
          } else {
            options.tool = value
          }
          break
        case 'vehicle':
          options.vehicle = value
          break
        case 'dc':
          // Try to parse as number, otherwise keep as string (formula)
          const numValue = parseInt(value)
          options.dc = isNaN(numValue) ? value : numValue
          break
        case 'format':
          if (value === 'short' || value === 'long') {
            options.format = value
          }
          break
        case 'passive':
          options.passive = value === 'true'
          break
        case 'activity':
          options.activity = value
          break
        case 'rules':
          if (value === '2014' || value === '2024') {
            options.rules = value
          }
          break
      }
    }
  } else {
    // Parse shorthand format: dex 15, acrobatics, perception 20, etc.
    const parts = body.split(/\s+/).filter((p) => p.length > 0)

    if (parts.length === 0) {
      return options
    }

    // Try to identify what each part is
    const identified: {
      ability?: string
      skills: string[]
      dc?: string | number
    } = { skills: [] }

    for (const part of parts) {
      const lower = part.toLowerCase()

      // Check if it's an ability
      if (
        ABILITIES.includes(lower as typeof ABILITIES[number]) ||
        ABILITY_ABBREVIATIONS[lower]
      ) {
        identified.ability = normalizeAbility(lower)
        continue
      }

      // Check if it's a skill
      if (
        SKILLS.includes(lower as typeof SKILLS[number]) ||
        SKILL_ABBREVIATIONS[lower]
      ) {
        identified.skills.push(normalizeSkill(lower))
        continue
      }

      // Check if it's a number (DC)
      const numValue = parseInt(part)
      if (!isNaN(numValue)) {
        identified.dc = numValue
        continue
      }

      // If we can't identify it, assume it's a skill (for custom skills)
      identified.skills.push(part)
    }

    // Map identified parts to options
    if (identified.ability) {
      options.ability = identified.ability
    }

    if (identified.skills.length > 0) {
      options.skill =
        identified.skills.length === 1
          ? identified.skills[0]
          : identified.skills
    }

    if (identified.dc !== undefined) {
      options.dc = identified.dc
    }
  }

  return options
}

/**
 * Parses an attack command body
 */
function parseAttackCommand(body: string): AttackEnricherOptions {
  const options: AttackEnricherOptions = {}

  if (!body) {
    return options
  }

  // Check for explicit key=value format
  const hasExplicitFormat = body.includes('=')

  if (hasExplicitFormat) {
    // Parse explicit format: formula=5 attackMode=thrown
    const parts = body.split(/\s+/)
    for (const part of parts) {
      const [key, ...valueParts] = part.split('=')
      const value = valueParts.join('=')

      switch (key) {
        case 'formula':
          // Try to parse as number, otherwise keep as string
          const numValue = parseInt(value.replace(/^[+-]/, ''))
          options.formula = isNaN(numValue) ? value : numValue
          break
        case 'activity':
          options.activity = value
          break
        case 'attackMode':
          options.attackMode = value
          break
        case 'format':
          if (value === 'short' || value === 'long' || value === 'extended') {
            options.format = value
          }
          break
        case 'rules':
          if (value === '2014' || value === '2024') {
            options.rules = value
          }
          break
      }
    }
  } else {
    // Parse shorthand format: +5, 5 thrown, extended, etc.
    const parts = body.split(/\s+/).filter((p) => p.length > 0)

    if (parts.length === 0) {
      return options
    }

    // Check if first part is a format keyword
    if (parts[0] === 'short' || parts[0] === 'long' || parts[0] === 'extended') {
      options.format = parts[0] as 'short' | 'long' | 'extended'
      return options
    }

    // Check if first part is a formula (number or +number)
    const firstPart = parts[0]
    const formulaMatch = firstPart.match(/^([+-]?)(\d+)$/)
    if (formulaMatch) {
      const numValue = parseInt(formulaMatch[2])
      options.formula = formulaMatch[1] === '+' || formulaMatch[1] === '' ? numValue : -numValue

      // Check if there's an attack mode as second part
      if (parts.length > 1) {
        options.attackMode = parts[1]
      }
    } else {
      // Treat as formula string
      options.formula = firstPart
      if (parts.length > 1) {
        options.attackMode = parts[1]
      }
    }
  }

  return options
}



