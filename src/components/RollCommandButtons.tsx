import type { Editor } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { parseRollCommand } from "../utils/rollCommandParser";
import {
	ABILITIES,
	type AttackEnricherOptions,
	type CheckEnricherOptions,
	type DamageEnricherOptions,
	createAbilityCheck,
	createAttackRoll,
	createCheckEnricher,
	createDamageRoll,
	createItemReference,
	createSavingThrow,
	createSkillCheck,
	createSpellReference,
	SKILLS,
} from "../utils/rollCommands";
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
	const [showCheckDialog, setShowCheckDialog] = useState(false);
	const [showDamageDialog, setShowDamageDialog] = useState(false);
	const [checkDialogType, setCheckDialogType] = useState<
		"check" | "skill" | "tool"
	>("check");
	const [attackOptions, setAttackOptions] = useState<AttackEnricherOptions>({});
	const [checkOptions, setCheckOptions] = useState<CheckEnricherOptions>({});
	const [damageOptions, setDamageOptions] = useState<DamageEnricherOptions>({});
	const [editingPosition, setEditingPosition] = useState<number | null>(null);
	const [isEditing, setIsEditing] = useState(false);
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
			} else {
				// Open check dialog with parsed options
				setCheckDialogType(parsed.type);
				setCheckOptions(parsed.options as CheckEnricherOptions);
				setShowCheckDialog(true);
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

	const handleSpellReference = () => {
		const spellName = window.prompt("Enter spell name:");
		if (spellName) {
			insertRollCommand(createSpellReference(spellName));
		}
	};

	const handleItemReference = () => {
		const itemName = window.prompt("Enter item name:");
		if (itemName) {
			insertRollCommand(createItemReference(itemName));
		}
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

	const handleDefaultAttack = () => {
		// Insert default attack enricher with +5 to hit
		// This is a common default for simple attack rolls
		insertRollCommand(createAttackRoll({ formula: 5 }));
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
					{ABILITIES.map((ability) => (
						<DropdownMenuItem
							key={ability}
							onSelect={() => handleDefaultAttack()}
						>
							{ability.charAt(0).toUpperCase() + ability.slice(1)} Attack
						</DropdownMenuItem>
					))}
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
				onClick={handleSpellReference}
				title="Spell Reference"
			>
				Spell
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleItemReference}
				title="Item Reference"
			>
				Item
			</Button>

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
								Formula (e.g., "2d6", "1d6 + @abilities.dex.mod", or leave empty for activity lookup):
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
								Damage Type(s) (optional, separate multiple with commas or spaces):
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
								Average (optional, leave empty for auto-calc, or enter custom value):
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
		</div>
	);
}
