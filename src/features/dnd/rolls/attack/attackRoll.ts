import { isAbility, normalizeAbility } from "../../abilities/abilities";

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
		if (isAbility(options)) {
			// For backward compatibility, use the old format
			return `@attack[${normalizeAbility(options)}]`;
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
