import type { Element as HastElement, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to remove images from markdown.
 */
export function removeImages(): Plugin<[], Root> {
	return () => (tree: Root) => {
		visit(tree, "element", (node: HastElement, index, parent) => {
			if (!parent || index === undefined) return;
			if (node.tagName !== "img") return;

			parent.children.splice(index, 1);
		});
	};
}
