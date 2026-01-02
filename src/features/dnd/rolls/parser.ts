import {
	isAbility,
	normalizeAbility,
} from "@/features/dnd/abilities/abilities";
import type { AttackEnricherOptions } from "@/features/dnd/rolls/attack/attackRoll";
import type { CheckEnricherOptions } from "@/features/dnd/rolls/check/checkRoll";
import type { DamageEnricherOptions } from "@/features/dnd/rolls/damage/damageRoll";
import type { HealEnricherOptions } from "@/features/dnd/rolls/heal/healRoll";
import { isSkill, normalizeSkill } from "@/features/dnd/skills/skills";

/**
 * Parses a roll command string and extracts structured options
 * Supports formats like:
 * - [[/check acrobatics dc=15]]
 * - [[/check dex 15]]
 * - [[/check ability=dexterity dc=20]]
 * - [[/skill perception]]
 * - [[/attack +5]]
 * - [[/attack formula=5 attackMode=thrown]]
 * - [[/damage 2d6 fire]]
 * - [[/damage 2d6 fire average]]
 */
export function parseRollCommand(command: string): {
	type: "check" | "skill" | "tool" | "attack" | "damage" | "heal";
	options:
		| CheckEnricherOptions
		| AttackEnricherOptions
		| DamageEnricherOptions
		| HealEnricherOptions;
	originalCommand: string;
} | null {
	// Match roll command pattern: [[/type ...]]
	const match = command.match(
		/\[\[\/(check|skill|tool|attack|damage|heal)([^\]]*)\]\]/,
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
		| "heal";
	const body = match[2].trim();

	if (type === "attack") {
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
	} else {
		return {
			type,
			options: parseCheckCommand(body, type),
			originalCommand: command,
		};
	}
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
