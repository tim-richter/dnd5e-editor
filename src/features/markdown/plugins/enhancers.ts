import type { Root, Text } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { normalizeAbility } from "../../dnd/abilities/abilities";
import { normalizeSkill } from "../../dnd/skills/skills";

/**
 * Rehype plugin to convert DC check and saving throw syntax to Foundry enricher syntax.
 * Converts:
 * - "passive Wisdom (Perception) score of 16 or higher" to "[[/skill skill=perception passive=true format=long dc=16]]"
 * - "DC 10 Wisdom (Perception)" to "[[/skill perception dc=10]]"
 * - "DC 10 Dexterity saving throw" to "[[/save dexterity dc=10]]"
 */
export function enhancers(): Plugin<[], Root> {
	// Matches "passive <Ability> (<Skill>) score of <number> or higher"
	// Example: "passive Wisdom (Perception) score of 16 or higher"
	// Example: "passive Intelligence (Investigation) score of 15 or higher"
	// Example: "passive Wisdom (Insight) score of 14 or higher"
	const passiveCheckPattern = /passive\s+([A-Za-z]+)\s+\(([^)]+)\)\s+score\s+of\s+(\d+)\s+or\s+higher/gi;

	// Matches "DC <number> <Ability> (<Skill>)"
	// Example: "DC 10 Wisdom (Perception)" or "DC 15 Dex (Acrobatics)"
	const dcCheckPattern = /DC\s+(\d+)\s+([A-Za-z]+)\s+\(([^)]+)\)/gi;

	// Matches "DC <number> <Ability> saving throw"
	// Example: "DC 10 Dexterity saving throw" or "DC 15 Dex saving throw"
	const savingThrowPattern = /DC\s+(\d+)\s+([A-Za-z]+)\s+saving\s+throw/gi;

	return () => (tree: Root) => {
		visit(tree, "text", (node: Text) => {
			if (!node.value) return;

			let updatedValue = node.value;

			// Process passive checks first (they're the most specific)
			const passiveMatches = Array.from(updatedValue.matchAll(passiveCheckPattern));
			for (let i = passiveMatches.length - 1; i >= 0; i--) {
				const match = passiveMatches[i];
				if (!match || match.index === undefined) continue;

				const skill = match[2].trim();
				const dc = match[3];

				// Normalize skill name
				const normalizedSkill = normalizeSkill(skill);

				// Create Foundry enricher syntax for passive check
				// Use format=long as requested and passive=true
				const foundrySyntax = `[[/skill skill=${normalizedSkill} passive=true format=long dc=${dc}]]`;

				// Replace the matched text with Foundry syntax
				const before = updatedValue.substring(0, match.index);
				const after = updatedValue.substring(match.index + match[0].length);
				updatedValue = before + foundrySyntax + after;
			}

			// Process saving throws next (they're more specific than DC checks)
			const saveMatches = Array.from(updatedValue.matchAll(savingThrowPattern));
			for (let i = saveMatches.length - 1; i >= 0; i--) {
				const match = saveMatches[i];
				if (!match || match.index === undefined) continue;

				const dc = match[1];
				const ability = match[2].trim();

				// Normalize ability name
				const normalizedAbility = normalizeAbility(ability);

				// Create Foundry enricher syntax for saving throw
				const foundrySyntax = `[[/save ${normalizedAbility} dc=${dc}]]`;

				// Replace the matched text with Foundry syntax
				const before = updatedValue.substring(0, match.index);
				const after = updatedValue.substring(match.index + match[0].length);
				updatedValue = before + foundrySyntax + after;
			}

			// Process DC checks (skill checks)
			const checkMatches = Array.from(updatedValue.matchAll(dcCheckPattern));
			for (let i = checkMatches.length - 1; i >= 0; i--) {
				const match = checkMatches[i];
				if (!match || match.index === undefined) continue;

				const dc = match[1];
				const skill = match[3].trim();

				// Normalize skill name (ability is not needed for /skill format)
				const normalizedSkill = normalizeSkill(skill);

				// Create Foundry enricher syntax
				// Use /skill format when skill is specified, as it's simpler
				const foundrySyntax = `[[/skill ${normalizedSkill} dc=${dc}]]`;

				// Replace the matched text with Foundry syntax
				const before = updatedValue.substring(0, match.index);
				const after = updatedValue.substring(match.index + match[0].length);
				updatedValue = before + foundrySyntax + after;
			}

			node.value = updatedValue;
		});
	};
}
