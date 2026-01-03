import type { Root, Text } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { normalizeSkill } from "../../dnd/skills/skills";

/**
 * Checks if a node is a text node.
 */
function isText(node: unknown): node is Text {
	return (
		typeof node === "object" &&
		node !== null &&
		"type" in node &&
		node.type === "text"
	);
}

/**
 * Rehype plugin to convert DC check syntax to Foundry enricher syntax.
 * Converts "DC 10 Wisdom (Perception)" to "[[/skill perception dc=10]]"
 */
export function enhancers(): Plugin<[], Root> {
	// Matches "DC <number> <Ability> (<Skill>)"
	// Example: "DC 10 Wisdom (Perception)" or "DC 15 Dex (Acrobatics)"
	// Handles multiple spaces and various ability/skill name formats
	// Ability is typically a single word, skill can be multiple words
	const dcCheckPattern = /DC\s+(\d+)\s+([A-Za-z]+)\s+\(([^)]+)\)/gi;

	return () => (tree: Root) => {
		visit(tree, "text", (node: Text) => {
			if (!node.value) return;

			// Find all DC check matches
			const matches = Array.from(node.value.matchAll(dcCheckPattern));
			if (matches.length === 0) return;

			// Process matches in reverse order to maintain indices
			let updatedValue = node.value;
			for (let i = matches.length - 1; i >= 0; i--) {
				const match = matches[i];
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
