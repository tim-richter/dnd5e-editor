import {
	type Ability,
	isAbility,
	normalizeAbility,
} from "../../abilities/abilities";
import { isSkill, normalizeSkill, type Skill } from "../../skills/skills";

// Check enricher options
export interface CheckEnricherOptions {
	ability?: Ability | string; // Ability to use (can be full name or abbreviation)
	skill?: Skill | string | string[]; // Skill(s) to use (can be full name, abbreviation, or array)
	tool?: string | string[]; // Tool(s) to use
	vehicle?: string; // Vehicle to use
	dc?: string | number; // DC value or formula (e.g., 15 or "@abilities.con.dc")
	format?: "short" | "long"; // Display format
	passive?: boolean; // Passive check
	activity?: string; // Activity ID
	rules?: "2014" | "2024"; // Rules version (only affects skill+tool combinations)
}

/**
 * Creates a check enricher command in the format [[/check ...]], [[/skill ...]], or [[/tool ...]]
 * Examples:
 * - [[/check dex]] or [[/check ability=dexterity]]
 * - [[/check skill=acrobatics]] or [[/check acrobatics]]
 * - [[/check ability=dexterity dc=20]] or [[/check dexterity 20]]
 * - [[/check skill=acr/ath dc=15]]
 * - [[/check ability=str skill=dec/per dc=15]]
 * - [[/skill skill=perception dc=15 passive=true]]
 * - [[/check activity=RLQlsLo5InKHZadn]]
 */
export const createCheckEnricher = (
	options?: CheckEnricherOptions | Ability | Skill | string,
	enricherType: "check" | "skill" | "tool" = "check",
): string => {
	// Legacy support: if a string is passed, treat it as ability or skill
	if (typeof options === "string") {
		// Check if it's an ability
		if (isAbility(options)) {
			return `[[/${enricherType} ${normalizeAbility(options)}]]`;
		}
		// Check if it's a skill
		if (isSkill(options)) {
			return `[[/${enricherType} ${normalizeSkill(options)}]]`;
		}
		// Otherwise treat as-is
		return `[[/${enricherType} ${options}]]`;
	}

	// If no options provided, create a simple check enricher (auto-detects activity)
	if (!options || Object.keys(options).length === 0) {
		return `[[/${enricherType}]]`;
	}

	// Check for shorthand formats first (before building parts array)
	const hasOtherOptions =
		options.tool ||
		options.vehicle ||
		options.format ||
		options.passive ||
		options.activity ||
		options.rules;
	const isMultipleSkills =
		Array.isArray(options.skill) && options.skill.length > 1;
	const isSingleSkill = options.skill && !Array.isArray(options.skill);
	const isNumericDC = typeof options.dc === "number";

	// Simple ability check (shorthand)
	if (options.ability && !options.skill && !hasOtherOptions) {
		return `[[/${enricherType} ${normalizeAbility(options.ability)}]]`;
	}

	// Simple skill check (shorthand)
	if (
		isSingleSkill &&
		options.skill &&
		!options.ability &&
		!hasOtherOptions &&
		!options.dc
	) {
		const normalizedSkill = normalizeSkill(options.skill as string);
		return `[[/${enricherType} ${normalizedSkill}]]`;
	}

	// Ability + DC shorthand (e.g., "dexterity 20" or "dex 15")
	if (options.ability && isNumericDC && !options.skill && !hasOtherOptions) {
		return `[[/${enricherType} ${normalizeAbility(options.ability)} ${options.dc}]]`;
	}

	// Skill + DC shorthand (e.g., "perception 15")
	if (
		isSingleSkill &&
		isNumericDC &&
		!options.ability &&
		!hasOtherOptions &&
		options.skill
	) {
		const normalizedSkill = normalizeSkill(options.skill);
		return `[[/${enricherType} ${normalizedSkill} ${options.dc}]]`;
	}

	// Ability + skill shorthand (e.g., "strength intimidation")
	if (
		options.ability &&
		isSingleSkill &&
		!options.dc &&
		!hasOtherOptions &&
		options.skill
	) {
		const normalizedAbility = normalizeAbility(options.ability);
		const normalizedSkill = normalizeSkill(options.skill);
		return `[[/${enricherType} ${normalizedAbility} ${normalizedSkill}]]`;
	}

	// Multiple skills shorthand (e.g., "acrobatics athletics")
	if (
		isMultipleSkills &&
		!options.ability &&
		!options.dc &&
		!hasOtherOptions &&
		options.skill &&
		Array.isArray(options.skill)
	) {
		const normalizedSkills = options.skill.map(normalizeSkill);
		return `[[/${enricherType} ${normalizedSkills.join(" ")}]]`;
	}

	// Multiple skills + DC shorthand (e.g., "acrobatics athletics 15")
	if (
		isMultipleSkills &&
		isNumericDC &&
		!options.ability &&
		!hasOtherOptions &&
		options.skill &&
		Array.isArray(options.skill)
	) {
		const normalizedSkills = options.skill.map(normalizeSkill);
		return `[[/${enricherType} ${normalizedSkills.join(" ")} ${options.dc}]]`;
	}

	// Ability + multiple skills + DC shorthand (e.g., "strength deception persuasion 15")
	if (
		options.ability &&
		isMultipleSkills &&
		isNumericDC &&
		!hasOtherOptions &&
		options.skill &&
		Array.isArray(options.skill)
	) {
		const normalizedAbility = normalizeAbility(options.ability);
		const normalizedSkills = options.skill.map(normalizeSkill);
		return `[[/${enricherType} ${normalizedAbility} ${normalizedSkills.join(" ")} ${options.dc}]]`;
	}

	// Build full format with explicit keys
	const parts: string[] = [];

	// Handle ability
	if (options.ability) {
		const normalizedAbility = normalizeAbility(options.ability);
		parts.push(`ability=${normalizedAbility}`);
	}

	// Handle skill(s)
	if (options.skill) {
		parts.push(`skill=${normalizeSkill(options.skill)}`);
	}

	// Handle tool(s)
	if (options.tool) {
		if (Array.isArray(options.tool)) {
			parts.push(`tool=${options.tool.join("/")}`);
		} else {
			parts.push(`tool=${options.tool}`);
		}
	}

	// Handle vehicle
	if (options.vehicle) {
		parts.push(`vehicle=${options.vehicle}`);
	}

	// Handle DC (formula DCs must use explicit dc= prefix)
	if (options.dc !== undefined) {
		parts.push(`dc=${options.dc}`);
	}

	// Handle format
	if (options.format) {
		parts.push(`format=${options.format}`);
	}

	// Handle passive
	if (options.passive) {
		parts.push(`passive=true`);
	}

	// Handle activity
	if (options.activity) {
		parts.push(`activity=${options.activity}`);
	}

	// Handle rules
	if (options.rules) {
		parts.push(`rules=${options.rules}`);
	}

	return `[[/${enricherType} ${parts.join(" ")}]]`;
};

// Create a skill check roll command
export const createSkillCheck = (
	skill: Skill | string,
	options?: Omit<CheckEnricherOptions, "skill">,
): string => {
	return createCheckEnricher({ ...options, skill }, "skill");
};

export const createAbilityCheck = (
	ability: Ability | string,
	options?: Omit<CheckEnricherOptions, "ability">,
): string => {
	return createCheckEnricher({ ...options, ability }, "check");
};
