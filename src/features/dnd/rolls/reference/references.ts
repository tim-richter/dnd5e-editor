/**
 * Ability references
 */
export const ABILITY_REFERENCES = [
	"strength",
	"dexterity",
	"constitution",
	"intelligence",
	"wisdom",
	"charisma",
] as const;

export type AbilityReference = (typeof ABILITY_REFERENCES)[number];

export const ABILITY_REFERENCE_ABBREVIATIONS: Record<string, AbilityReference> =
	{
		str: "strength",
		dex: "dexterity",
		con: "constitution",
		int: "intelligence",
		wis: "wisdom",
		cha: "charisma",
	};

/**
 * Skill references
 */
export const SKILL_REFERENCES = [
	"acrobatics",
	"animalHandling",
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
	"sleightOfHand",
	"stealth",
	"survival",
] as const;

export type SkillReference = (typeof SKILL_REFERENCES)[number];

export const SKILL_REFERENCE_ABBREVIATIONS: Record<string, SkillReference> = {
	acr: "acrobatics",
	ani: "animalHandling",
	arc: "arcana",
	ath: "athletics",
	dec: "deception",
	hist: "history",
	ins: "insight",
	itm: "intimidation",
	inv: "investigation",
	med: "medicine",
	nat: "nature",
	prc: "perception",
	prf: "performance",
	per: "persuasion",
	rel: "religion",
	slh: "sleightOfHand",
	ste: "stealth",
	sur: "survival",
};

/**
 * Condition References
 */
export const CONDITION_REFERENCES = [
	"blinded",
	"charmed",
	"deafened",
	"exhaustion",
	"frightened",
	"grappled",
	"incapacitated",
	"invisible",
	"paralyzed",
	"petrified",
	"poisoned",
	"prone",
	"restrained",
	"stunned",
	"unconscious",
] as const;

export type ConditionReference = (typeof CONDITION_REFERENCES)[number];

/**
 * Creature Type References
 */
export const CREATURE_TYPE_REFERENCES = [
	"aberration",
	"beast",
	"celestial",
	"construct",
	"dragon",
	"elemental",
	"fey",
	"fiend",
	"giant",
	"humanoid",
	"monstrosity",
	"ooze",
	"plant",
	"undead",
] as const;

export type CreatureTypeReference = (typeof CREATURE_TYPE_REFERENCES)[number];

/**
 * Damage Type References
 */
export const DAMAGE_TYPE_REFERENCES = [
	"acid",
	"bludgeoning",
	"cold",
	"fire",
	"force",
	"lightning",
	"necrotic",
	"piercing",
	"poison",
	"psychic",
	"radiant",
	"slashing",
	"thunder",
] as const;

export type DamageTypeReference = (typeof DAMAGE_TYPE_REFERENCES)[number];

/**
 * Area of Effects References
 */
export const AREA_OF_EFFECT_REFERENCES = [
	"cone",
	"cube",
	"sphere",
	"square",
	"line",
] as const;

export type AreaOfEffectReference = (typeof AREA_OF_EFFECT_REFERENCES)[number];

/**
 * Spell Component References
 */
export const SPELL_COMPONENT_REFERENCES = [
	"concentration",
	"material",
	"ritual",
	"somatic",
	"verbal",
] as const;

export type SpellComponentReference =
	(typeof SPELL_COMPONENT_REFERENCES)[number];

/**
 * Spell School References
 */
export const SPELL_SCHOOL_REFERENCES = [
	"abjuration",
	"conjuration",
	"divination",
	"enchantment",
	"evocation",
	"illusion",
	"necromancy",
	"transmutation",
] as const;

export type SpellSchoolReference = (typeof SPELL_SCHOOL_REFERENCES)[number];

export const SPELL_SCHOOL_REFERENCE_ABBREVIATIONS: Record<
	string,
	SpellSchoolReference
> = {
	abj: "abjuration",
	con: "conjuration",
	div: "divination",
	enc: "enchantment",
	evo: "evocation",
	ill: "illusion",
	nec: "necromancy",
	trs: "transmutation",
};

/**
 * Other Ruleset References
 */
export const OTHER_RULESET_REFERENCES = [
	"inspiration",
	"carryingCapacity",
	"encumbrance",
	"hiding",
	"passivePerception",
	"falling",
	"suffocating",
	"lightlyObscured",
	"heavilyObscured",
	"brightLight",
] as const;

export type OtherRulesetReference = (typeof OTHER_RULESET_REFERENCES)[number];
