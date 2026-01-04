import type { Editor } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { ABILITIES } from "@/features/dnd/abilities/abilities";
import {
	type AttackEnricherOptions,
	createAttackRoll,
} from "@/features/dnd/rolls/attack/attackRoll";
import {
	type CheckEnricherOptions,
	createAbilityCheck,
	createCheckEnricher,
	createSkillCheck,
} from "@/features/dnd/rolls/check/checkRoll";
import {
	createBasicRoll,
	type BasicRollEnricherOptions,
} from "@/features/dnd/rolls/basic/basicRoll";
import {
	createDamageRoll,
	type DamageEnricherOptions,
} from "@/features/dnd/rolls/damage/damageRoll";
import {
	createHealRoll,
	type HealEnricherOptions,
} from "@/features/dnd/rolls/heal/healRoll";
import {
	createItemEnricher,
	type ItemEnricherOptions,
} from "@/features/dnd/rolls/item/itemEnricher";
import {
	createReferenceEnricher,
	type ReferenceEnricherOptions,
} from "@/features/dnd/rolls/reference/referenceEnricher";
import {
	ABILITY_REFERENCES,
	CONDITION_REFERENCES,
	DAMAGE_TYPE_REFERENCES,
	SKILL_REFERENCES,
} from "@/features/dnd/rolls/reference/references";
import {
	createSaveEnricher,
	type SaveEnricherOptions,
} from "@/features/dnd/rolls/save/saveRoll";
import { SKILLS } from "@/features/dnd/skills/skills";
import { createSavingThrow } from "@/utils/rollCommands";
import { parseRollCommand } from "../features/dnd/rolls/parser";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface RollCommandButtonsProps {
	editor: Editor;
}

export default function RollCommandButtons({
	editor,
}: RollCommandButtonsProps) {
	const [showAttackDialog, setShowAttackDialog] = useState(false);
	const [showBasicRollDialog, setShowBasicRollDialog] = useState(false);
	const [showCheckDialog, setShowCheckDialog] = useState(false);
	const [showDamageDialog, setShowDamageDialog] = useState(false);
	const [showHealDialog, setShowHealDialog] = useState(false);
	const [showItemDialog, setShowItemDialog] = useState(false);
	const [showReferenceDialog, setShowReferenceDialog] = useState(false);
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [checkDialogType, setCheckDialogType] = useState<
		"check" | "skill" | "tool"
	>("check");
	const [attackOptions, setAttackOptions] = useState<AttackEnricherOptions>({});
	const [basicRollOptions, setBasicRollOptions] =
		useState<BasicRollEnricherOptions>({});
	const [checkOptions, setCheckOptions] = useState<CheckEnricherOptions>({});
	const [damageOptions, setDamageOptions] = useState<DamageEnricherOptions>({});
	const [healOptions, setHealOptions] = useState<HealEnricherOptions>({});
	const [itemOptions, setItemOptions] = useState<ItemEnricherOptions>({});
	const [referenceOptions, setReferenceOptions] =
		useState<ReferenceEnricherOptions>({});
	const [saveOptions, setSaveOptions] = useState<SaveEnricherOptions>({});
	const [itemMethod, setItemMethod] = useState<"name" | "uuid" | "relativeId">(
		"name",
	);
	const [editingPosition, setEditingPosition] = useState<number | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isConcentration, setIsConcentration] = useState(false);
	const passiveCheckId = useId();

	// Listen for roll command click events
	useEffect(() => {
		const handleRollCommandClick = (event: Event) => {
			const customEvent = event as CustomEvent<{
				command: string;
				position: number;
				node: unknown;
			}>;
			const { command, position } = customEvent.detail;

			// Parse the command to determine type and options
			const parsed = parseRollCommand(command);
			if (!parsed) {
				return;
			}

			// Set editing state
			setIsEditing(true);
			setEditingPosition(position);

			if (parsed.type === "attack") {
				// Open attack dialog with parsed options
				setAttackOptions(parsed.options as AttackEnricherOptions);
				setShowAttackDialog(true);
			} else if (parsed.type === "damage") {
				// Open damage dialog with parsed options
				setDamageOptions(parsed.options as DamageEnricherOptions);
				setShowDamageDialog(true);
			} else if (parsed.type === "heal") {
				// Open heal dialog with parsed options
				setHealOptions(parsed.options as HealEnricherOptions);
				setShowHealDialog(true);
			} else if (parsed.type === "item") {
				// Open item dialog with parsed options
				const itemOpts = parsed.options as ItemEnricherOptions;
				setItemOptions(itemOpts);
				// Determine which method was used
				if (itemOpts.uuid) {
					setItemMethod("uuid");
				} else if (itemOpts.relativeId) {
					setItemMethod("relativeId");
				} else {
					setItemMethod("name");
				}
				setShowItemDialog(true);
			} else if (parsed.type === "reference") {
				// Open reference dialog with parsed options
				setReferenceOptions(parsed.options as ReferenceEnricherOptions);
				setShowReferenceDialog(true);
			} else if (
				parsed.type === "check" ||
				parsed.type === "skill" ||
				parsed.type === "tool"
			) {
				// Open check dialog with parsed options
				setCheckDialogType(parsed.type);
				setCheckOptions(parsed.options as CheckEnricherOptions);
				setShowCheckDialog(true);
			} else if (parsed.type === "save" || parsed.type === "concentration") {
				// Open save dialog with parsed options
				setIsConcentration(parsed.type === "concentration");
				setSaveOptions(parsed.options as SaveEnricherOptions);
				setShowSaveDialog(true);
			} else if (parsed.type === "roll") {
				// Open basic roll dialog with parsed options
				setBasicRollOptions(parsed.options as BasicRollEnricherOptions);
				setShowBasicRollDialog(true);
			}
		};

		window.addEventListener("rollCommandClick", handleRollCommandClick);
		return () => {
			window.removeEventListener("rollCommandClick", handleRollCommandClick);
		};
	}, []);

	const insertRollCommand = (command: string) => {
		// @ts-expect-error - setRollCommand is added by the RollCommand extension
		editor.chain().focus().setRollCommand(command).run();
	};

	const handleDamageRoll = () => {
		setShowDamageDialog(true);
		setDamageOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleDamageDialogSubmit = () => {
		const newCommand = createDamageRoll(damageOptions);

		if (isEditing && editingPosition !== null) {
			// Update existing command
			const { state } = editor.view;
			const { tr } = state;
			const $pos = state.doc.resolve(editingPosition);

			// Find the rollCommand node at this position
			let nodePos = editingPosition;
			let nodeSize = 0;

			// Check if we're at the start of a rollCommand node
			const node = $pos.nodeAfter;
			if (node && node.type.name === "rollCommand") {
				nodeSize = node.nodeSize;
			} else {
				// Try to find the node by checking parent nodes
				for (let i = $pos.depth; i > 0; i--) {
					const parent = $pos.node(i);
					if (parent.type.name === "rollCommand") {
						nodePos = $pos.start(i);
						nodeSize = parent.nodeSize;
						break;
					}
				}
			}

			if (nodeSize > 0) {
				// Replace the node
				tr.replaceWith(
					nodePos,
					nodePos + nodeSize,
					state.schema.nodes.rollCommand.create({
						command: newCommand,
					}),
				);
				editor.view.dispatch(tr);
			}
		} else {
			// Insert new command
			insertRollCommand(newCommand);
		}

		setShowDamageDialog(false);
		setDamageOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleDamageDialogCancel = () => {
		setShowDamageDialog(false);
		setDamageOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleHealRoll = () => {
		setShowHealDialog(true);
		setHealOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleHealDialogSubmit = () => {
		const newCommand = createHealRoll(healOptions);

		if (isEditing && editingPosition !== null) {
			// Update existing command
			const { state } = editor.view;
			const { tr } = state;
			const $pos = state.doc.resolve(editingPosition);

			// Find the rollCommand node at this position
			let nodePos = editingPosition;
			let nodeSize = 0;

			// Check if we're at the start of a rollCommand node
			const node = $pos.nodeAfter;
			if (node && node.type.name === "rollCommand") {
				nodeSize = node.nodeSize;
			} else {
				// Try to find the node by checking parent nodes
				for (let i = $pos.depth; i > 0; i--) {
					const parent = $pos.node(i);
					if (parent.type.name === "rollCommand") {
						nodePos = $pos.start(i);
						nodeSize = parent.nodeSize;
						break;
					}
				}
			}

			if (nodeSize > 0) {
				// Replace the node
				tr.replaceWith(
					nodePos,
					nodePos + nodeSize,
					state.schema.nodes.rollCommand.create({
						command: newCommand,
					}),
				);
				editor.view.dispatch(tr);
			}
		} else {
			// Insert new command
			insertRollCommand(newCommand);
		}

		setShowHealDialog(false);
		setHealOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleHealDialogCancel = () => {
		setShowHealDialog(false);
		setHealOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleItemReference = () => {
		setShowItemDialog(true);
		setItemOptions({});
		setItemMethod("name");
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleItemDialogSubmit = () => {
		const newCommand = createItemEnricher(itemOptions);

		if (isEditing && editingPosition !== null) {
			// Update existing command
			const { state } = editor.view;
			const { tr } = state;
			const $pos = state.doc.resolve(editingPosition);

			// Find the rollCommand node at this position
			let nodePos = editingPosition;
			let nodeSize = 0;

			// Check if we're at the start of a rollCommand node
			const node = $pos.nodeAfter;
			if (node && node.type.name === "rollCommand") {
				nodeSize = node.nodeSize;
			} else {
				// Try to find the node by checking parent nodes
				for (let i = $pos.depth; i > 0; i--) {
					const parent = $pos.node(i);
					if (parent.type.name === "rollCommand") {
						nodePos = $pos.start(i);
						nodeSize = parent.nodeSize;
						break;
					}
				}
			}

			if (nodeSize > 0) {
				// Replace the node
				tr.replaceWith(
					nodePos,
					nodePos + nodeSize,
					editor.schema.nodes.rollCommand.create({ command: newCommand }),
				);
				editor.view.dispatch(tr);
			}
		} else {
			// Insert new command
			insertRollCommand(newCommand);
		}

		// Close dialog and reset state
		setShowItemDialog(false);
		setItemOptions({});
		setItemMethod("name");
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleReferenceEnricher = () => {
		setShowReferenceDialog(true);
		setReferenceOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleItemDialogCancel = () => {
		setShowItemDialog(false);
		setItemOptions({});
		setItemMethod("name");
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleReferenceDialogSubmit = () => {
		const newCommand = createReferenceEnricher(referenceOptions);

		if (isEditing && editingPosition !== null) {
			// Update existing command
			const { state } = editor.view;
			const { tr } = state;
			const $pos = state.doc.resolve(editingPosition);

			// Find the rollCommand node at this position
			let nodePos = editingPosition;
			let nodeSize = 0;

			// Check if we're at the start of a rollCommand node
			const node = $pos.nodeAfter;
			if (node && node.type.name === "rollCommand") {
				nodeSize = node.nodeSize;
			} else {
				// Try to find the node by checking parent nodes
				for (let i = $pos.depth; i > 0; i--) {
					const parent = $pos.node(i);
					if (parent.type.name === "rollCommand") {
						nodePos = $pos.start(i);
						nodeSize = parent.nodeSize;
						break;
					}
				}
			}

			if (nodeSize > 0) {
				// Replace the node
				tr.replaceWith(
					nodePos,
					nodePos + nodeSize,
					editor.schema.nodes.rollCommand.create({ command: newCommand }),
				);
				editor.view.dispatch(tr);
			}
		} else {
			// Insert new command
			insertRollCommand(newCommand);
		}

		// Close dialog and reset state
		setShowReferenceDialog(false);
		setReferenceOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleReferenceDialogCancel = () => {
		setShowReferenceDialog(false);
		setReferenceOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleAttackRoll = () => {
		setShowAttackDialog(true);
		setAttackOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleAttackDialogSubmit = () => {
		const newCommand = createAttackRoll(attackOptions);

		if (isEditing && editingPosition !== null) {
			// Update existing command
			const { state } = editor.view;
			const { tr } = state;
			const $pos = state.doc.resolve(editingPosition);

			// Find the rollCommand node at this position
			let nodePos = editingPosition;
			let nodeSize = 0;

			// Check if we're at the start of a rollCommand node
			const node = $pos.nodeAfter;
			if (node && node.type.name === "rollCommand") {
				nodeSize = node.nodeSize;
			} else {
				// Try to find the node by checking parent nodes
				for (let i = $pos.depth; i > 0; i--) {
					const parent = $pos.node(i);
					if (parent.type.name === "rollCommand") {
						nodePos = $pos.start(i);
						nodeSize = parent.nodeSize;
						break;
					}
				}
			}

			if (nodeSize > 0) {
				// Replace the node
				tr.replaceWith(
					nodePos,
					nodePos + nodeSize,
					state.schema.nodes.rollCommand.create({
						command: newCommand,
					}),
				);
				editor.view.dispatch(tr);
			}
		} else {
			// Insert new command
			insertRollCommand(newCommand);
		}

		setShowAttackDialog(false);
		setAttackOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleAttackDialogCancel = () => {
		setShowAttackDialog(false);
		setAttackOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleCheckEnricher = (type: "check" | "skill" | "tool" = "check") => {
		setCheckDialogType(type);
		setShowCheckDialog(true);
		setCheckOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleCheckDialogSubmit = () => {
		const newCommand = createCheckEnricher(checkOptions, checkDialogType);

		if (isEditing && editingPosition !== null) {
			// Update existing command
			const { state } = editor.view;
			const { tr } = state;
			const $pos = state.doc.resolve(editingPosition);

			// Find the rollCommand node at this position
			let nodePos = editingPosition;
			let nodeSize = 0;

			// Check if we're at the start of a rollCommand node
			const node = $pos.nodeAfter;
			if (node && node.type.name === "rollCommand") {
				nodeSize = node.nodeSize;
			} else {
				// Try to find the node by checking parent nodes
				for (let i = $pos.depth; i > 0; i--) {
					const parent = $pos.node(i);
					if (parent.type.name === "rollCommand") {
						nodePos = $pos.start(i);
						nodeSize = parent.nodeSize;
						break;
					}
				}
			}

			if (nodeSize > 0) {
				// Replace the node
				tr.replaceWith(
					nodePos,
					nodePos + nodeSize,
					state.schema.nodes.rollCommand.create({
						command: newCommand,
					}),
				);
				editor.view.dispatch(tr);
			}
		} else {
			// Insert new command
			insertRollCommand(newCommand);
		}

		setShowCheckDialog(false);
		setCheckOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleCheckDialogCancel = () => {
		setShowCheckDialog(false);
		setCheckOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleSaveRoll = () => {
		setShowSaveDialog(true);
		setSaveOptions({});
		setIsEditing(false);
		setEditingPosition(null);
		setIsConcentration(false);
	};

	const handleSaveDialogSubmit = () => {
		const newCommand = createSaveEnricher(saveOptions, isConcentration);

		if (isEditing && editingPosition !== null) {
			// Update existing command
			const { state } = editor.view;
			const { tr } = state;
			const $pos = state.doc.resolve(editingPosition);

			// Find the rollCommand node at this position
			let nodePos = editingPosition;
			let nodeSize = 0;

			// Check if we're at the start of a rollCommand node
			const node = $pos.nodeAfter;
			if (node && node.type.name === "rollCommand") {
				nodeSize = node.nodeSize;
			} else {
				// Try to find the node by checking parent nodes
				for (let i = $pos.depth; i > 0; i--) {
					const parent = $pos.node(i);
					if (parent.type.name === "rollCommand") {
						nodePos = $pos.start(i);
						nodeSize = parent.nodeSize;
						break;
					}
				}
			}

			if (nodeSize > 0) {
				// Replace the node
				tr.replaceWith(
					nodePos,
					nodePos + nodeSize,
					state.schema.nodes.rollCommand.create({
						command: newCommand,
					}),
				);
				editor.view.dispatch(tr);
			}
		} else {
			// Insert new command
			insertRollCommand(newCommand);
		}

		setShowSaveDialog(false);
		setSaveOptions({});
		setIsEditing(false);
		setEditingPosition(null);
		setIsConcentration(false);
	};

	const handleSaveDialogCancel = () => {
		setShowSaveDialog(false);
		setSaveOptions({});
		setIsEditing(false);
		setEditingPosition(null);
		setIsConcentration(false);
	};

	const handleBasicRoll = () => {
		setShowBasicRollDialog(true);
		setBasicRollOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleBasicRollDialogSubmit = () => {
		const newCommand = createBasicRoll(basicRollOptions);

		if (isEditing && editingPosition !== null) {
			// Update existing command
			const { state } = editor.view;
			const { tr } = state;
			const $pos = state.doc.resolve(editingPosition);

			// Find the rollCommand node at this position
			let nodePos = editingPosition;
			let nodeSize = 0;

			// Check if we're at the start of a rollCommand node
			const node = $pos.nodeAfter;
			if (node && node.type.name === "rollCommand") {
				nodeSize = node.nodeSize;
			} else {
				// Try to find the node by checking parent nodes
				for (let i = $pos.depth; i > 0; i--) {
					const parent = $pos.node(i);
					if (parent.type.name === "rollCommand") {
						nodePos = $pos.start(i);
						nodeSize = parent.nodeSize;
						break;
					}
				}
			}

			if (nodeSize > 0) {
				// Replace the node
				tr.replaceWith(
					nodePos,
					nodePos + nodeSize,
					state.schema.nodes.rollCommand.create({
						command: newCommand,
					}),
				);
				editor.view.dispatch(tr);
			}
		} else {
			// Insert new command
			insertRollCommand(newCommand);
		}

		setShowBasicRollDialog(false);
		setBasicRollOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	const handleBasicRollDialogCancel = () => {
		setShowBasicRollDialog(false);
		setBasicRollOptions({});
		setIsEditing(false);
		setEditingPosition(null);
	};

	return (
		<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" title="Skill Check">
						Skill Check <ChevronDown className="size-4 ml-1" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start">
					{SKILLS.map((skill) => (
						<DropdownMenuItem
							key={skill}
							onSelect={() => {
								insertRollCommand(createSkillCheck(skill));
							}}
						>
							{skill
								.replace(/-/g, " ")
								.replace(/\b\w/g, (l) => l.toUpperCase())}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() => handleCheckEnricher("skill")}
						className="font-semibold"
					>
						Advanced Options...
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" title="Ability Check">
						Ability Check <ChevronDown className="size-4 ml-1" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="max-h-[300px] overflow-y-auto min-w-[180px]"
					align="start"
				>
					{ABILITIES.map((ability) => (
						<DropdownMenuItem
							key={ability}
							onSelect={() => {
								insertRollCommand(createAbilityCheck(ability));
							}}
						>
							{ability.charAt(0).toUpperCase() + ability.slice(1)}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() => handleCheckEnricher("check")}
						className="font-semibold"
					>
						Advanced Options...
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" title="Saving Throw">
						Saving Throw <ChevronDown className="size-4 ml-1" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="max-h-[300px] overflow-y-auto min-w-[180px]"
					align="start"
				>
					{ABILITIES.map((ability) => (
						<DropdownMenuItem
							key={ability}
							onSelect={() => {
								insertRollCommand(createSavingThrow(ability));
							}}
						>
							{ability.charAt(0).toUpperCase() + ability.slice(1)}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={handleSaveRoll}
						className="font-semibold"
					>
						Advanced Options...
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" title="Attack Roll">
						Attack Roll <ChevronDown className="size-4 ml-1" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="max-h-[300px] overflow-y-auto min-w-[180px]"
					align="start"
				>
					<DropdownMenuItem
						onSelect={() => {
							insertRollCommand(createAttackRoll({ attackMode: "melee" }));
						}}
					>
						Melee
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							insertRollCommand(createAttackRoll({ attackMode: "ranged" }));
						}}
					>
						Ranged
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							insertRollCommand(createAttackRoll({ attackMode: "thrown" }));
						}}
					>
						Thrown
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={handleAttackRoll}
						className="font-semibold"
					>
						Advanced Options...
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Button
				variant="ghost"
				size="sm"
				onClick={handleDamageRoll}
				title="Damage Roll"
			>
				Damage
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleHealRoll}
				title="Heal Roll"
			>
				Heal
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleBasicRoll}
				title="Basic Roll"
			>
				Roll
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleItemReference}
				title="Item Reference"
			>
				Item
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" title="Reference">
						Reference <ChevronDown className="size-4 ml-1" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="max-h-[400px] overflow-y-auto min-w-[200px]"
					align="start"
				>
					<DropdownMenuItem
						onSelect={handleReferenceEnricher}
						className="font-semibold"
					>
						Advanced Options...
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
						Conditions
					</div>
					{CONDITION_REFERENCES.map((condition) => (
						<DropdownMenuItem
							key={condition}
							onSelect={() => {
								insertRollCommand(
									createReferenceEnricher({
										category: "condition",
										rule: condition,
									}),
								);
							}}
						>
							{condition
								.replace(/([A-Z])/g, " $1")
								.replace(/^./, (str) => str.toUpperCase())
								.trim()}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
						Abilities
					</div>
					{ABILITY_REFERENCES.map((ability) => (
						<DropdownMenuItem
							key={ability}
							onSelect={() => {
								insertRollCommand(
									createReferenceEnricher({
										category: "ability",
										rule: ability,
									}),
								);
							}}
						>
							{ability.charAt(0).toUpperCase() + ability.slice(1)}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
						Skills
					</div>
					{SKILL_REFERENCES.slice(0, 10).map((skill) => (
						<DropdownMenuItem
							key={skill}
							onSelect={() => {
								insertRollCommand(
									createReferenceEnricher({
										category: "skill",
										rule: skill,
									}),
								);
							}}
						>
							{skill
								.replace(/([A-Z])/g, " $1")
								.replace(/^./, (str) => str.toUpperCase())
								.trim()}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
						Damage Types
					</div>
					{DAMAGE_TYPE_REFERENCES.slice(0, 8).map((damageType) => (
						<DropdownMenuItem
							key={damageType}
							onSelect={() => {
								insertRollCommand(
									createReferenceEnricher({
										category: "damageType",
										rule: damageType,
									}),
								);
							}}
						>
							{damageType.charAt(0).toUpperCase() + damageType.slice(1)}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Check Enricher Dialog */}
			<Dialog
				open={showCheckDialog}
				onOpenChange={(open) => !open && handleCheckDialogCancel()}
			>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Insert"} Check Enricher ({checkDialogType})
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>
								Ability (optional):
								<Select
									value={checkOptions.ability || "none"}
									onValueChange={(value) => {
										setCheckOptions({
											...checkOptions,
											ability: value === "none" ? undefined : value,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="None" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										{ABILITIES.map((ability) => (
											<SelectItem key={ability} value={ability}>
												{ability.charAt(0).toUpperCase() + ability.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Skill(s) (optional, separate multiple with commas):
								<Input
									type="text"
									placeholder="acrobatics, athletics"
									value={
										Array.isArray(checkOptions.skill)
											? checkOptions.skill.join(", ")
											: checkOptions.skill || ""
									}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { skill, ...rest } = checkOptions;
											setCheckOptions(rest);
										} else {
											const skills = value
												.split(",")
												.map((s) => s.trim())
												.filter((s) => s);
											setCheckOptions({
												...checkOptions,
												skill: skills.length > 1 ? skills : skills[0],
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Tool(s) (optional, separate multiple with commas):
								<Input
									type="text"
									placeholder="thieves-tools"
									value={
										Array.isArray(checkOptions.tool)
											? checkOptions.tool.join(", ")
											: checkOptions.tool || ""
									}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { tool, ...rest } = checkOptions;
											setCheckOptions(rest);
										} else {
											const tools = value
												.split(",")
												.map((t) => t.trim())
												.filter((t) => t);
											setCheckOptions({
												...checkOptions,
												tool: tools.length > 1 ? tools : tools[0],
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Vehicle (optional):
								<Input
									type="text"
									placeholder="water"
									value={checkOptions.vehicle || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setCheckOptions({
											...checkOptions,
											vehicle: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								DC (optional, number or formula like "@abilities.con.dc"):
								<Input
									type="text"
									placeholder="15 or @abilities.con.dc"
									value={checkOptions.dc?.toString() || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { dc, ...rest } = checkOptions;
											setCheckOptions(rest);
										} else {
											const numValue = parseInt(value);
											setCheckOptions({
												...checkOptions,
												dc: Number.isNaN(numValue) ? value : numValue,
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Format (optional):
								<Select
									value={checkOptions.format || "default"}
									onValueChange={(value) => {
										setCheckOptions({
											...checkOptions,
											format: (value === "default" ? undefined : value) as
												| "short"
												| "long"
												| undefined,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Default" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default</SelectItem>
										<SelectItem value="short">Short</SelectItem>
										<SelectItem value="long">Long</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id={passiveCheckId}
								checked={checkOptions.passive || false}
								onChange={(e) => {
									setCheckOptions({
										...checkOptions,
										passive: e.target.checked || undefined,
									});
								}}
								className="h-4 w-4 rounded border-gray-300"
							/>
							<Label htmlFor={passiveCheckId} className="cursor-pointer">
								Passive check
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Activity ID (optional):
								<Input
									type="text"
									placeholder="RLQlsLo5InKHZadn"
									value={checkOptions.activity || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setCheckOptions({
											...checkOptions,
											activity: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Rules Version (optional, only affects skill+tool combinations):
								<Select
									value={checkOptions.rules || "default"}
									onValueChange={(value) => {
										setCheckOptions({
											...checkOptions,
											rules: (value === "default" ? undefined : value) as
												| "2014"
												| "2024"
												| undefined,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Default" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default</SelectItem>
										<SelectItem value="2014">2014 (Legacy)</SelectItem>
										<SelectItem value="2024">2024</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="mt-2 p-3 bg-muted rounded-md border border-border">
							<strong className="block mb-2 text-sm text-muted-foreground">
								Preview:
							</strong>
							<code className="block font-mono text-xs text-foreground break-all">
								{createCheckEnricher(checkOptions, checkDialogType)}
							</code>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleCheckDialogCancel}>
							Cancel
						</Button>
						<Button onClick={handleCheckDialogSubmit}>
							{isEditing ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Attack Enricher Dialog */}
			<Dialog
				open={showAttackDialog}
				onOpenChange={(open) => !open && handleAttackDialogCancel()}
			>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Insert"} Attack Enricher
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>
								Formula (e.g., "+5", "5", or leave empty):
								<Input
									type="text"
									placeholder="+5"
									value={attackOptions.formula?.toString() || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { formula, ...rest } = attackOptions;
											setAttackOptions(rest);
										} else {
											const numValue = parseInt(value.replace(/^\+/, ""));
											setAttackOptions({
												...attackOptions,
												formula: Number.isNaN(numValue) ? value : numValue,
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Activity ID (optional):
								<Input
									type="text"
									placeholder="jdRTb04FngE1B8cF"
									value={attackOptions.activity || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setAttackOptions({
											...attackOptions,
											activity: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Attack Mode (optional):
								<Select
									value={attackOptions.attackMode || "none"}
									onValueChange={(value) => {
										setAttackOptions({
											...attackOptions,
											attackMode: value === "none" ? undefined : value,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="None" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										<SelectItem value="melee">Melee</SelectItem>
										<SelectItem value="ranged">Ranged</SelectItem>
										<SelectItem value="thrown">Thrown</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Format (optional):
								<Select
									value={attackOptions.format || "default"}
									onValueChange={(value) => {
										setAttackOptions({
											...attackOptions,
											format: (value === "default" ? undefined : value) as
												| "short"
												| "long"
												| "extended"
												| undefined,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Default" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default</SelectItem>
										<SelectItem value="short">Short</SelectItem>
										<SelectItem value="long">Long</SelectItem>
										<SelectItem value="extended">Extended</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Rules Version (optional, only affects extended format):
								<Select
									value={attackOptions.rules || "default"}
									onValueChange={(value) => {
										setAttackOptions({
											...attackOptions,
											rules: (value === "default" ? undefined : value) as
												| "2014"
												| "2024"
												| undefined,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Default" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default</SelectItem>
										<SelectItem value="2014">2014 (Legacy)</SelectItem>
										<SelectItem value="2024">2024</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="mt-2 p-3 bg-muted rounded-md border border-border">
							<strong className="block mb-2 text-sm text-muted-foreground">
								Preview:
							</strong>
							<code className="block font-mono text-xs text-foreground break-all">
								{createAttackRoll(attackOptions)}
							</code>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleAttackDialogCancel}>
							Cancel
						</Button>
						<Button onClick={handleAttackDialogSubmit}>
							{isEditing ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Damage Enricher Dialog */}
			<Dialog
				open={showDamageDialog}
				onOpenChange={(open) => !open && handleDamageDialogCancel()}
			>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Insert"} Damage Enricher
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>
								Formula (e.g., "2d6", "1d6 + @abilities.dex.mod", or leave empty
								for activity lookup):
								<Input
									type="text"
									placeholder="2d6"
									value={damageOptions.formula || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setDamageOptions({
											...damageOptions,
											formula: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Damage Type(s) (optional, separate multiple with commas or
								spaces):
								<Input
									type="text"
									placeholder="fire, cold"
									value={
										Array.isArray(damageOptions.type)
											? damageOptions.type.join(", ")
											: damageOptions.type || ""
									}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { type, ...rest } = damageOptions;
											setDamageOptions(rest);
										} else {
											// Try to split by comma first, then by space
											const types = value
												.split(/[,\s]+/)
												.map((t) => t.trim())
												.filter((t) => t);
											setDamageOptions({
												...damageOptions,
												type: types.length > 1 ? types : types[0],
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Average (optional, leave empty for auto-calc, or enter custom
								value):
								<Input
									type="text"
									placeholder="true or 5"
									value={
										damageOptions.average === true
											? "true"
											: damageOptions.average?.toString() || ""
									}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { average, ...rest } = damageOptions;
											setDamageOptions(rest);
										} else if (value.toLowerCase() === "true") {
											setDamageOptions({
												...damageOptions,
												average: true,
											});
										} else {
											const numValue = parseInt(value);
											setDamageOptions({
												...damageOptions,
												average: Number.isNaN(numValue) ? value : numValue,
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Activity ID (optional):
								<Input
									type="text"
									placeholder="RLQlsLo5InKHZadn"
									value={damageOptions.activity || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setDamageOptions({
											...damageOptions,
											activity: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Format (optional):
								<Select
									value={damageOptions.format || "default"}
									onValueChange={(value) => {
										setDamageOptions({
											...damageOptions,
											format: (value === "default" ? undefined : value) as
												| "short"
												| "long"
												| "extended"
												| undefined,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Default (Short)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default (Short)</SelectItem>
										<SelectItem value="short">Short</SelectItem>
										<SelectItem value="long">Long</SelectItem>
										<SelectItem value="extended">Extended</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="mt-2 p-3 bg-muted rounded-md border border-border">
							<strong className="block mb-2 text-sm text-muted-foreground">
								Preview:
							</strong>
							<code className="block font-mono text-xs text-foreground break-all">
								{createDamageRoll(damageOptions)}
							</code>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleDamageDialogCancel}>
							Cancel
						</Button>
						<Button onClick={handleDamageDialogSubmit}>
							{isEditing ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Heal Enricher Dialog */}
			<Dialog
				open={showHealDialog}
				onOpenChange={(open) => !open && handleHealDialogCancel()}
			>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Insert"} Heal Enricher
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>
								Formula (e.g., "2d4 + 2", "10", or leave empty for activity
								lookup):
								<Input
									type="text"
									placeholder="2d4 + 2"
									value={healOptions.formula || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setHealOptions({
											...healOptions,
											formula: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Heal Type (optional):
								<Select
									value={healOptions.type || "none"}
									onValueChange={(value) => {
										setHealOptions({
											...healOptions,
											type:
												value === "none"
													? undefined
													: (value as "healing" | "temp"),
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="None (defaults to healing)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											None (defaults to healing)
										</SelectItem>
										<SelectItem value="healing">Healing</SelectItem>
										<SelectItem value="temp">Temporary HP</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Average (optional, leave empty for auto-calc, or enter custom
								value):
								<Input
									type="text"
									placeholder="true or 5"
									value={
										healOptions.average === true
											? "true"
											: healOptions.average?.toString() || ""
									}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { average, ...rest } = healOptions;
											setHealOptions(rest);
										} else if (value.toLowerCase() === "true") {
											setHealOptions({
												...healOptions,
												average: true,
											});
										} else {
											const numValue = parseInt(value);
											setHealOptions({
												...healOptions,
												average: Number.isNaN(numValue) ? value : numValue,
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Activity ID (optional):
								<Input
									type="text"
									placeholder="jdRTb04FngE1B8cF"
									value={healOptions.activity || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setHealOptions({
											...healOptions,
											activity: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Format (optional):
								<Select
									value={healOptions.format || "default"}
									onValueChange={(value) => {
										setHealOptions({
											...healOptions,
											format: (value === "default" ? undefined : value) as
												| "short"
												| "long"
												| "extended"
												| undefined,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Default (Short)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default (Short)</SelectItem>
										<SelectItem value="short">Short</SelectItem>
										<SelectItem value="long">Long</SelectItem>
										<SelectItem value="extended">Extended</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="mt-2 p-3 bg-muted rounded-md border border-border">
							<strong className="block mb-2 text-sm text-muted-foreground">
								Preview:
							</strong>
							<code className="block font-mono text-xs text-foreground break-all">
								{createHealRoll(healOptions)}
							</code>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleHealDialogCancel}>
							Cancel
						</Button>
						<Button onClick={handleHealDialogSubmit}>
							{isEditing ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Item Enricher Dialog */}
			<Dialog
				open={showItemDialog}
				onOpenChange={(open) => !open && handleItemDialogCancel()}
			>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Insert"} Item Enricher
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>
								Reference Method:
								<Select
									value={itemMethod}
									onValueChange={(value) => {
										setItemMethod(value as "name" | "uuid" | "relativeId");
										// Clear options when switching methods
										setItemOptions({});
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="name">By Item Name</SelectItem>
										<SelectItem value="uuid">By UUID</SelectItem>
										<SelectItem value="relativeId">By Relative ID</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						{itemMethod === "name" && (
							<div className="flex flex-col gap-2">
								<Label>
									Item Name:
									<Input
										type="text"
										placeholder="Bite"
										value={itemOptions.itemName || ""}
										onChange={(e) => {
											const value = e.target.value.trim();
											setItemOptions({
												...itemOptions,
												itemName: value || undefined,
												uuid: undefined,
												relativeId: undefined,
											});
										}}
									/>
								</Label>
								<p className="text-xs text-muted-foreground">
									Functions similarly to a system macro. When clicked, it will
									check for a selected token or your assigned actor.
								</p>
							</div>
						)}

						{itemMethod === "uuid" && (
							<div className="flex flex-col gap-2">
								<Label>
									UUID (Actor.Item format):
									<Input
										type="text"
										placeholder="Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU"
										value={itemOptions.uuid || ""}
										onChange={(e) => {
											const value = e.target.value.trim();
											setItemOptions({
												...itemOptions,
												uuid: value || undefined,
												itemName: undefined,
												relativeId: undefined,
											});
										}}
									/>
								</Label>
								<p className="text-xs text-muted-foreground">
									A UUID contains references to an Actor and an Item it owns.
								</p>
							</div>
						)}

						{itemMethod === "relativeId" && (
							<div className="flex flex-col gap-2">
								<Label>
									Relative ID (item ID or relative UUID starting with .):
									<Input
										type="text"
										placeholder="amUUCouL69OK1GZU or .amUUCouL69OK1GZU"
										value={itemOptions.relativeId || ""}
										onChange={(e) => {
											const value = e.target.value.trim();
											setItemOptions({
												...itemOptions,
												relativeId: value || undefined,
												itemName: undefined,
												uuid: undefined,
											});
										}}
									/>
								</Label>
								<p className="text-xs text-muted-foreground">
									Uses the location (Actor Sheet, Item Sheet, or Chat Card) to
									determine the Token or Actor that owns the item.
								</p>
							</div>
						)}

						<div className="flex flex-col gap-2">
							<Label>
								Activity Name (optional):
								<Input
									type="text"
									placeholder="Poison"
									value={itemOptions.activity || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setItemOptions({
											...itemOptions,
											activity: value || undefined,
										});
									}}
								/>
							</Label>
							<p className="text-xs text-muted-foreground">
								To trigger a specific activity on the item. Will be
								automatically quoted if it contains spaces.
							</p>
						</div>

						<div className="mt-2 p-3 bg-muted rounded-md border border-border">
							<strong className="block mb-2 text-sm text-muted-foreground">
								Preview:
							</strong>
							<code className="block font-mono text-xs text-foreground break-all">
								{createItemEnricher(itemOptions)}
							</code>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleItemDialogCancel}>
							Cancel
						</Button>
						<Button onClick={handleItemDialogSubmit}>
							{isEditing ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Save Enricher Dialog */}
			<Dialog
				open={showSaveDialog}
				onOpenChange={(open) => !open && handleSaveDialogCancel()}
			>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Insert"}{" "}
							{isConcentration ? "Concentration" : "Save"} Enricher
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>
								Ability(ies) (optional, separate multiple with commas):
								<Input
									type="text"
									placeholder="dexterity or strength, dexterity"
									value={
										Array.isArray(saveOptions.ability)
											? saveOptions.ability.join(", ")
											: saveOptions.ability?.toString() || ""
									}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { ability, ...rest } = saveOptions;
											setSaveOptions(rest);
										} else {
											const abilities = value
												.split(",")
												.map((a) => a.trim())
												.filter((a) => a);
											setSaveOptions({
												...saveOptions,
												ability: abilities.length > 1 ? abilities : abilities[0],
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								DC (optional, number or formula like "@abilities.con.dc"):
								<Input
									type="text"
									placeholder="15 or @abilities.con.dc"
									value={saveOptions.dc?.toString() || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										if (value === "") {
											// eslint-disable-next-line @typescript-eslint/no-unused-vars
											const { dc, ...rest } = saveOptions;
											setSaveOptions(rest);
										} else {
											const numValue = parseInt(value);
											setSaveOptions({
												...saveOptions,
												dc: Number.isNaN(numValue) ? value : numValue,
											});
										}
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Format (optional):
								<Select
									value={saveOptions.format || "default"}
									onValueChange={(value) => {
										setSaveOptions({
											...saveOptions,
											format: (value === "default" ? undefined : value) as
												| "short"
												| "long"
												| undefined,
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Default" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default</SelectItem>
										<SelectItem value="short">Short</SelectItem>
										<SelectItem value="long">Long</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Activity ID (optional):
								<Input
									type="text"
									placeholder="RLQlsLo5InKHZadn"
									value={saveOptions.activity || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setSaveOptions({
											...saveOptions,
											activity: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="mt-2 p-3 bg-muted rounded-md border border-border">
							<strong className="block mb-2 text-sm text-muted-foreground">
								Preview:
							</strong>
							<code className="block font-mono text-xs text-foreground break-all">
								{createSaveEnricher(saveOptions, isConcentration)}
							</code>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleSaveDialogCancel}>
							Cancel
						</Button>
						<Button onClick={handleSaveDialogSubmit}>
							{isEditing ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reference Enricher Dialog */}
			<Dialog
				open={showReferenceDialog}
				onOpenChange={(open) => !open && handleReferenceDialogCancel()}
			>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Insert"} Reference Enricher
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>
								Category (optional):
								<Select
									value={referenceOptions.category || "none"}
									onValueChange={(value) => {
										setReferenceOptions({
											...referenceOptions,
											category:
												value === "none"
													? undefined
													: (value as ReferenceEnricherOptions["category"]),
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Auto-detect" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Auto-detect</SelectItem>
										<SelectItem value="ability">Ability</SelectItem>
										<SelectItem value="skill">Skill</SelectItem>
										<SelectItem value="condition">Condition</SelectItem>
										<SelectItem value="damageType">Damage Type</SelectItem>
										<SelectItem value="creatureType">Creature Type</SelectItem>
										<SelectItem value="areaOfEffect">Area of Effect</SelectItem>
										<SelectItem value="spellComponent">
											Spell Component
										</SelectItem>
										<SelectItem value="spellSchool">Spell School</SelectItem>
										<SelectItem value="otherRuleset">Other Ruleset</SelectItem>
										<SelectItem value="rule">Generic Rule</SelectItem>
									</SelectContent>
								</Select>
							</Label>
							<p className="text-xs text-muted-foreground">
								If not specified, the category will be inferred from the rule
								name.
							</p>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Rule Name:
								<Input
									type="text"
									placeholder="prone, strength, Difficult Terrain..."
									value={referenceOptions.rule || ""}
									onChange={(e) => {
										setReferenceOptions({
											...referenceOptions,
											rule: e.target.value.trim() || undefined,
										});
									}}
								/>
							</Label>
							<p className="text-xs text-muted-foreground">
								The name of the rule being referenced. Can be a condition,
								ability, skill, damage type, or any other rule name.
							</p>
						</div>

						{referenceOptions.category === "condition" ||
						(!referenceOptions.category &&
							referenceOptions.rule &&
							CONDITION_REFERENCES.some(
								(ref) =>
									ref.toLowerCase() === referenceOptions.rule?.toLowerCase(),
							)) ? (
							<div className="flex flex-col gap-2">
								<Label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={referenceOptions.apply !== false}
										onChange={(e) => {
											setReferenceOptions({
												...referenceOptions,
												apply: e.target.checked ? undefined : false,
											});
										}}
									/>
									<span>Show apply button (default: true)</span>
								</Label>
								<p className="text-xs text-muted-foreground">
									When unchecked, the apply condition button will not appear for
									condition references.
								</p>
							</div>
						) : null}

						<div className="mt-2 p-3 bg-muted rounded-md border border-border">
							<strong className="block mb-2 text-sm text-muted-foreground">
								Preview:
							</strong>
							<code className="block font-mono text-xs text-foreground break-all">
								{createReferenceEnricher(referenceOptions)}
							</code>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleReferenceDialogCancel}>
							Cancel
						</Button>
						<Button onClick={handleReferenceDialogSubmit}>
							{isEditing ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Basic Roll Dialog */}
			<Dialog
				open={showBasicRollDialog}
				onOpenChange={(open) => !open && handleBasicRollDialogCancel()}
			>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Insert"} Basic Roll
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>
								Formula (e.g., "5d20", "1d10 + 1d4", "1d20 / 2 + 10"):
								<Input
									type="text"
									placeholder="5d20"
									value={basicRollOptions.formula || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setBasicRollOptions({
											...basicRollOptions,
											formula: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Roll Mode (optional):
								<Select
									value={basicRollOptions.mode || "public"}
									onValueChange={(value) => {
										setBasicRollOptions({
											...basicRollOptions,
											mode:
												value === "public"
													? undefined
													: (value as BasicRollEnricherOptions["mode"]),
										});
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="public">Public</SelectItem>
										<SelectItem value="gm">GM Only</SelectItem>
										<SelectItem value="blind">Blind</SelectItem>
										<SelectItem value="self">Self Only</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Description (optional, appears after #):
								<Input
									type="text"
									placeholder="Roll for damage"
									value={basicRollOptions.description || ""}
									onChange={(e) => {
										const value = e.target.value.trim();
										setBasicRollOptions({
											...basicRollOptions,
											description: value || undefined,
										});
									}}
								/>
							</Label>
						</div>

						<div className="flex flex-col gap-2">
							<Label>
								Inline Roll Type (optional):
								<Select
									value={
										basicRollOptions.inline === false || !basicRollOptions.inline
											? "false"
											: basicRollOptions.inline
									}
									onValueChange={(value) => {
										setBasicRollOptions({
											...basicRollOptions,
											inline:
												value === "false"
													? false
													: (value as "immediate" | "deferred"),
										});
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="false">Regular Roll</SelectItem>
										<SelectItem value="immediate">Immediate Inline</SelectItem>
										<SelectItem value="deferred">Deferred Inline</SelectItem>
									</SelectContent>
								</Select>
							</Label>
							<p className="text-xs text-muted-foreground">
								Immediate inline rolls execute immediately ([[formula]]), while
								deferred inline rolls execute when clicked ([[/roll formula]]).
							</p>
						</div>

						{basicRollOptions.inline && (
							<div className="flex flex-col gap-2">
								<Label>
									Label (optional, appears as {`{label}`} after the roll):
									<Input
										type="text"
										placeholder="Roll for damage"
										value={basicRollOptions.label || ""}
										onChange={(e) => {
											const value = e.target.value.trim();
											setBasicRollOptions({
												...basicRollOptions,
												label: value || undefined,
											});
										}}
									/>
								</Label>
							</div>
						)}

						<div className="mt-2 p-3 bg-muted rounded-md border border-border">
							<strong className="block mb-2 text-sm text-muted-foreground">
								Preview:
							</strong>
							<code className="block font-mono text-xs text-foreground break-all">
								{createBasicRoll(basicRollOptions)}
							</code>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleBasicRollDialogCancel}>
							Cancel
						</Button>
						<Button onClick={handleBasicRollDialogSubmit}>
							{isEditing ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
