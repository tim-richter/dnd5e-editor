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
		options.type === "healing"; // "healing" type should be explicit, "temp" can be shorthand

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
