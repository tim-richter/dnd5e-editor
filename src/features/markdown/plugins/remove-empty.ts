import type { Element, Root, Text } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Checks if a node is ignorable.
 */
function isIgnorable(node: Text | Element) {
	if (node.type === "text") {
		return (node as Text).value.trim() === "";
	}

	if (node.type === "element") {
		return node.tagName === "br";
	}

	return false;
}

/**
 * Checks if a node is an empty paragraph.
 */
function isEmptyParagraph(node: Element) {
	if (node.tagName !== "p") return false;
	if (!node.children || node.children.length === 0) return true;

	return node.children.every((child) => isIgnorable(child as Text | Element));
}

/**
 * Rehype plugin to remove empty paragraphs from markdown.
 */
export function removeEmptyParagraphs(): Plugin<[], Root> {
	return () => (tree: Root) => {
		visit(tree, "element", (node, index, parent) => {
			if (!parent || index === undefined) return;
			if (!isEmptyParagraph(node)) return;

			parent.children.splice(index, 1);
		});
	};
}
