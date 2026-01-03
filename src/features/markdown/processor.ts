import { remarkWikiLink } from "@flowershow/remark-wiki-link";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { obsidianCalloutsToAside } from "./plugins/callouts";
import { enhancers } from "./plugins/enhancers";
import { removeByClass } from "./plugins/remove-by-class";
import { removeEmptyParagraphs } from "./plugins/remove-empty";
import { removeImages } from "./plugins/remove-images";

/**
 * Processes markdown to HTML using remark/rehype
 */
export async function processMarkdownToHtml(
	markdown: string,
	algorithm: "default" | "obsidian" = "default",
): Promise<string> {
	const processed = markdown.trim();

	const processor = unified()
		.use(remarkParse)
		.use(remarkWikiLink)
		.use(remarkRehype, { allowDangerousHtml: true });

	if (algorithm === "obsidian") {
		processor.use(obsidianCalloutsToAside());
	}

	processor.use(rehypeRaw);
	processor.use(enhancers());

	if (algorithm === "default") {
		processor.use(removeByClass(["credit"]));
	}
	processor.use(removeImages());
	processor.use(removeEmptyParagraphs());
	processor.use(rehypeStringify, { allowDangerousHtml: true });

	const result = await processor.process(processed);
	return String(result);
}
