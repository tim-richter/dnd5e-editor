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
