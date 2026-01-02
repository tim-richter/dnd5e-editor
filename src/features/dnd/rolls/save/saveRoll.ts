import {
	type Ability,
	isAbility,
	normalizeAbility,
} from "../../abilities/abilities";

// Save enricher options
export interface SaveEnricherOptions {
	ability?: Ability | string | string[]; // Ability(ies) to use (can be full name, abbreviation, or array)
	dc?: string | number; // DC value or formula (e.g., 15 or "@abilities.con.dc")
	format?: "short" | "long"; // Display format
	activity?: string; // Activity ID
}

/**
 * Creates a save enricher command in the format [[/save ...]] or [[/concentration ...]]
 * Examples:
 * - [[/save dex]] or [[/save ability=dexterity]]
 * - [[/save dexterity]] or [[/save ability=dexterity format=long]]
 * - [[/save ability=str/dex dc=20]] or [[/save strength dexterity 20]]
 * - [[/save ability=dexterity dc=20]] or [[/save dexterity 20]]
 * - [[/save activity=RLQlsLo5InKHZadn]] or [[/save]]
 * - [[/concentration dc=15]] or [[/concentration 15]]
 * - [[/concentration ability=cha]]
 */
export const createSaveEnricher = (
	options?: SaveEnricherOptions | Ability | string,
	isConcentration: boolean = false,
): string => {
	const enricherType = isConcentration ? "concentration" : "save";

	// Legacy support: if a string is passed, treat it as ability
	if (typeof options === "string") {
		// Check if it's an ability
		if (isAbility(options)) {
			return `[[/${enricherType} ${normalizeAbility(options)}]]`;
		}
		// Otherwise treat as-is
		return `[[/${enricherType} ${options}]]`;
	}

	// If no options provided, create a simple save enricher (auto-detects activity)
	if (!options || Object.keys(options).length === 0) {
		return `[[/${enricherType}]]`;
	}

	// Check for shorthand formats first (before building parts array)
	const hasOtherOptions =
		options.format !== undefined ||
		options.activity !== undefined ||
		options.dc !== undefined;
	const isMultipleAbilities =
		Array.isArray(options.ability) && options.ability.length > 1;
	const isSingleAbility = options.ability && !Array.isArray(options.ability);
	const isNumericDC = typeof options.dc === "number";

	// Simple ability save (shorthand)
	if (isSingleAbility && !hasOtherOptions) {
		return `[[/${enricherType} ${normalizeAbility(options.ability as string)}]]`;
	}

	// Ability + DC shorthand (e.g., "dexterity 20" or "dex 15")
	if (isSingleAbility && isNumericDC && !options.format && !options.activity) {
		return `[[/${enricherType} ${normalizeAbility(options.ability as string)} ${options.dc}]]`;
	}

	// Multiple abilities shorthand (e.g., "strength dexterity")
	if (
		isMultipleAbilities &&
		!options.dc &&
		!hasOtherOptions &&
		options.ability &&
		Array.isArray(options.ability)
	) {
		const normalizedAbilities = options.ability.map(normalizeAbility);
		return `[[/${enricherType} ${normalizedAbilities.join(" ")}]]`;
	}

	// Multiple abilities + DC shorthand (e.g., "strength dexterity 20")
	if (
		isMultipleAbilities &&
		isNumericDC &&
		!options.format &&
		!options.activity &&
		options.ability &&
		Array.isArray(options.ability)
	) {
		const normalizedAbilities = options.ability.map(normalizeAbility);
		return `[[/${enricherType} ${normalizedAbilities.join(" ")} ${options.dc}]]`;
	}

	// Build full format with explicit keys
	const parts: string[] = [];

	// Handle ability(ies)
	if (options.ability) {
		if (Array.isArray(options.ability)) {
			const normalizedAbilities = options.ability.map(normalizeAbility);
			parts.push(`ability=${normalizedAbilities.join("/")}`);
		} else {
			const normalizedAbility = normalizeAbility(options.ability);
			parts.push(`ability=${normalizedAbility}`);
		}
	}

	// Handle DC (formula DCs must use explicit dc= prefix)
	if (options.dc !== undefined) {
		parts.push(`dc=${options.dc}`);
	}

	// Handle format
	if (options.format) {
		parts.push(`format=${options.format}`);
	}

	// Handle activity
	if (options.activity) {
		parts.push(`activity=${options.activity}`);
	}

	return `[[/${enricherType} ${parts.join(" ")}]]`;
};

// Create a concentration save enricher
export const createConcentrationEnricher = (
	options?: SaveEnricherOptions | Ability | string,
): string => {
	return createSaveEnricher(options, true);
};
