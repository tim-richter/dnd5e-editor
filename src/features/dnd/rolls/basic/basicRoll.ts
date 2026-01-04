// Basic roll enricher options
export interface BasicRollEnricherOptions {
	formula?: string; // Dice formula (e.g., "5d20", "1d10 + 1d4", "1d20 / 2 + 10")
	mode?: "public" | "gm" | "blind" | "self"; // Roll mode (default: public)
	description?: string; // Roll description (appears after #)
	diceDescriptions?: Array<{
		formula: string; // Dice formula for this part
		description: string; // Description for this dice (appears in [])
	}>; // Individual dice descriptions
	inline?: "immediate" | "deferred" | false; // Inline roll type: immediate ([[formula]]), deferred ([[/roll formula]]), or false for regular roll
	label?: string; // Label for inline rolls (appears as {label} after the roll)
}

/**
 * Creates a basic roll enricher command in the format [[/roll ...]] or [[formula]]
 * Examples:
 * - [[/roll 5d20]] - Basic roll
 * - [[/roll 1d10 + 1d4 + 4]] - Roll with math
 * - [[/roll 1d20 / 2 + 10]] - Roll with division
 * - [[/roll 5d20 # This is my roll!]] - Roll with description
 * - [[/roll 2d6[slashing damage]+1d8[fire damage]]] - Roll with dice descriptions
 * - [[5d20]] - Immediate inline roll
 * - [[5d20]{Roll for damage}]] - Immediate inline roll with label
 * - [[/roll 5d20]] - Deferred inline roll
 * - [[/roll 5d20]{Click to roll}]] - Deferred inline roll with label
 * - [[/gmroll 1d20]] - GM roll
 * - [[/blindroll 1d20]] - Blind roll
 * - [[/selfroll 1d20]] - Self roll
 * - [[/publicroll 1d20]] - Public roll (explicit)
 */
export const createBasicRoll = (
	options?: BasicRollEnricherOptions | string,
): string => {
	// Legacy support: if a string is passed, treat it as a formula
	if (typeof options === "string") {
		return `[[/roll ${options}]]`;
	}

	// If no options provided, create a simple roll
	if (!options || Object.keys(options).length === 0) {
		return `[[/roll]]`;
	}

	// Determine roll mode command prefix
	let commandPrefix = "/roll";
	if (options.mode) {
		switch (options.mode) {
			case "public":
				commandPrefix = "/publicroll"; // or /pr
				break;
			case "gm":
				commandPrefix = "/gmroll"; // or /gmr
				break;
			case "blind":
				commandPrefix = "/blindroll"; // or /broll or /br
				break;
			case "self":
				commandPrefix = "/selfroll"; // or /sr
				break;
		}
	}

	// Handle inline rolls (immediate vs deferred)
	if (options.inline === "immediate" || options.inline === "deferred") {
		// Build the formula with dice descriptions if provided
		let formula = options.formula || "";
		if (options.diceDescriptions && options.diceDescriptions.length > 0) {
			// Build formula from dice descriptions
			const formulaParts: string[] = [];
			for (const diceDesc of options.diceDescriptions) {
				formulaParts.push(`${diceDesc.formula}[${diceDesc.description}]`);
			}
			formula = formulaParts.join("+");
		}

		if (!formula) {
			return `[[]]`;
		}

		// Immediate inline roll: [[formula]] or [[formula]]{label}
		if (options.inline === "immediate") {
			const label = options.label ? `{${options.label}}` : "";
			return `[[${formula}]]${label}`;
		}

		// Deferred inline roll: [[/roll formula]] or [[/roll formula]]{label}
		// Note: For deferred rolls, mode doesn't apply (they use the default roll mode)
		const label = options.label ? `{${options.label}}` : "";
		return `[[/roll ${formula}]]${label}`;
	}

	// Regular roll (not inline): [[/roll ...]] or [[/mode ...]]
	const parts: string[] = [];

	// Build the formula with dice descriptions if provided
	if (options.diceDescriptions && options.diceDescriptions.length > 0) {
		// If dice descriptions are provided, build formula from them
		const formulaParts: string[] = [];
		for (const diceDesc of options.diceDescriptions) {
			formulaParts.push(`${diceDesc.formula}[${diceDesc.description}]`);
		}
		parts.push(formulaParts.join("+"));
	} else if (options.formula) {
		// Use the provided formula
		parts.push(options.formula);
	}

	// Add description if provided
	if (options.description) {
		parts.push(`# ${options.description}`);
	}

	// Build the command
	const commandBody = parts.join(" ");
	return `[[${commandPrefix}${commandBody ? ` ${commandBody}` : ""}]]`;
};
