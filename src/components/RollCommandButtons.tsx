import { useState, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'
import {
  SKILLS,
  ABILITIES,
  createSkillCheck,
  createAbilityCheck,
  createSavingThrow,
  createDamageRoll,
  createAttackRoll,
  createSpellReference,
  createItemReference,
  createCheckEnricher,
  type AttackEnricherOptions,
  type CheckEnricherOptions,
} from '../utils/rollCommands'
import { parseRollCommand } from '../utils/rollCommandParser'
import './RollCommandButtons.css'

interface RollCommandButtonsProps {
  editor: Editor
}

export default function RollCommandButtons({ editor }: RollCommandButtonsProps) {
  const [showSkillMenu, setShowSkillMenu] = useState(false)
  const [showAbilityMenu, setShowAbilityMenu] = useState(false)
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const [showAttackMenu, setShowAttackMenu] = useState(false)
  const [showAttackDialog, setShowAttackDialog] = useState(false)
  const [showCheckDialog, setShowCheckDialog] = useState(false)
  const [checkDialogType, setCheckDialogType] = useState<'check' | 'skill' | 'tool'>('check')
  const [attackOptions, setAttackOptions] = useState<AttackEnricherOptions>({})
  const [checkOptions, setCheckOptions] = useState<CheckEnricherOptions>({})
  const [editingPosition, setEditingPosition] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSkillMenu(false)
        setShowAbilityMenu(false)
        setShowSaveMenu(false)
        setShowAttackMenu(false)
      }
    }

    if (showSkillMenu || showAbilityMenu || showSaveMenu || showAttackMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showSkillMenu, showAbilityMenu, showSaveMenu, showAttackMenu])

  // Listen for roll command click events
  useEffect(() => {
    const handleRollCommandClick = (event: Event) => {
      const customEvent = event as CustomEvent<{
        command: string
        position: number
        node: any
      }>
      const { command, position } = customEvent.detail

      // Parse the command to determine type and options
      const parsed = parseRollCommand(command)
      if (!parsed) {
        return
      }

      // Set editing state
      setIsEditing(true)
      setEditingPosition(position)

      if (parsed.type === 'attack') {
        // Open attack dialog with parsed options
        setAttackOptions(parsed.options as AttackEnricherOptions)
        setShowAttackDialog(true)
      } else {
        // Open check dialog with parsed options
        setCheckDialogType(parsed.type)
        setCheckOptions(parsed.options as CheckEnricherOptions)
        setShowCheckDialog(true)
      }
    }

    window.addEventListener('rollCommandClick', handleRollCommandClick)
    return () => {
      window.removeEventListener('rollCommandClick', handleRollCommandClick)
    }
  }, [])

  const insertRollCommand = (command: string) => {
    editor.chain().focus().setRollCommand(command).run()
  }

  const handleDamageRoll = () => {
    const formula = window.prompt('Enter damage formula (e.g., 1d6, 2d8+3):')
    if (formula) {
      insertRollCommand(createDamageRoll(formula))
    }
  }

  const handleSpellReference = () => {
    const spellName = window.prompt('Enter spell name:')
    if (spellName) {
      insertRollCommand(createSpellReference(spellName))
    }
  }

  const handleItemReference = () => {
    const itemName = window.prompt('Enter item name:')
    if (itemName) {
      insertRollCommand(createItemReference(itemName))
    }
  }

  const handleAttackRoll = () => {
    setShowAttackDialog(true)
    setAttackOptions({})
    setIsEditing(false)
    setEditingPosition(null)
  }

  const handleAttackDialogSubmit = () => {
    const newCommand = createAttackRoll(attackOptions)
    
    if (isEditing && editingPosition !== null) {
      // Update existing command
      const { state } = editor.view
      const { tr } = state
      const $pos = state.doc.resolve(editingPosition)
      
      // Find the rollCommand node at this position
      let nodePos = editingPosition
      let nodeSize = 0
      
      // Check if we're at the start of a rollCommand node
      const node = $pos.nodeAfter
      if (node && node.type.name === 'rollCommand') {
        nodeSize = node.nodeSize
      } else {
        // Try to find the node by checking parent nodes
        for (let i = $pos.depth; i > 0; i--) {
          const parent = $pos.node(i)
          if (parent.type.name === 'rollCommand') {
            nodePos = $pos.start(i)
            nodeSize = parent.nodeSize
            break
          }
        }
      }
      
      if (nodeSize > 0) {
        // Replace the node
        tr.replaceWith(nodePos, nodePos + nodeSize, state.schema.nodes.rollCommand.create({
          command: newCommand
        }))
        editor.view.dispatch(tr)
      }
    } else {
      // Insert new command
      insertRollCommand(newCommand)
    }
    
    setShowAttackDialog(false)
    setAttackOptions({})
    setIsEditing(false)
    setEditingPosition(null)
  }

  const handleAttackDialogCancel = () => {
    setShowAttackDialog(false)
    setAttackOptions({})
    setIsEditing(false)
    setEditingPosition(null)
  }

  const handleDefaultAttack = (ability?: string) => {
    // Insert default attack enricher with +5 to hit
    // This is a common default for simple attack rolls
    insertRollCommand(createAttackRoll({ formula: 5 }))
    setShowAttackMenu(false)
  }

  const handleCheckEnricher = (type: 'check' | 'skill' | 'tool' = 'check') => {
    setCheckDialogType(type)
    setShowCheckDialog(true)
    setCheckOptions({})
    setIsEditing(false)
    setEditingPosition(null)
  }

  const handleCheckDialogSubmit = () => {
    const newCommand = createCheckEnricher(checkOptions, checkDialogType)
    
    if (isEditing && editingPosition !== null) {
      // Update existing command
      const { state } = editor.view
      const { tr } = state
      const $pos = state.doc.resolve(editingPosition)
      
      // Find the rollCommand node at this position
      let nodePos = editingPosition
      let nodeSize = 0
      
      // Check if we're at the start of a rollCommand node
      const node = $pos.nodeAfter
      if (node && node.type.name === 'rollCommand') {
        nodeSize = node.nodeSize
      } else {
        // Try to find the node by checking parent nodes
        for (let i = $pos.depth; i > 0; i--) {
          const parent = $pos.node(i)
          if (parent.type.name === 'rollCommand') {
            nodePos = $pos.start(i)
            nodeSize = parent.nodeSize
            break
          }
        }
      }
      
      if (nodeSize > 0) {
        // Replace the node
        tr.replaceWith(nodePos, nodePos + nodeSize, state.schema.nodes.rollCommand.create({
          command: newCommand
        }))
        editor.view.dispatch(tr)
      }
    } else {
      // Insert new command
      insertRollCommand(newCommand)
    }
    
    setShowCheckDialog(false)
    setCheckOptions({})
    setIsEditing(false)
    setEditingPosition(null)
  }

  const handleCheckDialogCancel = () => {
    setShowCheckDialog(false)
    setCheckOptions({})
    setIsEditing(false)
    setEditingPosition(null)
  }

  return (
    <div className="roll-command-buttons" ref={dropdownRef}>
      <div className="toolbar-group">
        <div className="dropdown">
          <button
            onClick={() => {
              setShowSkillMenu(!showSkillMenu)
              setShowAbilityMenu(false)
              setShowSaveMenu(false)
              setShowAttackMenu(false)
            }}
            title="Skill Check"
          >
            Skill Check ▼
          </button>
          {showSkillMenu && (
            <div className="dropdown-menu">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    insertRollCommand(createSkillCheck(skill))
                    setShowSkillMenu(false)
                  }}
                  className="dropdown-item"
                >
                  {skill.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
              <button
                onClick={() => {
                  handleCheckEnricher('skill')
                  setShowSkillMenu(false)
                }}
                className="dropdown-item"
                style={{ fontWeight: 'bold', borderTop: '1px solid #ccc', marginTop: '4px', paddingTop: '8px' }}
              >
                Advanced Options...
              </button>
            </div>
          )}
        </div>

        <div className="dropdown">
          <button
            onClick={() => {
              setShowAbilityMenu(!showAbilityMenu)
              setShowSkillMenu(false)
              setShowSaveMenu(false)
              setShowAttackMenu(false)
            }}
            title="Ability Check"
          >
            Ability Check ▼
          </button>
          {showAbilityMenu && (
            <div className="dropdown-menu">
              {ABILITIES.map((ability) => (
                <button
                  key={ability}
                  onClick={() => {
                    insertRollCommand(createAbilityCheck(ability))
                    setShowAbilityMenu(false)
                  }}
                  className="dropdown-item"
                >
                  {ability.charAt(0).toUpperCase() + ability.slice(1)}
                </button>
              ))}
              <button
                onClick={() => {
                  handleCheckEnricher('check')
                  setShowAbilityMenu(false)
                }}
                className="dropdown-item"
                style={{ fontWeight: 'bold', borderTop: '1px solid #ccc', marginTop: '4px', paddingTop: '8px' }}
              >
                Advanced Options...
              </button>
            </div>
          )}
        </div>

        <div className="dropdown">
          <button
            onClick={() => {
              setShowSaveMenu(!showSaveMenu)
              setShowSkillMenu(false)
              setShowAbilityMenu(false)
              setShowAttackMenu(false)
            }}
            title="Saving Throw"
          >
            Saving Throw ▼
          </button>
          {showSaveMenu && (
            <div className="dropdown-menu">
              {ABILITIES.map((ability) => (
                <button
                  key={ability}
                  onClick={() => {
                    insertRollCommand(createSavingThrow(ability))
                    setShowSaveMenu(false)
                  }}
                  className="dropdown-item"
                >
                  {ability.charAt(0).toUpperCase() + ability.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown">
          <button
            onClick={() => {
              setShowAttackMenu(!showAttackMenu)
              setShowSkillMenu(false)
              setShowAbilityMenu(false)
              setShowSaveMenu(false)
            }}
            title="Attack Roll"
          >
            Attack Roll ▼
          </button>
          {showAttackMenu && (
            <div className="dropdown-menu">
              {ABILITIES.map((ability) => (
                <button
                  key={ability}
                  onClick={() => handleDefaultAttack(ability)}
                  className="dropdown-item"
                >
                  {ability.charAt(0).toUpperCase() + ability.slice(1)} Attack
                </button>
              ))}
              <button
                onClick={handleAttackRoll}
                className="dropdown-item"
                style={{ fontWeight: 'bold', borderTop: '1px solid #ccc', marginTop: '4px', paddingTop: '8px' }}
              >
                Advanced Options...
              </button>
            </div>
          )}
        </div>

        <button onClick={handleDamageRoll} title="Damage Roll">
          Damage
        </button>
        <button onClick={handleSpellReference} title="Spell Reference">
          Spell
        </button>
        <button onClick={handleItemReference} title="Item Reference">
          Item
        </button>
      </div>

      {/* Check Enricher Dialog */}
      {showCheckDialog && (
        <div className="attack-dialog-overlay" onClick={handleCheckDialogCancel}>
          <div className="attack-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{isEditing ? 'Edit' : 'Insert'} Check Enricher ({checkDialogType})</h3>
            <div className="attack-dialog-content">
              <div className="attack-dialog-field">
                <label>
                  Ability (optional):
                  <select
                    value={checkOptions.ability || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setCheckOptions({
                        ...checkOptions,
                        ability: value || undefined,
                      })
                    }}
                  >
                    <option value="">None</option>
                    {ABILITIES.map((ability) => (
                      <option key={ability} value={ability}>
                        {ability.charAt(0).toUpperCase() + ability.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Skill(s) (optional, separate multiple with commas):
                  <input
                    type="text"
                    placeholder="acrobatics, athletics"
                    value={Array.isArray(checkOptions.skill) ? checkOptions.skill.join(', ') : (checkOptions.skill || '')}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      if (value === '') {
                        const { skill, ...rest } = checkOptions
                        setCheckOptions(rest)
                      } else {
                        const skills = value.split(',').map(s => s.trim()).filter(s => s)
                        setCheckOptions({
                          ...checkOptions,
                          skill: skills.length > 1 ? skills : skills[0],
                        })
                      }
                    }}
                  />
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Tool(s) (optional, separate multiple with commas):
                  <input
                    type="text"
                    placeholder="thieves-tools"
                    value={Array.isArray(checkOptions.tool) ? checkOptions.tool.join(', ') : (checkOptions.tool || '')}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      if (value === '') {
                        const { tool, ...rest } = checkOptions
                        setCheckOptions(rest)
                      } else {
                        const tools = value.split(',').map(t => t.trim()).filter(t => t)
                        setCheckOptions({
                          ...checkOptions,
                          tool: tools.length > 1 ? tools : tools[0],
                        })
                      }
                    }}
                  />
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Vehicle (optional):
                  <input
                    type="text"
                    placeholder="water"
                    value={checkOptions.vehicle || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      setCheckOptions({
                        ...checkOptions,
                        vehicle: value || undefined,
                      })
                    }}
                  />
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  DC (optional, number or formula like "@abilities.con.dc"):
                  <input
                    type="text"
                    placeholder="15 or @abilities.con.dc"
                    value={checkOptions.dc?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      if (value === '') {
                        const { dc, ...rest } = checkOptions
                        setCheckOptions(rest)
                      } else {
                        // Try to parse as number, otherwise keep as string (formula)
                        const numValue = parseInt(value)
                        setCheckOptions({
                          ...checkOptions,
                          dc: isNaN(numValue) ? value : numValue,
                        })
                      }
                    }}
                  />
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Format (optional):
                  <select
                    value={checkOptions.format || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setCheckOptions({
                        ...checkOptions,
                        format: (value || undefined) as 'short' | 'long' | undefined,
                      })
                    }}
                  >
                    <option value="">Default</option>
                    <option value="short">Short</option>
                    <option value="long">Long</option>
                  </select>
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  <input
                    type="checkbox"
                    checked={checkOptions.passive || false}
                    onChange={(e) => {
                      setCheckOptions({
                        ...checkOptions,
                        passive: e.target.checked || undefined,
                      })
                    }}
                  />
                  Passive check
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Activity ID (optional):
                  <input
                    type="text"
                    placeholder="RLQlsLo5InKHZadn"
                    value={checkOptions.activity || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      setCheckOptions({
                        ...checkOptions,
                        activity: value || undefined,
                      })
                    }}
                  />
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Rules Version (optional, only affects skill+tool combinations):
                  <select
                    value={checkOptions.rules || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setCheckOptions({
                        ...checkOptions,
                        rules: (value || undefined) as '2014' | '2024' | undefined,
                      })
                    }}
                  >
                    <option value="">Default</option>
                    <option value="2014">2014 (Legacy)</option>
                    <option value="2024">2024</option>
                  </select>
                </label>
              </div>

              <div className="attack-dialog-preview">
                <strong>Preview:</strong>
                <code>{createCheckEnricher(checkOptions, checkDialogType)}</code>
              </div>
            </div>

            <div className="attack-dialog-actions">
              <button onClick={handleCheckDialogCancel}>Cancel</button>
              <button onClick={handleCheckDialogSubmit} className="primary">
                {isEditing ? 'Update' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attack Enricher Dialog */}
      {showAttackDialog && (
        <div className="attack-dialog-overlay" onClick={handleAttackDialogCancel}>
          <div className="attack-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{isEditing ? 'Edit' : 'Insert'} Attack Enricher</h3>
            <div className="attack-dialog-content">
              <div className="attack-dialog-field">
                <label>
                  Formula (e.g., "+5", "5", or leave empty):
                  <input
                    type="text"
                    placeholder="+5"
                    value={attackOptions.formula?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      if (value === '') {
                        const { formula, ...rest } = attackOptions
                        setAttackOptions(rest)
                      } else {
                        // Try to parse as number, otherwise keep as string
                        const numValue = parseInt(value.replace(/^\+/, ''))
                        setAttackOptions({
                          ...attackOptions,
                          formula: isNaN(numValue) ? value : numValue,
                        })
                      }
                    }}
                  />
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Activity ID (optional):
                  <input
                    type="text"
                    placeholder="jdRTb04FngE1B8cF"
                    value={attackOptions.activity || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      setAttackOptions({
                        ...attackOptions,
                        activity: value || undefined,
                      })
                    }}
                  />
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Attack Mode (optional):
                  <select
                    value={attackOptions.attackMode || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setAttackOptions({
                        ...attackOptions,
                        attackMode: value || undefined,
                      })
                    }}
                  >
                    <option value="">None</option>
                    <option value="melee">Melee</option>
                    <option value="ranged">Ranged</option>
                    <option value="thrown">Thrown</option>
                  </select>
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Format (optional):
                  <select
                    value={attackOptions.format || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setAttackOptions({
                        ...attackOptions,
                        format: (value || undefined) as 'short' | 'long' | 'extended' | undefined,
                      })
                    }}
                  >
                    <option value="">Default</option>
                    <option value="short">Short</option>
                    <option value="long">Long</option>
                    <option value="extended">Extended</option>
                  </select>
                </label>
              </div>

              <div className="attack-dialog-field">
                <label>
                  Rules Version (optional, only affects extended format):
                  <select
                    value={attackOptions.rules || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setAttackOptions({
                        ...attackOptions,
                        rules: (value || undefined) as '2014' | '2024' | undefined,
                      })
                    }}
                  >
                    <option value="">Default</option>
                    <option value="2014">2014 (Legacy)</option>
                    <option value="2024">2024</option>
                  </select>
                </label>
              </div>

              <div className="attack-dialog-preview">
                <strong>Preview:</strong>
                <code>{createAttackRoll(attackOptions)}</code>
              </div>
            </div>

            <div className="attack-dialog-actions">
              <button onClick={handleAttackDialogCancel}>Cancel</button>
              <button onClick={handleAttackDialogSubmit} className="primary">
                {isEditing ? 'Update' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

