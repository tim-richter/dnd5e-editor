/**
 * Item Use Enricher Options
 *
 * Item enrichers allow you to use an item from an enriched link. There are several different methods to create an Item enricher, which will determine how the item is used:
 *
 * - By Item Name: [[/item Bite]]
 *   This functions similarly to a system macro, as if you had dragged that item to the macro hotbar. When clicked, it will check for a selected token, or your assigned actor. If the token or actor has an item of a matching name, it will be used, otherwise a warning will be displayed.
 *
 * - By Item & Activity Name: [[/item Bite activity=Poison]]
 *   Using the item name without an activity will cause the activity selection dialog to open if more than one activity is present. To trigger a specific activity on the item the activity name can be included. The activity name must be proceeded by activity=, and it must be wrapped in quotes if there is a space in the name (e.g. [[/item Tentacles activity="Escape Tentacles"]]).
 *
 * - By UUID: [[/item Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU]]
 *   A UUID contains references to an Actor and an Item it owns. When clicked, the enricher will find the specified Actor and use the specified Item.
 *
 * - By Relative ID: [[/item amUUCouL69OK1GZU]] or [[/item .amUUCouL69OK1GZU]]
 *   A Relative ID can contain a reference to an owned Item either by an ID, or a relative UUID (note the preceding .). When clicked, the enricher will use its location (either in an Actor Sheet, Item Sheet, or Chat Card) to determine the Token or Actor that owns that card or sheet in order to use the specified item from that owner.
 *
 * The activity name can also be used when referring to an item using its ID in the same manner as above with item name.
 */
export interface ItemEnricherOptions {
	/** Item name (for name-based enrichers) */
	itemName?: string;
	/** Activity name (optional, for triggering specific activities) */
	activity?: string;
	/** Full UUID (Actor.Item format) */
	uuid?: string;
	/** Relative ID (item ID or relative UUID starting with .) */
	relativeId?: string;
}

/**
 * Creates an item use enricher command in the format [[/item ...]]
 *
 * Examples:
 * - [[/item Bite]] - By item name
 * - [[/item Bite activity=Poison]] - By item name with activity
 * - [[/item Tentacles activity="Escape Tentacles"]] - Item name with quoted activity (spaces)
 * - [[/item Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU]] - By UUID
 * - [[/item amUUCouL69OK1GZU]] - By relative ID
 * - [[/item .amUUCouL69OK1GZU]] - By relative UUID
 * - [[/item amUUCouL69OK1GZU activity=Poison]] - Relative ID with activity
 */
export const createItemEnricher = (
	options?: ItemEnricherOptions | string,
): string => {
	// Legacy support: if a string is passed, treat it as item name
	if (typeof options === "string") {
		return `[[/item ${options}]]`;
	}

	// If no options provided, return empty enricher
	if (!options || Object.keys(options).length === 0) {
		return `[[/item]]`;
	}

	// By UUID (highest priority - UUID takes precedence)
	if (options.uuid) {
		const parts: string[] = [options.uuid];
		if (options.activity) {
			// Quote activity if it contains spaces
			const activityValue =
				options.activity.includes(" ") || options.activity.includes("=")
					? `"${options.activity}"`
					: options.activity;
			parts.push(`activity=${activityValue}`);
		}
		return `[[/item ${parts.join(" ")}]]`;
	}

	// By Relative ID
	if (options.relativeId) {
		const parts: string[] = [options.relativeId];
		if (options.activity) {
			// Quote activity if it contains spaces
			const activityValue =
				options.activity.includes(" ") || options.activity.includes("=")
					? `"${options.activity}"`
					: options.activity;
			parts.push(`activity=${activityValue}`);
		}
		return `[[/item ${parts.join(" ")}]]`;
	}

	// By Item Name (with optional activity)
	if (options.itemName) {
		const parts: string[] = [options.itemName];
		if (options.activity) {
			// Quote activity if it contains spaces
			const activityValue =
				options.activity.includes(" ") || options.activity.includes("=")
					? `"${options.activity}"`
					: options.activity;
			parts.push(`activity=${activityValue}`);
		}
		return `[[/item ${parts.join(" ")}]]`;
	}

	// Fallback: empty enricher
	return `[[/item]]`;
};
