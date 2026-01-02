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

export type Skill = (typeof SKILLS)[number];

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

/**
 * Normalizes skill name (handles abbreviations and full names)
 */
export function normalizeSkill(skill: string | string[]): string {
	if (Array.isArray(skill)) {
		return skill.map((s) => normalizeSkill(s)).join(" ");
	}

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
 * Checks if a string is a valid skill
 */
export function isSkill(skill: string): skill is Skill {
	return (
		SKILLS.includes(skill as Skill) ||
		SKILL_ABBREVIATIONS[skill.toLowerCase()] !== undefined
	);
}
