export const ABILITIES = [
	"strength",
	"dexterity",
	"constitution",
	"intelligence",
	"wisdom",
	"charisma",
] as const;

export type Ability = (typeof ABILITIES)[number];

export const ABILITY_ABBREVIATIONS: Record<string, Ability> = {
	str: "strength",
	dex: "dexterity",
	con: "constitution",
	int: "intelligence",
	wis: "wisdom",
	cha: "charisma",
};

/**
 * Normalizes ability name (handles abbreviations and full names)
 */
export function normalizeAbility(ability: string): string {
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
 * Checks if a string is a valid ability
 */
export function isAbility(ability: string): ability is Ability {
	return (
		ABILITIES.includes(ability as Ability) ||
		ABILITY_ABBREVIATIONS[ability.toLowerCase()] !== undefined
	);
}
