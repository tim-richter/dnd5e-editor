import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to remove HTML elements based on CSS classes.
 */
export function removeByClass(classNames: string[]): Plugin<[], Root> {
	const classSet = new Set(classNames);

	return () => (tree: Root) => {
		visit(tree, "element", (node: Element, index, parent) => {
			if (!parent || index === undefined) return;

			const className = node.properties?.className;
			if (!className) return;

			const classes = Array.isArray(className)
				? className
				: [String(className)];

			if (!classes.some((c) => classSet.has(String(c)))) return;

			parent.children.splice(index, 1);
		});
	};
}
