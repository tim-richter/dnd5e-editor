// D&D 5e skill names
export const SKILLS = [
	"acrobatics",
	"animal-handling",
	"arcana",
	"athletics",
	"deception",
	"history",
	"insight",
	"intimidation",
	"investigation",
	"medicine",
	"nature",
	"perception",
	"performance",
	"persuasion",
	"religion",
	"sleight-of-hand",
	"stealth",
	"survival",
] as const;

// D&D 5e ability scores
export const ABILITIES = [
	"strength",
	"dexterity",
	"constitution",
	"intelligence",
	"wisdom",
	"charisma",
] as const;

export type Skill = (typeof SKILLS)[number];
export type Ability = (typeof ABILITIES)[number];

// Ability abbreviations
export const ABILITY_ABBREVIATIONS: Record<string, Ability> = {
	str: "strength",
	dex: "dexterity",
	con: "constitution",
	int: "intelligence",
	wis: "wisdom",
	cha: "charisma",
};

// Skill abbreviations (common ones)
export const SKILL_ABBREVIATIONS: Record<string, Skill> = {
	acr: "acrobatics",
	ath: "athletics",
	dec: "deception",
	ins: "insight",
	itm: "intimidation",
	inv: "investigation",
	prc: "perception",
	prf: "performance",
	per: "persuasion",
	slh: "sleight-of-hand",
	ste: "stealth",
	sur: "survival",
};

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
 * Normalizes ability name (handles abbreviations and full names)
 */
function normalizeAbility(ability: string): string {
	const lower = ability.toLowerCase();
	if (ABILITY_ABBREVIATIONS[lower]) {
		return ABILITY_ABBREVIATIONS[lower];
	}
	if (ABILITIES.includes(lower as Ability)) {
		return lower;
	}
	return ability; // Return as-is if not recognized
}

/**
 * Normalizes skill name (handles abbreviations and full names)
 */
function normalizeSkill(skill: string): string {
	const lower = skill.toLowerCase();
	if (SKILL_ABBREVIATIONS[lower]) {
		return SKILL_ABBREVIATIONS[lower];
	}
	if (SKILLS.includes(lower as Skill)) {
		return lower;
	}
	return skill; // Return as-is if not recognized
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
		const lower = options.toLowerCase();
		// Check if it's an ability
		if (ABILITIES.includes(lower as Ability) || ABILITY_ABBREVIATIONS[lower]) {
			return `[[/${enricherType} ${lower}]]`;
		}
		// Check if it's a skill
		if (SKILLS.includes(lower as Skill) || SKILL_ABBREVIATIONS[lower]) {
			return `[[/${enricherType} ${lower}]]`;
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
	const isFormulaDC = typeof options.dc === "string";

	// Simple ability check (shorthand)
	if (options.ability && !options.skill && !hasOtherOptions) {
		const normalizedAbility = normalizeAbility(options.ability);
		const abbrev = Object.entries(ABILITY_ABBREVIATIONS).find(
			([_, full]) => full === normalizedAbility,
		)?.[0];
		return `[[/${enricherType} ${abbrev || normalizedAbility}]]`;
	}

	// Simple skill check (shorthand)
	if (isSingleSkill && !options.ability && !hasOtherOptions && !options.dc) {
		const normalizedSkill = normalizeSkill(options.skill);
		const abbrev = Object.entries(SKILL_ABBREVIATIONS).find(
			([_, full]) => full === normalizedSkill,
		)?.[0];
		return `[[/${enricherType} ${abbrev || normalizedSkill}]]`;
	}

	// Ability + DC shorthand (e.g., "dexterity 20" or "dex 15")
	if (options.ability && isNumericDC && !options.skill && !hasOtherOptions) {
		const normalizedAbility = normalizeAbility(options.ability);
		const abbrev = Object.entries(ABILITY_ABBREVIATIONS).find(
			([_, full]) => full === normalizedAbility,
		)?.[0];
		return `[[/${enricherType} ${abbrev || normalizedAbility} ${options.dc}]]`;
	}

	// Skill + DC shorthand (e.g., "perception 15")
	if (isSingleSkill && isNumericDC && !options.ability && !hasOtherOptions) {
		const normalizedSkill = normalizeSkill(options.skill);
		return `[[/${enricherType} ${normalizedSkill} ${options.dc}]]`;
	}

	// Ability + skill shorthand (e.g., "strength intimidation")
	if (options.ability && isSingleSkill && !options.dc && !hasOtherOptions) {
		const normalizedAbility = normalizeAbility(options.ability);
		const normalizedSkill = normalizeSkill(options.skill);
		return `[[/${enricherType} ${normalizedAbility} ${normalizedSkill}]]`;
	}

	// Multiple skills shorthand (e.g., "acrobatics athletics")
	if (isMultipleSkills && !options.ability && !options.dc && !hasOtherOptions) {
		const normalizedSkills = options.skill.map(normalizeSkill);
		return `[[/${enricherType} ${normalizedSkills.join(" ")}]]`;
	}

	// Multiple skills + DC shorthand (e.g., "acrobatics athletics 15")
	if (isMultipleSkills && isNumericDC && !options.ability && !hasOtherOptions) {
		const normalizedSkills = options.skill.map(normalizeSkill);
		return `[[/${enricherType} ${normalizedSkills.join(" ")} ${options.dc}]]`;
	}

	// Ability + multiple skills + DC shorthand (e.g., "strength deception persuasion 15")
	if (options.ability && isMultipleSkills && isNumericDC && !hasOtherOptions) {
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
		if (Array.isArray(options.skill)) {
			const normalizedSkills = options.skill.map(normalizeSkill);
			// Try to use abbreviations
			const abbrevs = normalizedSkills.map((skill) => {
				const abbrev = Object.entries(SKILL_ABBREVIATIONS).find(
					([_, full]) => full === skill,
				)?.[0];
				return abbrev || skill;
			});
			parts.push(`skill=${abbrevs.join("/")}`);
		} else {
			const normalizedSkill = normalizeSkill(options.skill);
			const abbrev = Object.entries(SKILL_ABBREVIATIONS).find(
				([_, full]) => full === normalizedSkill,
			)?.[0];
			parts.push(`skill=${abbrev || normalizedSkill}`);
		}
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

// Roll command templates (updated to use new enricher format)
export const createSkillCheck = (
	skill: Skill,
	options?: Omit<CheckEnricherOptions, "skill">,
): string => {
	return createCheckEnricher({ ...options, skill }, "skill");
};

export const createAbilityCheck = (
	ability: Ability,
	options?: Omit<CheckEnricherOptions, "ability">,
): string => {
	return createCheckEnricher({ ...options, ability }, "check");
};

export const createSavingThrow = (ability: Ability): string => {
	return `@save[${ability}]`;
};

// Damage enricher options
export interface DamageEnricherOptions {
	formula?: string; // Damage formula (e.g., "2d6", "1d6 + @abilities.dex.mod")
	type?: string | string[]; // Damage type(s) (e.g., "fire", ["fire", "cold"], or "fire/cold")
	average?: boolean | number | string; // Average flag: true for auto-calc, number/string for custom value
	activity?: string; // Activity ID
	format?: "short" | "long" | "extended"; // Display format (default: short)
	// For multiple rolls separated by &
	rolls?: Array<{
		formula: string;
		type?: string | string[];
	}>;
}

/**
 * Creates a damage enricher command in the format [[/damage ...]]
 * Examples:
 * - [[/damage 2d6 fire]] or [[/damage formula=2d6 type=fire]]
 * - [[/damage 2d6 fire average]] or [[/damage 2d6 fire average=true]]
 * - [[/damage 2d6kh fire average=5]]
 * - [[/damage 1d4 fire cold]] or [[/damage 1d4 type=fire/cold]]
 * - [[/damage 1d6 bludgeoning & 1d4 fire]]
 * - [[/damage activity=RLQlsLo5InKHZadn]] or [[/damage]]
 */
export const createDamageRoll = (
	options?: DamageEnricherOptions | string,
): string => {
	// Legacy support: if a string is passed, treat it as a formula
	if (typeof options === "string") {
		return `[[/damage ${options}]]`;
	}

	// If no options provided, create a simple damage enricher (auto-detects activity)
	if (!options || Object.keys(options).length === 0) {
		return `[[/damage]]`;
	}

	// Handle activity-only case
	if (options.activity && !options.formula && !options.rolls) {
		return `[[/damage activity=${options.activity}]]`;
	}

	// Handle multiple rolls (separated by &)
	if (options.rolls && options.rolls.length > 0) {
		const rollParts: string[] = [];
		for (const roll of options.rolls) {
			const parts: string[] = [roll.formula];
			if (roll.type) {
				if (Array.isArray(roll.type)) {
					parts.push(roll.type.join(" "));
				} else {
					parts.push(roll.type);
				}
			}
			rollParts.push(parts.join(" "));
		}

		const parts: string[] = [rollParts.join(" & ")];

		// Average is shared between parts
		if (options.average !== undefined) {
			if (options.average === true) {
				parts.push("average");
			} else {
				parts.push(`average=${options.average}`);
			}
		}

		// Format is shared between parts
		if (options.format) {
			parts.push(`format=${options.format}`);
		}

		return `[[/damage ${parts.join(" ")}]]`;
	}

	// Handle single roll
	// Determine if we should use shorthand or explicit format
	// Complex options that require explicit format: activity, format, average with custom value
	const hasComplexOptions =
		options.activity ||
		options.format ||
		(options.average !== undefined && options.average !== true);

	// Use shorthand format when possible (multiple types are allowed in shorthand)
	if (!hasComplexOptions && options.formula) {
		const parts: string[] = [options.formula];

		// Add damage type(s) - space-separated for shorthand
		if (options.type) {
			if (Array.isArray(options.type)) {
				parts.push(options.type.join(" "));
			} else {
				parts.push(options.type);
			}
		}

		// Add average if true (shorthand)
		if (options.average === true) {
			parts.push("average");
		}

		return `[[/damage ${parts.join(" ")}]]`;
	}

	// Use explicit format for complex cases
	const parts: string[] = [];

	// Formula
	if (options.formula) {
		parts.push(`formula=${options.formula}`);
	}

	// Damage type(s) - use slash-separated for explicit format when multiple
	if (options.type) {
		if (Array.isArray(options.type)) {
			parts.push(`type=${options.type.join("/")}`);
		} else {
			parts.push(`type=${options.type}`);
		}
	}

	// Average flag
	if (options.average !== undefined) {
		if (options.average === true) {
			parts.push("average=true");
		} else {
			parts.push(`average=${options.average}`);
		}
	}

	// Activity
	if (options.activity) {
		parts.push(`activity=${options.activity}`);
	}

	// Format
	if (options.format) {
		parts.push(`format=${options.format}`);
	}

	return `[[/damage ${parts.join(" ")}]]`;
};

// Attack enricher options
export interface AttackEnricherOptions {
	formula?: string | number; // Formula for to-hit (e.g., "+5", "5", or 5)
	activity?: string; // Activity ID
	attackMode?: string; // Attack mode (e.g., "thrown", "melee", "ranged")
	format?: "short" | "long" | "extended"; // Display format
	rules?: "2014" | "2024"; // Rules version (only affects extended format)
}

/**
 * Creates an attack enricher command in the format [[/attack ...]]
 * Examples:
 * - [[/attack +5]] or [[/attack formula=5]]
 * - [[/attack activity=jdRTb04FngE1B8cF]]
 * - [[/attack formula=5 attackMode=thrown]]
 * - [[/attack activity=jdRTb04FngE1B8cF format=extended]]
 */
export const createAttackRoll = (
	options?: AttackEnricherOptions | string | number,
): string => {
	// Legacy support: if a string is passed, treat it as an ability
	if (typeof options === "string") {
		// Check if it's an ability name (legacy format)
		if (ABILITIES.includes(options as Ability)) {
			// For backward compatibility, use the old format
			return `@attack[${options}]`;
		}
		// Otherwise treat as a formula
		return `[[/attack ${options}]]`;
	}

	// Legacy support: if a number is passed, treat it as a formula
	if (typeof options === "number") {
		return `[[/attack +${options}]]`;
	}

	// If no options provided, create a simple attack enricher
	if (!options || Object.keys(options).length === 0) {
		return `[[/attack]]`;
	}

	// Handle shorthand formats based on documentation examples:
	// - [[/attack +5]] or [[/attack formula=5]] - single formula
	// - [[/attack 5 thrown]] - formula + attackMode shorthand
	// - [[/attack extended]] - format shorthand
	// - [[/attack activity=...]] - activity (no shorthand)

	// Shorthand: Only format provided
	if (
		options.format &&
		!options.formula &&
		!options.activity &&
		!options.attackMode &&
		!options.rules
	) {
		return `[[/attack ${options.format}]]`;
	}

	// Shorthand: Only formula provided (with + or - prefix)
	if (
		options.formula !== undefined &&
		!options.activity &&
		!options.attackMode &&
		!options.format &&
		!options.rules
	) {
		const formula =
			typeof options.formula === "number"
				? `+${options.formula}`
				: options.formula;
		if (/^[+-]/.test(formula)) {
			return `[[/attack ${formula}]]`;
		}
	}

	// Shorthand: Formula + attackMode (e.g., "5 thrown")
	if (
		options.formula !== undefined &&
		options.attackMode &&
		!options.activity &&
		!options.format &&
		!options.rules
	) {
		const formula =
			typeof options.formula === "number"
				? options.formula.toString()
				: options.formula.replace(/^[+-]/, ""); // Remove + or - for shorthand
		return `[[/attack ${formula} ${options.attackMode}]]`;
	}

	// Build the command parts for full format
	const parts: string[] = [];

	// Handle formula (can be shorthand like "+5" or full "formula=5")
	if (options.formula !== undefined) {
		const formula =
			typeof options.formula === "number"
				? `+${options.formula}`
				: options.formula;
		// Check if it already starts with + or - for shorthand
		if (typeof options.formula === "string" && /^[+-]/.test(options.formula)) {
			parts.push(formula);
		} else {
			parts.push(`formula=${formula}`);
		}
	}

	// Add other options
	if (options.activity) {
		parts.push(`activity=${options.activity}`);
	}

	if (options.attackMode) {
		parts.push(`attackMode=${options.attackMode}`);
	}

	if (options.format) {
		parts.push(`format=${options.format}`);
	}

	if (options.rules) {
		parts.push(`rules=${options.rules}`);
	}

	return `[[/attack ${parts.join(" ")}]]`;
};

export const createSpellReference = (spellName: string): string => {
	return `@spell[${spellName}]`;
};

export const createItemReference = (itemName: string): string => {
	return `@item[${itemName}]`;
};

// Heal enricher options
export interface HealEnricherOptions {
	formula?: string; // Heal formula (e.g., "2d4 + 2", "10")
	type?: "healing" | "temp" | "temphp"; // Heal type: healing (default) or temp/temphp for temporary HP
	average?: boolean | number | string; // Average flag: true for auto-calc, number/string for custom value
	activity?: string; // Activity ID
	format?: "short" | "long" | "extended"; // Display format (default: short)
}

/**
 * Creates a heal enricher command in the format [[/heal ...]]
 * Examples:
 * - [[/heal 2d4 + 2]] or [[/heal formula="2d4 + 2"]]
 * - [[/heal 2d4 + 2 healing]] or [[/heal formula="2d4 + 2" type=healing]]
 * - [[/heal 10 temp]] or [[/heal formula=10 type=temphp]]
 * - [[/heal 2d4 + 2 average]] or [[/heal 2d4 + 2 average=true]]
 * - [[/heal activity=jdRTb04FngE1B8cF]] or [[/heal]]
 */
export const createHealRoll = (
	options?: HealEnricherOptions | string,
): string => {
	// Legacy support: if a string is passed, treat it as a formula
	if (typeof options === "string") {
		return `[[/heal ${options}]]`;
	}

	// If no options provided, create a simple heal enricher (auto-detects activity)
	if (!options || Object.keys(options).length === 0) {
		return `[[/heal]]`;
	}

	// Handle activity-only case
	if (options.activity && !options.formula) {
		return `[[/heal activity=${options.activity}]]`;
	}

	// Determine if we should use shorthand or explicit format
	// Complex options that require explicit format: activity, format, average with custom value, type=healing (explicit)
	const hasComplexOptions =
		options.activity ||
		options.format ||
		(options.average !== undefined && options.average !== true) ||
		(options.type === "healing"); // "healing" type should be explicit, "temp" can be shorthand

	// Use shorthand format when possible
	if (!hasComplexOptions && options.formula) {
		const parts: string[] = [options.formula];

		// Add type if it's temp (shorthand: "temp")
		if (options.type === "temp" || options.type === "temphp") {
			parts.push("temp");
		}

		// Add average if true (shorthand)
		if (options.average === true) {
			parts.push("average");
		}

		return `[[/heal ${parts.join(" ")}]]`;
	}

	// Use explicit format for complex cases
	const parts: string[] = [];

	// Formula
	if (options.formula) {
		parts.push(`formula=${options.formula}`);
	}

	// Heal type
	if (options.type) {
		// Use "temphp" for the type value in explicit format, but accept "temp" as input
		const typeValue = options.type === "temp" ? "temphp" : options.type;
		parts.push(`type=${typeValue}`);
	}

	// Average flag
	if (options.average !== undefined) {
		if (options.average === true) {
			parts.push("average=true");
		} else {
			parts.push(`average=${options.average}`);
		}
	}

	// Activity
	if (options.activity) {
		parts.push(`activity=${options.activity}`);
	}

	// Format
	if (options.format) {
		parts.push(`format=${options.format}`);
	}

	return `[[/heal ${parts.join(" ")}]]`;
};
