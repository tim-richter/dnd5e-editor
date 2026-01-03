import type { Element, ElementContent, Root, Text } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Checks if a node is a text node.
 */
function isText(node: ElementContent): node is Text {
	return node?.type === "text";
}

/**
 * Checks if a node is an element.
 */
function isElement(node: ElementContent): node is Element {
	return node?.type === "element";
}

/**
 * Recursively finds the first text node in an element tree.
 */
function findFirstTextNode(element: Element): Text | null {
	for (const child of element.children) {
		if (isText(child)) {
			return child;
		}
		if (isElement(child)) {
			const found = findFirstTextNode(child);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Gets all text content from an element recursively.
 */
function getAllTextContent(element: Element): string {
	let text = "";
	for (const child of element.children) {
		if (isText(child)) {
			text += child.value;
		} else if (isElement(child)) {
			text += getAllTextContent(child);
		}
	}
	return text;
}

/**
 * Removes empty lines from children of an element.
 */
function filterEmptyLines(element: Element): void {
	for (let childIndex = 0; childIndex < element.children.length; childIndex++) {
		const child = element.children[childIndex];

		if (isText(child)) {
			if (child.value.trim() === "") {
				// remove the child
				element.children.splice(childIndex, 1);
			}
		} else if (isElement(child)) {
			filterEmptyLines(child);
		}
	}
}

/**
 * Rehype plugin to convert Obsidian callouts to aside elements.
 */
export function obsidianCalloutsToAside(): Plugin<[], Root> {
	// Matches [!type] or [!type]+ or [!type]- at the start
	const calloutPrefix = /^\[!([^\]]+)\]([+-])?\s*/i;

	return () => (tree: Root) => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName !== "blockquote") return;
			if (!node.children || node.children.length === 0) return;

			filterEmptyLines(node);

			const firstChild = node.children[0];
			if (!isElement(firstChild) || firstChild.tagName !== "p") return;

			// Get all text content from the first paragraph to check for callout
			const paragraphText = getAllTextContent(firstChild);
			const trimmedParagraphText = paragraphText.trim();

			// Check if the trimmed paragraph text starts with a callout marker
			const match = trimmedParagraphText.match(calloutPrefix);
			if (!match) return;

			// Find the first text node to modify
			const firstText = findFirstTextNode(firstChild);

			// Remove the callout marker from the first text node if it exists
			if (firstText) {
				const originalText = firstText.value;
				// Try to remove the callout prefix from the text node
				let updatedText = originalText.replace(calloutPrefix, "");

				// If that didn't work (maybe due to whitespace), try trimming first
				if (
					updatedText === originalText &&
					originalText.trimStart().match(calloutPrefix)
				) {
					const trimmed = originalText.trimStart();
					updatedText = trimmed.replace(calloutPrefix, "");
					// Preserve any leading whitespace that was there
					const leadingWhitespace = originalText.match(/^\s*/)?.[0] || "";
					updatedText = leadingWhitespace + updatedText;
				}

				// Update the text node
				firstText.value = updatedText;

				// If the text node is now empty and it's the only child, we might want to handle it
				// But for now, we'll leave empty text nodes (they'll be cleaned up by other plugins)
			}

			// Check if the entire paragraph would be empty after removing the callout
			const remainingParagraphText = trimmedParagraphText
				.replace(calloutPrefix, "")
				.trim();

			// If the paragraph is now empty (only had the callout marker), remove it
			if (remainingParagraphText === "") {
				node.children.shift();
			}

			// Transform <blockquote> into <aside class="fvtt narrative">
			node.tagName = "aside";
			node.properties ??= {};

			const existing = node.properties.className;
			const classes = Array.isArray(existing)
				? existing.map(String)
				: existing
					? [String(existing)]
					: [];

			const wanted = ["fvtt", "narrative"];
			const classSet = new Set([...classes, ...wanted]);

			node.properties.className = Array.from(classSet);

			// optional: keep callout type too (uncomment if you want it)
			// const calloutType = match[1].toLowerCase();
			// classSet.add(`callout-${calloutType}`);
			// node.properties.className = Array.from(classSet);
		});
	};
}
