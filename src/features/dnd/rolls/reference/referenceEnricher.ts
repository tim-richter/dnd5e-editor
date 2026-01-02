/**
 * Reference Enricher Options
 *
 * The &Reference enricher allows for easy reference to rule pages and displays rich tooltips with the contents of a specific rule.
 * It comes built-in with support for abilities, skills, conditions, damage types, and more.
 *
 * Using the enricher is very simple, simply type &Reference with the name of the referenced rule included inside the square brackets.
 * For example &Reference[prone] will include be converted to [Prone] which links to the prone page in the SRD rules and display a tooltip with the description of the prone condition.
 *
 * Examples:
 * - &Reference[condition=prone]
 * - &Reference[Prone]
 * - &Reference[prone]
 * - &Reference[blinded apply=false]
 * - &Reference[rule="Difficult Terrain"]
 * - &Reference[Difficult Terrain]
 */
import {
	ABILITY_REFERENCE_ABBREVIATIONS,
	ABILITY_REFERENCES,
	type AbilityReference,
	AREA_OF_EFFECT_REFERENCES,
	type AreaOfEffectReference,
	CONDITION_REFERENCES,
	type ConditionReference,
	CREATURE_TYPE_REFERENCES,
	type CreatureTypeReference,
	DAMAGE_TYPE_REFERENCES,
	type DamageTypeReference,
	OTHER_RULESET_REFERENCES,
	type OtherRulesetReference,
	SKILL_REFERENCE_ABBREVIATIONS,
	SKILL_REFERENCES,
	type SkillReference,
	SPELL_COMPONENT_REFERENCES,
	SPELL_SCHOOL_REFERENCE_ABBREVIATIONS,
	SPELL_SCHOOL_REFERENCES,
	type SpellComponentReference,
	type SpellSchoolReference,
} from "./references";

export type ReferenceCategory =
	| "ability"
	| "skill"
	| "condition"
	| "creatureType"
	| "damageType"
	| "areaOfEffect"
	| "spellComponent"
	| "spellSchool"
	| "otherRuleset"
	| "rule";

export type ReferenceValue =
	| AbilityReference
	| SkillReference
	| ConditionReference
	| CreatureTypeReference
	| DamageTypeReference
	| AreaOfEffectReference
	| SpellComponentReference
	| SpellSchoolReference
	| OtherRulesetReference
	| string; // For generic rule names

export interface ReferenceEnricherOptions {
	/** Explicit category for the reference (e.g., "condition", "ability") */
	category?: ReferenceCategory;
	/** The reference value (name of the rule being referenced) */
	rule?: string;
	/** Apply option - only usable when referencing a condition to prevent the apply condition button from appearing */
	apply?: boolean;
}

/**
 * Normalizes a reference name to its canonical form (case-insensitive matching)
 */
function normalizeReferenceName(
	name: string,
	category?: ReferenceCategory,
): string | null {
	const lower = name.toLowerCase().trim();

	// If category is specified, only check that category
	if (category) {
		switch (category) {
			case "ability": {
				// Check abbreviations first
				if (lower in ABILITY_REFERENCE_ABBREVIATIONS) {
					return ABILITY_REFERENCE_ABBREVIATIONS[lower];
				}
				// Check full names
				const found = ABILITY_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "skill": {
				// Check abbreviations first
				if (lower in SKILL_REFERENCE_ABBREVIATIONS) {
					return SKILL_REFERENCE_ABBREVIATIONS[lower];
				}
				// Check full names
				const found = SKILL_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "condition": {
				const found = CONDITION_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "creatureType": {
				const found = CREATURE_TYPE_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "damageType": {
				const found = DAMAGE_TYPE_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "areaOfEffect": {
				const found = AREA_OF_EFFECT_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "spellComponent": {
				const found = SPELL_COMPONENT_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "spellSchool": {
				// Check abbreviations first
				if (lower in SPELL_SCHOOL_REFERENCE_ABBREVIATIONS) {
					return SPELL_SCHOOL_REFERENCE_ABBREVIATIONS[lower];
				}
				// Check full names
				const found = SPELL_SCHOOL_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "otherRuleset": {
				const found = OTHER_RULESET_REFERENCES.find(
					(ref) => ref.toLowerCase() === lower,
				);
				return found || null;
			}
			case "rule":
				// Generic rule - return as-is (preserve original case)
				return name;
		}
	}

	// No category specified - try to infer from all categories
	// Check abbreviations first
	if (lower in ABILITY_REFERENCE_ABBREVIATIONS) {
		return ABILITY_REFERENCE_ABBREVIATIONS[lower];
	}
	if (lower in SKILL_REFERENCE_ABBREVIATIONS) {
		return SKILL_REFERENCE_ABBREVIATIONS[lower];
	}
	if (lower in SPELL_SCHOOL_REFERENCE_ABBREVIATIONS) {
		return SPELL_SCHOOL_REFERENCE_ABBREVIATIONS[lower];
	}

	// Check full names in order of likelihood
	const found =
		CONDITION_REFERENCES.find((ref) => ref.toLowerCase() === lower) ||
		ABILITY_REFERENCES.find((ref) => ref.toLowerCase() === lower) ||
		SKILL_REFERENCES.find((ref) => ref.toLowerCase() === lower) ||
		DAMAGE_TYPE_REFERENCES.find((ref) => ref.toLowerCase() === lower) ||
		CREATURE_TYPE_REFERENCES.find((ref) => ref.toLowerCase() === lower) ||
		SPELL_SCHOOL_REFERENCES.find((ref) => ref.toLowerCase() === lower) ||
		AREA_OF_EFFECT_REFERENCES.find((ref) => ref.toLowerCase() === lower) ||
		SPELL_COMPONENT_REFERENCES.find((ref) => ref.toLowerCase() === lower) ||
		OTHER_RULESET_REFERENCES.find((ref) => ref.toLowerCase() === lower);

	return found || name; // Return original if not found (treat as generic rule)
}

/**
 * Creates a reference enricher command in the format &Reference[...]
 *
 * Examples:
 * - &Reference[prone] - Condition reference (inferred)
 * - &Reference[condition=prone] - Condition reference (explicit)
 * - &Reference[blinded apply=false] - Condition without apply button
 * - &Reference[rule="Difficult Terrain"] - Generic rule reference
 * - &Reference[Difficult Terrain] - Generic rule reference (inferred)
 * - &Reference[strength] - Ability reference
 * - &Reference[ability=dexterity] - Ability reference (explicit)
 */
export const createReferenceEnricher = (
	options?: ReferenceEnricherOptions | string,
): string => {
	// Legacy support: if a string is passed, treat it as rule name
	if (typeof options === "string") {
		return `&Reference[${options}]`;
	}

	// If no options provided, return empty enricher
	if (!options || (!options.rule && !options.category)) {
		return `&Reference[]`;
	}

	const parts: string[] = [];

	// Handle category and rule
	if (options.category && options.rule) {
		// Explicit category format: category=rule
		const normalizedRule = normalizeReferenceName(
			options.rule,
			options.category,
		);
		if (normalizedRule) {
			// Quote if it contains spaces or special characters
			const ruleValue =
				normalizedRule.includes(" ") || normalizedRule.includes("=")
					? `"${normalizedRule}"`
					: normalizedRule;
			parts.push(`${options.category}=${ruleValue}`);
		} else {
			// Rule not found in category, but still include it
			const ruleValue =
				options.rule.includes(" ") || options.rule.includes("=")
					? `"${options.rule}"`
					: options.rule;
			parts.push(`${options.category}=${ruleValue}`);
		}
	} else if (options.rule) {
		// Just rule name (inferred category)
		const normalizedRule = normalizeReferenceName(options.rule);
		if (normalizedRule) {
			// Quote if it contains spaces or special characters
			const ruleValue =
				normalizedRule.includes(" ") || normalizedRule.includes("=")
					? `"${normalizedRule}"`
					: normalizedRule;
			parts.push(ruleValue);
		} else {
			// Not found, treat as generic rule
			const ruleValue =
				options.rule.includes(" ") || options.rule.includes("=")
					? `"${options.rule}"`
					: options.rule;
			parts.push(ruleValue);
		}
	} else if (options.category) {
		// Just category (unlikely but handle it)
		parts.push(`${options.category}=`);
	}

	// Handle apply option (only valid for conditions)
	if (options.apply !== undefined) {
		// Check if this is a condition reference
		const ruleName = options.rule;
		const isCondition =
			options.category === "condition" ||
			(!options.category &&
				ruleName &&
				CONDITION_REFERENCES.some(
					(ref) => ref.toLowerCase() === ruleName.toLowerCase(),
				));

		if (isCondition) {
			// Only add apply if it's false (true is default)
			if (options.apply === false) {
				parts.push("apply=false");
			}
		}
	}

	return `&Reference[${parts.join(" ")}]`;
};
