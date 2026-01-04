import {
	isAbility,
	normalizeAbility,
} from "@/features/dnd/abilities/abilities";
import type { AttackEnricherOptions } from "@/features/dnd/rolls/attack/attackRoll";
import type { BasicRollEnricherOptions } from "@/features/dnd/rolls/basic/basicRoll";
import type { CheckEnricherOptions } from "@/features/dnd/rolls/check/checkRoll";
import type { DamageEnricherOptions } from "@/features/dnd/rolls/damage/damageRoll";
import type { HealEnricherOptions } from "@/features/dnd/rolls/heal/healRoll";
import type { ItemEnricherOptions } from "@/features/dnd/rolls/item/itemEnricher";
import type { ReferenceEnricherOptions } from "@/features/dnd/rolls/reference/referenceEnricher";
import type { SaveEnricherOptions } from "@/features/dnd/rolls/save/saveRoll";
import { isSkill, normalizeSkill } from "@/features/dnd/skills/skills";

/**
 * Parses a roll command string and extracts structured options
 * Supports formats like:
 * - [[/check acrobatics dc=15]]
 * - [[/check dex 15]]
 * - [[/check ability=dexterity dc=20]]
 * - [[/skill perception]]
 * - [[/save dex]] or [[/save ability=dexterity]]
 * - [[/save dexterity 20]] or [[/save ability=dexterity dc=20]]
 * - [[/concentration dc=15]]
 * - [[/attack +5]]
 * - [[/attack formula=5 attackMode=thrown]]
 * - [[/damage 2d6 fire]]
 * - [[/damage 2d6 fire average]]
 * - [[/item Bite]]
 * - [[/item Bite activity=Poison]]
 * - [[/item Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU]]
 * - [[/roll 5d20]] or [[/roll 1d10 + 1d4 + 4]]
 * - [[/roll 5d20 # This is my roll!]]
 * - [[/roll 2d6[slashing damage]+1d8[fire damage]]]
 * - [[/gmroll 1d20]] or [[/blindroll 1d20]] or [[/selfroll 1d20]]
 * - [[5d20]] (immediate inline roll)
 * - [[/roll 5d20]] (deferred inline roll)
 * - &Reference[prone]
 * - &Reference[condition=prone]
 * - &Reference[blinded apply=false]
 * - &Reference[rule="Difficult Terrain"]
 */
export function parseRollCommand(command: string): {
	type:
		| "check"
		| "skill"
		| "tool"
		| "attack"
		| "damage"
		| "heal"
		| "item"
		| "save"
		| "concentration"
		| "roll"
		| "reference";
	options:
		| CheckEnricherOptions
		| AttackEnricherOptions
		| DamageEnricherOptions
		| HealEnricherOptions
		| ItemEnricherOptions
		| SaveEnricherOptions
		| BasicRollEnricherOptions
		| ReferenceEnricherOptions;
	originalCommand: string;
} | null {
	// Match reference enricher pattern: &Reference[...]
	const referenceMatch = command.match(/&Reference\[([^\]]*)\]/);
	if (referenceMatch) {
		return {
			type: "reference",
			options: parseReferenceCommand(referenceMatch[1]),
			originalCommand: command,
		};
	}

	// Match immediate inline roll pattern: [[formula]] or [[formula]{label}]
	// Must not start with / to avoid matching deferred inline rolls
	// Should contain dice notation (d followed by number) to avoid matching other commands
	const immediateInlineMatch = command.match(
		/^\[\[([^/][^\]]*)\]\](?:\{([^}]+)\})?$/,
	);
	if (immediateInlineMatch) {
		const formula = immediateInlineMatch[1];
		// Only treat as immediate inline roll if it looks like a dice formula
		// (contains 'd' followed by digits, or is a simple number)
		if (/d\d+/.test(formula) || /^\d+$/.test(formula.trim())) {
			const label = immediateInlineMatch[2];
			return {
				type: "roll",
				options: parseBasicRollCommand(formula, {
					inline: "immediate",
					label: label || undefined,
				}),
				originalCommand: command,
			};
		}
	}

	// Match roll command pattern: [[/type ...]] or [[/rollmode ...]]
	// Roll modes: roll, publicroll/pr, gmroll/gmr, blindroll/broll/br, selfroll/sr
	const match = command.match(
		/\[\[\/(check|skill|tool|attack|damage|heal|item|save|concentration|roll|publicroll|pr|gmroll|gmr|blindroll|broll|br|selfroll|sr)([^\]]*)\]\]/,
	);
	if (!match) {
		return null;
	}

	const type = match[1] as
		| "check"
		| "skill"
		| "tool"
		| "attack"
		| "damage"
		| "heal"
		| "item"
		| "save"
		| "concentration"
		| "roll"
		| "publicroll"
		| "pr"
		| "gmroll"
		| "gmr"
		| "blindroll"
		| "broll"
		| "br"
		| "selfroll"
		| "sr";
	const body = match[2].trim();

	// Handle roll commands (including roll modes)
	if (
		type === "roll" ||
		type === "publicroll" ||
		type === "pr" ||
		type === "gmroll" ||
		type === "gmr" ||
		type === "blindroll" ||
		type === "broll" ||
		type === "br" ||
		type === "selfroll" ||
		type === "sr"
	) {
		// Determine roll mode from command type
		let mode: "public" | "gm" | "blind" | "self" | undefined;
		if (type === "gmroll" || type === "gmr") {
			mode = "gm";
		} else if (type === "blindroll" || type === "broll" || type === "br") {
			mode = "blind";
		} else if (type === "selfroll" || type === "sr") {
			mode = "self";
		} else if (type === "publicroll" || type === "pr") {
			mode = "public";
		}
		// type === "roll" means default mode (public), so mode stays undefined

		// Check for deferred inline roll with optional label: [[/roll formula]] or [[/roll formula]{label}]
		const deferredInlineMatch = command.match(
			/^\[\[\/(roll|publicroll|pr|gmroll|gmr|blindroll|broll|br|selfroll|sr)([^\]]*)\]\](?:\{([^}]+)\})?$/,
		);
		if (deferredInlineMatch) {
			const formulaBody = deferredInlineMatch[2].trim();
			const label = deferredInlineMatch[3];
			// If there's a label, it's definitely a deferred inline roll
			// If there's no label but there's a formula, it could be either
			// For now, we'll treat all /roll commands as deferred inline rolls
			// (they can be regular rolls too, but the distinction is semantic)
			return {
				type: "roll",
				options: parseBasicRollCommand(formulaBody, {
					mode,
					inline: label ? "deferred" : undefined,
					label: label || undefined,
				}),
				originalCommand: command,
			};
		}

		return {
			type: "roll",
			options: parseBasicRollCommand(body, { mode }),
			originalCommand: command,
		};
	} else if (type === "attack") {
		return {
			type: "attack",
			options: parseAttackCommand(body),
			originalCommand: command,
		};
	} else if (type === "damage") {
		return {
			type: "damage",
			options: parseDamageCommand(body),
			originalCommand: command,
		};
	} else if (type === "heal") {
		return {
			type: "heal",
			options: parseHealCommand(body),
			originalCommand: command,
		};
	} else if (type === "item") {
		return {
			type: "item",
			options: parseItemCommand(body),
			originalCommand: command,
		};
	} else if (type === "save" || type === "concentration") {
		return {
			type,
			options: parseSaveCommand(body),
			originalCommand: command,
		};
	} else {
		return {
			type,
			options: parseCheckCommand(body, type),
			originalCommand: command,
		};
	}
}

/**
 * Parses a reference enricher command body
 */
function parseReferenceCommand(body: string): ReferenceEnricherOptions {
	const options: ReferenceEnricherOptions = {};

	if (!body) {
		return options;
	}

	// Check for explicit key=value format (category=rule, not just apply=)
	// Explicit format means we have a category=rule pattern
	const hasExplicitFormat =
		body.includes("=") &&
		/^(ability|skill|condition|creatureType|damageType|areaOfEffect|spellComponent|spellSchool|otherRuleset|rule)=/.test(
			body.trim(),
		);

	if (hasExplicitFormat) {
		// Parse explicit format: condition=prone apply=false
		// Handle quoted values that may contain spaces
		const parts: string[] = [];
		let currentPart = "";
		let inQuotes = false;
		let quoteChar = "";

		for (let i = 0; i < body.length; i++) {
			const char = body[i];
			if ((char === '"' || char === "'") && (i === 0 || body[i - 1] !== "\\")) {
				if (!inQuotes) {
					inQuotes = true;
					quoteChar = char;
					currentPart += char;
				} else if (char === quoteChar) {
					inQuotes = false;
					currentPart += char;
				} else {
					currentPart += char;
				}
			} else if (char === " " && !inQuotes) {
				if (currentPart.trim()) {
					parts.push(currentPart.trim());
					currentPart = "";
				}
			} else {
				currentPart += char;
			}
		}

		if (currentPart.trim()) {
			parts.push(currentPart.trim());
		}

		for (const part of parts) {
			if (part.startsWith("apply=")) {
				// Handle apply option
				const value = part.substring(6); // Remove "apply="
				options.apply = value === "false" ? false : undefined;
				continue;
			}

			// Handle category=rule format
			const [key, ...valueParts] = part.split("=");
			const value = valueParts.join("="); // Handle values that might contain '='

			// Check if key is a valid category
			const validCategories = [
				"ability",
				"skill",
				"condition",
				"creatureType",
				"damageType",
				"areaOfEffect",
				"spellComponent",
				"spellSchool",
				"otherRuleset",
				"rule",
			];

			if (validCategories.includes(key)) {
				options.category = key as ReferenceEnricherOptions["category"];
				// Remove quotes if present
				let ruleValue = value;
				if (
					(ruleValue.startsWith('"') && ruleValue.endsWith('"')) ||
					(ruleValue.startsWith("'") && ruleValue.endsWith("'"))
				) {
					ruleValue = ruleValue.slice(1, -1);
				}
				options.rule = ruleValue || undefined;
			}
		}
	} else {
		// Parse inferred format: prone, blinded apply=false, etc.
		// Handle quoted values that may contain spaces
		const parts: string[] = [];
		let currentPart = "";
		let inQuotes = false;
		let quoteChar = "";

		for (let i = 0; i < body.length; i++) {
			const char = body[i];
			if ((char === '"' || char === "'") && (i === 0 || body[i - 1] !== "\\")) {
				if (!inQuotes) {
					inQuotes = true;
					quoteChar = char;
					currentPart += char;
				} else if (char === quoteChar) {
					inQuotes = false;
					currentPart += char;
					parts.push(currentPart);
					currentPart = "";
				} else {
					currentPart += char;
				}
			} else if (char === " " && !inQuotes) {
				if (currentPart.trim()) {
					parts.push(currentPart.trim());
					currentPart = "";
				}
			} else {
				currentPart += char;
			}
		}

		if (currentPart.trim()) {
			parts.push(currentPart.trim());
		}

		// First pass: collect apply option
		// Second pass: collect rule (first non-option part)
		let ruleFound = false;

		for (const part of parts) {
			if (part.startsWith("apply=")) {
				// Handle apply option
				const value = part.substring(6);
				options.apply = value === "false" ? false : undefined;
			} else if (!ruleFound) {
				// First non-option part is the rule name
				// Remove quotes if present
				let ruleValue = part;
				if (
					(ruleValue.startsWith('"') && ruleValue.endsWith('"')) ||
					(ruleValue.startsWith("'") && ruleValue.endsWith("'"))
				) {
					ruleValue = ruleValue.slice(1, -1);
				}
				options.rule = ruleValue;
				ruleFound = true;
			}
		}
	}

	return options;
}

/**
 * Parses a check/skill/tool command body
 */
function parseCheckCommand(
	body: string,
	commandType?: "check" | "skill" | "tool",
): CheckEnricherOptions {
	const options: CheckEnricherOptions = {};

	if (!body) {
		return options;
	}

	// Check for explicit key=value format
	const hasExplicitFormat = body.includes("=");

	if (hasExplicitFormat) {
		// Parse explicit format: ability=dexterity dc=15 skill=acrobatics
		const parts = body.split(/\s+/);
		for (const part of parts) {
			const [key, ...valueParts] = part.split("=");
			const value = valueParts.join("="); // Handle values that might contain '='

			switch (key) {
				case "ability":
					options.ability = normalizeAbility(value);
					break;
				case "skill":
					// Handle slash-separated skills: skill=acr/ath
					if (value.includes("/")) {
						options.skill = value.split("/").map(normalizeSkill);
					} else {
						options.skill = normalizeSkill(value);
					}
					break;
				case "tool":
					// Handle slash-separated tools: tool=thieves-tools/other
					if (value.includes("/")) {
						options.tool = value.split("/");
					} else {
						options.tool = value;
					}
					break;
				case "vehicle":
					options.vehicle = value;
					break;
				case "dc": {
					// Try to parse as number, otherwise keep as string (formula)
					const numValue = parseInt(value);
					options.dc = Number.isNaN(numValue) ? value : numValue;
					break;
				}
				case "format":
					if (value === "short" || value === "long") {
						options.format = value;
					}
					break;
				case "passive":
					options.passive = value === "true";
					break;
				case "activity":
					options.activity = value;
					break;
				case "rules":
					if (value === "2014" || value === "2024") {
						options.rules = value;
					}
					break;
			}
		}
	} else {
		// Parse shorthand format: dex 15, acrobatics, perception 20, etc.
		const parts = body.split(/\s+/).filter((p) => p.length > 0);

		if (parts.length === 0) {
			return options;
		}

		// Try to identify what each part is
		const identified: {
			ability?: string;
			skills: string[];
			dc?: string | number;
		} = { skills: [] };

		for (const part of parts) {
			const lower = part.toLowerCase();

			// Check if it's an ability
			if (isAbility(lower)) {
				identified.ability = normalizeAbility(lower);
				continue;
			}

			// Check if it's a skill
			if (isSkill(lower)) {
				identified.skills.push(normalizeSkill(lower));
				continue;
			}

			// Check if it's a number (DC)
			const numValue = parseInt(part);
			if (!Number.isNaN(numValue)) {
				identified.dc = numValue;
				continue;
			}

			// If we can't identify it, check if it should be a tool
			if (commandType === "tool") {
				options.tool = part;
			} else {
				// Otherwise assume it's a skill (for custom skills)
				identified.skills.push(part);
			}
		}

		// Map identified parts to options
		if (identified.ability) {
			options.ability = identified.ability;
		}

		if (identified.skills.length > 0) {
			options.skill =
				identified.skills.length === 1
					? identified.skills[0]
					: identified.skills;
		}

		if (identified.dc !== undefined) {
			options.dc = identified.dc;
		}
	}

	return options;
}

/**
 * Parses an attack command body
 */
function parseAttackCommand(body: string): AttackEnricherOptions {
	const options: AttackEnricherOptions = {};

	if (!body) {
		return options;
	}

	// Check for explicit key=value format
	const hasExplicitFormat = body.includes("=");

	if (hasExplicitFormat) {
		// Parse explicit format: formula=5 attackMode=thrown
		const parts = body.split(/\s+/);
		for (const part of parts) {
			const [key, ...valueParts] = part.split("=");
			const value = valueParts.join("=");

			switch (key) {
				case "formula": {
					// Try to parse as number, otherwise keep as string
					// Handle formulas with spaces by checking if it's a simple number
					const trimmedValue = value.trim();
					const numValue = parseInt(trimmedValue.replace(/^[+-]/, ""));
					// Only parse as number if it's a simple integer, otherwise keep as string
					if (!Number.isNaN(numValue) && /^[+-]?\d+$/.test(trimmedValue)) {
						options.formula = numValue;
					} else {
						options.formula = value;
					}
					break;
				}
				case "activity":
					options.activity = value;
					break;
				case "attackMode":
					options.attackMode = value;
					break;
				case "format":
					if (value === "short" || value === "long" || value === "extended") {
						options.format = value;
					}
					break;
				case "rules":
					if (value === "2014" || value === "2024") {
						options.rules = value;
					}
					break;
			}
		}
	} else {
		// Parse shorthand format: +5, 5 thrown, extended, etc.
		const parts = body.split(/\s+/).filter((p) => p.length > 0);

		if (parts.length === 0) {
			return options;
		}

		// Check if first part is a format keyword
		if (
			parts[0] === "short" ||
			parts[0] === "long" ||
			parts[0] === "extended"
		) {
			options.format = parts[0] as "short" | "long" | "extended";
			return options;
		}

		// Check if first part is a formula (number or +number)
		const firstPart = parts[0];
		const formulaMatch = firstPart.match(/^([+-]?)(\d+)$/);
		if (formulaMatch) {
			const numValue = parseInt(formulaMatch[2]);
			options.formula =
				formulaMatch[1] === "+" || formulaMatch[1] === ""
					? numValue
					: -numValue;

			// Check if there's an attack mode as second part
			if (parts.length > 1) {
				options.attackMode = parts[1];
			}
		} else {
			// Treat as formula string
			options.formula = firstPart;
			if (parts.length > 1) {
				options.attackMode = parts[1];
			}
		}
	}

	return options;
}

/**
 * Parses a damage command body
 */
function parseDamageCommand(body: string): DamageEnricherOptions {
	const options: DamageEnricherOptions = {};

	if (!body) {
		return options;
	}

	// Check for multiple rolls (separated by &)
	if (body.includes(" & ")) {
		// Split body into potential roll sections and shared options
		// Format: "1d6 bludgeoning & 1d4 fire average" or "1d6 bludgeoning & 1d4 fire"
		const allParts = body.split(/\s+/);
		const rollSections: string[] = [];
		const sharedOptions: string[] = [];
		let currentSection: string[] = [];

		// Group parts by ' & ' separator and identify where shared options start
		for (let i = 0; i < allParts.length; i++) {
			const part = allParts[i];

			// Check if this is a shared option keyword
			if (
				part === "average" ||
				part.startsWith("average=") ||
				part.startsWith("format=")
			) {
				sharedOptions.push(...allParts.slice(i));
				break;
			}

			if (part === "&") {
				if (currentSection.length > 0) {
					rollSections.push(currentSection.join(" "));
					currentSection = [];
				}
			} else {
				currentSection.push(part);
			}
		}

		// Add the last section (always add it, even if options were found)
		if (currentSection.length > 0) {
			rollSections.push(currentSection.join(" "));
		}

		// Parse each roll section
		const rolls: Array<{ formula: string; type?: string | string[] }> = [];
		for (const rollString of rollSections) {
			const rollParts = rollString.trim().split(/\s+/);
			if (rollParts.length > 0) {
				const roll: { formula: string; type?: string | string[] } = {
					formula: rollParts[0],
				};
				// Everything after formula is damage type(s)
				if (rollParts.length > 1) {
					const typeParts = rollParts.slice(1);
					roll.type = typeParts.length === 1 ? typeParts[0] : typeParts;
				}
				rolls.push(roll);
			}
		}

		options.rolls = rolls;

		// Extract shared options
		for (const part of sharedOptions) {
			if (part === "average") {
				options.average = true;
			} else if (part.startsWith("average=")) {
				const value = part.substring(8);
				const numValue = parseInt(value);
				options.average = Number.isNaN(numValue) ? value : numValue;
			} else if (part.startsWith("format=")) {
				const value = part.substring(7);
				if (value === "short" || value === "long" || value === "extended") {
					options.format = value;
				}
			}
		}

		return options;
	}

	// Check for explicit key=value format (after checking for multiple rolls)
	// Explicit format means the formula itself is in key=value format
	// Shorthand can have average= or format= but formula is positional
	const hasExplicitFormat =
		body.includes("=") && body.trim().split(/\s+/)[0].includes("=");

	if (hasExplicitFormat) {
		// Parse explicit format: formula=2d6 type=fire average=true
		const parts = body.split(/\s+/);
		for (const part of parts) {
			const [key, ...valueParts] = part.split("=");
			const value = valueParts.join("=");

			switch (key) {
				case "formula":
					options.formula = value;
					break;
				case "type":
					// Handle slash-separated types: type=fire/cold
					if (value.includes("/")) {
						options.type = value.split("/");
					} else {
						options.type = value;
					}
					break;
				case "average":
					if (value === "true") {
						options.average = true;
					} else {
						const numValue = parseInt(value);
						options.average = Number.isNaN(numValue) ? value : numValue;
					}
					break;
				case "activity":
					options.activity = value;
					break;
				case "format":
					if (value === "short" || value === "long" || value === "extended") {
						options.format = value;
					}
					break;
			}
		}
	} else {
		// Parse shorthand format: 2d6 fire, 2d6 fire average, etc.
		const parts = body.split(/\s+/).filter((p) => p.length > 0);

		if (parts.length === 0) {
			return options;
		}

		// First part is always formula
		options.formula = parts[0];

		// Remaining parts could be:
		// - Damage type(s)
		// - "average" or "average=value"
		// - "format=value"
		let i = 1;
		const typeParts: string[] = [];

		while (i < parts.length) {
			const part = parts[i];

			if (part === "average") {
				options.average = true;
				i++;
			} else if (part.startsWith("average=")) {
				const value = part.substring(8);
				const numValue = parseInt(value);
				options.average = Number.isNaN(numValue) ? value : numValue;
				i++;
			} else if (part.startsWith("format=")) {
				const value = part.substring(7);
				if (value === "short" || value === "long" || value === "extended") {
					options.format = value;
				}
				i++;
			} else if (!part.includes("=")) {
				// Only treat as damage type if it doesn't contain "="
				// (to avoid parsing explicit format parts as types)
				typeParts.push(part);
				i++;
			} else {
				// Skip parts with "=" that aren't recognized (might be explicit format mixed in)
				i++;
			}
		}

		if (typeParts.length > 0) {
			options.type = typeParts.length === 1 ? typeParts[0] : typeParts;
		}
	}

	return options;
}

/**
 * Parses a heal command body
 */
function parseHealCommand(body: string): HealEnricherOptions {
	const options: HealEnricherOptions = {};

	if (!body) {
		return options;
	}

	// Check for explicit key=value format
	// Explicit format means the formula itself is in key=value format
	// Shorthand can have average= or format= but formula is positional
	const hasExplicitFormat =
		body.includes("=") && body.trim().split(/\s+/)[0].includes("=");

	if (hasExplicitFormat) {
		// Parse explicit format: formula=2d4+2 type=healing average=true
		const parts = body.split(/\s+/);
		for (const part of parts) {
			const [key, ...valueParts] = part.split("=");
			const value = valueParts.join("=");

			switch (key) {
				case "formula":
					options.formula = value;
					break;
				case "type":
					// Handle temphp or temp -> both map to temp/temphp
					if (value === "temphp" || value === "temp") {
						options.type = "temp";
					} else if (value === "healing") {
						options.type = "healing";
					}
					break;
				case "average":
					if (value === "true") {
						options.average = true;
					} else {
						const numValue = parseInt(value);
						options.average = Number.isNaN(numValue) ? value : numValue;
					}
					break;
				case "activity":
					options.activity = value;
					break;
				case "format":
					if (value === "short" || value === "long" || value === "extended") {
						options.format = value;
					}
					break;
			}
		}
	} else {
		// Parse shorthand format: 2d4+2, 2d4+2 temp, 10 temp, 2d4+2 average, etc.
		const parts = body.split(/\s+/).filter((p) => p.length > 0);

		if (parts.length === 0) {
			return options;
		}

		// First part is always formula
		options.formula = parts[0];

		// Remaining parts could be:
		// - "temp" (for temporary HP)
		// - "average" or "average=value"
		// - "format=value"
		let i = 1;

		while (i < parts.length) {
			const part = parts[i];

			if (part === "temp" || part === "temphp") {
				options.type = "temp";
				i++;
			} else if (part === "average") {
				options.average = true;
				i++;
			} else if (part.startsWith("average=")) {
				const value = part.substring(8);
				const numValue = parseInt(value);
				options.average = Number.isNaN(numValue) ? value : numValue;
				i++;
			} else if (part.startsWith("format=")) {
				const value = part.substring(7);
				if (value === "short" || value === "long" || value === "extended") {
					options.format = value;
				}
				i++;
			} else if (!part.includes("=")) {
				// Unknown part without "=", skip it
				i++;
			} else {
				// Skip parts with "=" that aren't recognized
				i++;
			}
		}
	}

	return options;
}

/**
 * Parses an item command body
 */
function parseItemCommand(body: string): ItemEnricherOptions {
	const options: ItemEnricherOptions = {};

	if (!body) {
		return options;
	}

	// Check for explicit key=value format (activity=)
	const hasExplicitFormat = body.includes("=");

	if (hasExplicitFormat) {
		// Parse explicit format: Bite activity=Poison or Actor.Item.UUID activity=Poison
		const parts = body.split(/\s+/);
		let mainPart = "";
		let activityFound = false;

		for (const part of parts) {
			if (part.startsWith("activity=")) {
				activityFound = true;
				// Extract activity value, handling quotes
				let activityValue = part.substring(9); // Remove "activity="
				// Remove quotes if present
				if (
					(activityValue.startsWith('"') && activityValue.endsWith('"')) ||
					(activityValue.startsWith("'") && activityValue.endsWith("'"))
				) {
					activityValue = activityValue.slice(1, -1);
				}
				options.activity = activityValue;
			} else if (!activityFound) {
				// Collect all parts before activity= as the main identifier
				mainPart = mainPart ? `${mainPart} ${part}` : part;
			}
		}

		// Determine what type of identifier the main part is
		if (mainPart) {
			// Check if it's a UUID (contains Actor. and Item.)
			if (mainPart.includes("Actor.") && mainPart.includes("Item.")) {
				options.uuid = mainPart;
			} else if (mainPart.startsWith(".")) {
				// Relative UUID (starts with .)
				options.relativeId = mainPart;
			} else {
				// Could be item name or relative ID
				// If it looks like an ID (alphanumeric, no spaces typically), treat as relativeId
				// Otherwise treat as item name
				if (/^[a-zA-Z0-9._-]+$/.test(mainPart) && !mainPart.includes(" ")) {
					// Likely an ID (no spaces, alphanumeric)
					options.relativeId = mainPart;
				} else {
					// Likely an item name (may contain spaces)
					options.itemName = mainPart;
				}
			}
		}
	} else {
		// No explicit format, just the identifier
		// Check if it's a UUID (contains Actor. and Item.)
		if (body.includes("Actor.") && body.includes("Item.")) {
			options.uuid = body;
		} else if (body.startsWith(".")) {
			// Relative UUID (starts with .)
			options.relativeId = body;
		} else {
			// Could be item name or relative ID
			// If it looks like an ID (alphanumeric, no spaces typically), treat as relativeId
			// Otherwise treat as item name
			if (/^[a-zA-Z0-9._-]+$/.test(body) && !body.includes(" ")) {
				// Likely an ID (no spaces, alphanumeric)
				options.relativeId = body;
			} else {
				// Likely an item name (may contain spaces)
				options.itemName = body;
			}
		}
	}

	return options;
}

/**
 * Parses a save/concentration command body
 */
function parseSaveCommand(body: string): SaveEnricherOptions {
	const options: SaveEnricherOptions = {};

	if (!body) {
		return options;
	}

	// Check for explicit key=value format
	const hasExplicitFormat = body.includes("=");

	if (hasExplicitFormat) {
		// Parse explicit format: ability=dexterity dc=15 format=long
		const parts = body.split(/\s+/);
		for (const part of parts) {
			const [key, ...valueParts] = part.split("=");
			const value = valueParts.join("="); // Handle values that might contain '='

			switch (key) {
				case "ability":
					// Handle slash-separated abilities: ability=str/dex
					if (value.includes("/")) {
						options.ability = value.split("/").map(normalizeAbility);
					} else {
						options.ability = normalizeAbility(value);
					}
					break;
				case "dc": {
					// Try to parse as number, otherwise keep as string (formula)
					const numValue = parseInt(value);
					options.dc = Number.isNaN(numValue) ? value : numValue;
					break;
				}
				case "format":
					if (value === "short" || value === "long") {
						options.format = value;
					}
					break;
				case "activity":
					options.activity = value;
					break;
			}
		}
	} else {
		// Parse shorthand format: dex 15, dexterity, strength dexterity 20, etc.
		const parts = body.split(/\s+/).filter((p) => p.length > 0);

		if (parts.length === 0) {
			return options;
		}

		// Try to identify what each part is
		const identified: {
			abilities: string[];
			dc?: string | number;
		} = { abilities: [] };

		for (const part of parts) {
			const lower = part.toLowerCase();

			// Check if it's an ability
			if (isAbility(lower)) {
				identified.abilities.push(normalizeAbility(lower));
				continue;
			}

			// Check if it's a number (DC)
			const numValue = parseInt(part);
			if (!Number.isNaN(numValue)) {
				identified.dc = numValue;
				continue;
			}

			// If we can't identify it, assume it's an ability (for custom abilities)
			identified.abilities.push(part);
		}

		// Map identified parts to options
		if (identified.abilities.length > 0) {
			options.ability =
				identified.abilities.length === 1
					? identified.abilities[0]
					: identified.abilities;
		}

		if (identified.dc !== undefined) {
			options.dc = identified.dc;
		}
	}

	return options;
}

/**
 * Parses a basic roll command body
 * Handles formats like:
 * - 5d20
 * - 5d20 # This is my roll!
 * - 2d6[slashing damage]+1d8[fire damage]
 * - 2d6[slashing damage]+1d8[fire damage] # Sword attack
 */
function parseBasicRollCommand(
	body: string,
	baseOptions: Partial<BasicRollEnricherOptions> = {},
): BasicRollEnricherOptions {
	const options: BasicRollEnricherOptions = { ...baseOptions };

	if (!body) {
		return options;
	}

	// Split on # to separate formula from description
	const hashIndex = body.indexOf("#");
	let formulaPart = body;
	let descriptionPart = "";

	if (hashIndex !== -1) {
		formulaPart = body.substring(0, hashIndex).trim();
		descriptionPart = body.substring(hashIndex + 1).trim();
	}

	// Set description if present
	if (descriptionPart) {
		options.description = descriptionPart;
	}

	// Parse formula part for dice descriptions
	// Pattern: formula[description] or formula[description]+formula[description]
	// We need to match dice formulas with optional descriptions in brackets
	const diceDescriptionPattern = /(\d+d\d+|\d+|\w+)(?:\[([^\]]+)\])?/g;
	const diceDescriptions: Array<{ formula: string; description: string }> = [];

	// Check if there are any dice descriptions (brackets with text)
	if (formulaPart.includes("[")) {
		// Parse dice descriptions
		let match: RegExpExecArray | null =
			diceDescriptionPattern.exec(formulaPart);
		while (match !== null) {
			const formula = match[1];
			const description = match[2];

			if (description) {
				diceDescriptions.push({
					formula,
					description,
				});
			}

			match = diceDescriptionPattern.exec(formulaPart);
		}

		// If we found dice descriptions, use them
		if (diceDescriptions.length > 0) {
			options.diceDescriptions = diceDescriptions;
			// Also set the full formula for reference
			options.formula = formulaPart;
		} else {
			// Has brackets but no valid descriptions, just use formula as-is
			options.formula = formulaPart;
		}
	} else {
		// No dice descriptions, just set the formula
		options.formula = formulaPart;
	}

	return options;
}
