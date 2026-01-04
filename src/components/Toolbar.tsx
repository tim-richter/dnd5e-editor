import type { Editor } from "@tiptap/react";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Copy,
	Download,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Italic,
	Link,
	List,
	ListOrdered,
	Redo,
	Underline,
	Undo,
} from "lucide-react";
import { useState } from "react";
import { parseRollCommand } from "@/features/dnd/rolls/parser";
import AsideButtons from "./AsideButtons";
import ImportModal from "./ImportModal";
import MarkdownModal from "./MarkdownModal";
import RollCommandButtons from "./RollCommandButtons";
import TableButtons from "./TableButtons";
import { Button } from "./ui/button";

interface ToolbarProps {
	editor: Editor;
	htmlContent?: string;
}

export default function Toolbar({ editor, htmlContent = "" }: ToolbarProps) {
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleImport = (html: string) => {
		// Process HTML to convert plain text roll commands to proper span elements
		const processedHtml = processHtmlForRollCommands(html);
		editor.commands.setContent(processedHtml);
	};

	const handleCopy = async () => {
		try {
			// Strip spans from roll commands, keeping only the command syntax
			let cleanedHtml = htmlContent;

			// Helper function to unescape HTML entities from attribute values
			const unescapeHtml = (str: string): string => {
				return str
					.replace(/&amp;/g, "&")
					.replace(/&quot;/g, '"')
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">");
			};

			// Replace roll command spans with just the command text
			cleanedHtml = cleanedHtml.replace(
				/<span[^>]*data-command="([^"]*)"[^>]*class="roll-command"[^>]*>([^<]*)<\/span>/g,
				(_match, command) => {
					return unescapeHtml(command);
				},
			);

			cleanedHtml = cleanedHtml.replace(
				/<span[^>]*class="roll-command"[^>]*data-command="([^"]*)"[^>]*>([^<]*)<\/span>/g,
				(_match, command) => {
					return unescapeHtml(command);
				},
			);

			cleanedHtml = cleanedHtml.replace(
				/<span[^>]*data-command="([^"]*)"[^>]*>([^<]*)<\/span>/g,
				(match, command) => {
					const unescaped = unescapeHtml(command);
					// Handle roll commands: [[/check ...]], [[/skill ...]], [[/roll ...]], etc.
					if (
						unescaped.match(
							/\[\[\/(check|skill|tool|attack|damage|heal|item|save|concentration|roll|publicroll|pr|gmroll|gmr|blindroll|broll|br|selfroll|sr)/,
						) ||
						// Also handle immediate inline rolls: [[1d4]], [[2d6 + 1]], etc.
						(unescaped.match(/^\[\[([^/][^\]]*)\]\]/) &&
							(/d\d+/.test(unescaped) ||
								/^\d+$/.test(
									unescaped.match(/^\[\[([^\]]+)\]\]/)?.[1]?.trim() || "",
								)))
					) {
						return unescaped;
					}
					// Handle reference enrichers: &Reference[...]
					if (unescaped.match(/&Reference\[/)) {
						return unescaped;
					}
					return match;
				},
			);

			await navigator.clipboard.writeText(cleanedHtml);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
			alert("Failed to copy to clipboard");
		}
	};

	/**
	 * Processes HTML to detect and convert plain text roll commands to proper span elements
	 */
	function processHtmlForRollCommands(html: string): string {
		// First, handle reference enrichers: &Reference[...]
		html = html.replace(/&Reference\[([^\]]*)\]/g, (match) => {
			// Parse the command to validate it
			const parsed = parseRollCommand(match);
			if (!parsed) {
				// If parsing fails, return the original match
				return match;
			}

			// Escape the command for HTML attribute (only quotes and ampersands)
			const escapedForAttr = match
				.replace(/&/g, "&amp;")
				.replace(/"/g, "&quot;");
			// Escape the command for HTML text content
			const escapedForText = match
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");
			return `<span class="roll-command" data-command="${escapedForAttr}">${escapedForText}</span>`;
		});

		// Helper function to convert a roll command match to a span element
		const convertToSpan = (match: string): string => {
			// Parse the command to validate it
			const parsed = parseRollCommand(match);
			if (!parsed) {
				// If parsing fails, return the original match
				return match;
			}

			// Escape the command for HTML attribute (only quotes and ampersands)
			const escapedForAttr = match
				.replace(/&/g, "&amp;")
				.replace(/"/g, "&quot;");
			// Escape the command for HTML text content
			const escapedForText = match
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");
			return `<span class="roll-command" data-command="${escapedForAttr}">${escapedForText}</span>`;
		};

		// First, handle deferred roll command patterns: [[/check ...]], [[/skill ...]], [[/roll ...]], etc.
		// This regex matches the full command including the brackets
		// Includes basic roll commands: roll, publicroll/pr, gmroll/gmr, blindroll/broll/br, selfroll/sr
		const rollCommandRegex =
			/\[\[\/(check|skill|tool|attack|damage|heal|item|save|concentration|roll|publicroll|pr|gmroll|gmr|blindroll|broll|br|selfroll|sr)([^\]]*)\]\]/g;

		html = html.replace(rollCommandRegex, convertToSpan);

		// Then, handle immediate inline rolls: [[formula]] (where formula is dice notation)
		// This pattern matches [[1d4]], [[2d6 + 1]], etc. but not [[/roll ...]] (already handled above)
		// Must come after deferred rolls to avoid double-matching
		const immediateInlineRollRegex = /\[\[([^/][^\]]*)\]\](?:\{([^}]+)\})?/g;

		return html.replace(immediateInlineRollRegex, (match, formula) => {
			// Only treat as immediate inline roll if it looks like a dice formula
			// (contains 'd' followed by digits, or is a simple number)
			if (!/d\d+/.test(formula) && !/^\d+$/.test(formula.trim())) {
				return match; // Not a dice formula, return as-is
			}

			// Check if this match is already inside a span (already processed)
			// by checking if we're inside a roll-command span
			const matchIndex = html.indexOf(match);
			if (matchIndex === -1) {
				return match; // Match not found (shouldn't happen, but safety check)
			}

			const beforeMatch = html.substring(0, matchIndex);
			const lastSpanOpen = beforeMatch.lastIndexOf(
				'<span class="roll-command"',
			);
			const lastSpanClose = beforeMatch.lastIndexOf("</span>");
			if (lastSpanOpen > lastSpanClose) {
				return match; // Already inside a roll-command span, skip
			}

			return convertToSpan(match);
		});
	}

	return (
		<>
			<div className="bg-muted border-b border-border p-2 flex flex-wrap gap-2 items-center">
				<div className="flex items-center gap-2">
					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsImportModalOpen(true)}
							title="Import HTML"
						>
							<Download className="size-4 mr-1" />
							Import HTML
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsMarkdownModalOpen(true)}
							title="Import Markdown"
						>
							<Download className="size-4 mr-1" />
							Import Markdown
						</Button>
					</div>
					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant={
								editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 1 }).run()
							}
							title="Heading 1"
						>
							<Heading1 className="size-4" />
						</Button>
						<Button
							variant={
								editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 2 }).run()
							}
							title="Heading 2"
						>
							<Heading2 className="size-4" />
						</Button>
						<Button
							variant={
								editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 3 }).run()
							}
							title="Heading 3"
						>
							<Heading3 className="size-4" />
						</Button>
						<Button
							variant={
								editor.isActive("heading", { level: 4 }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 4 }).run()
							}
							title="Heading 4"
						>
							<Heading4 className="size-4" />
						</Button>
						<Button
							variant={
								editor.isActive("heading", { level: 5 }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 5 }).run()
							}
							title="Heading 5"
						>
							<Heading5 className="size-4" />
						</Button>
					</div>

					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant={editor.isActive("bold") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleBold().run()}
							title="Bold"
						>
							<Bold className="size-4" />
						</Button>
						<Button
							variant={editor.isActive("italic") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleItalic().run()}
							title="Italic"
						>
							<Italic className="size-4" />
						</Button>
						<Button
							variant={editor.isActive("underline") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleUnderline().run()}
							title="Underline"
						>
							<Underline className="size-4" />
						</Button>
					</div>

					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant={editor.isActive("bulletList") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleBulletList().run()}
							title="Bullet List"
						>
							<List className="size-4" />
						</Button>
						<Button
							variant={editor.isActive("orderedList") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
							title="Numbered List"
						>
							<ListOrdered className="size-4" />
						</Button>
					</div>

					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant={editor.isActive("link") ? "default" : "ghost"}
							size="sm"
							onClick={() => {
								const url = window.prompt("Enter URL:");
								if (url) {
									editor.chain().focus().setLink({ href: url }).run();
								}
							}}
							title="Insert Link"
						>
							<Link className="size-4" />
						</Button>
					</div>

					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant={
								editor.isActive({ textAlign: "left" }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() => editor.chain().focus().setTextAlign("left").run()}
							title="Align Left"
						>
							<AlignLeft className="size-4" />
						</Button>
						<Button
							variant={
								editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() =>
								editor.chain().focus().setTextAlign("center").run()
							}
							title="Align Center"
						>
							<AlignCenter className="size-4" />
						</Button>
						<Button
							variant={
								editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() => editor.chain().focus().setTextAlign("right").run()}
							title="Align Right"
						>
							<AlignRight className="size-4" />
						</Button>
					</div>

					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().undo().run()}
							disabled={!editor.can().undo()}
							title="Undo"
						>
							<Undo className="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().redo().run()}
							disabled={!editor.can().redo()}
							title="Redo"
						>
							<Redo className="size-4" />
						</Button>
					</div>
				</div>

				<TableButtons editor={editor} />

				<AsideButtons editor={editor} />

				<RollCommandButtons editor={editor} />

				<Button
					variant="ghost"
					size="sm"
					onClick={handleCopy}
					className="bg-green-600 hover:bg-green-700 text-white"
					title="Copy HTML"
				>
					<Copy className="size-4 mr-1" />
					{copied ? "Copied!" : "Copy HTML"}
				</Button>
			</div>
			<ImportModal
				isOpen={isImportModalOpen}
				onClose={() => setIsImportModalOpen(false)}
				onImport={handleImport}
			/>
			<MarkdownModal
				isOpen={isMarkdownModalOpen}
				onClose={() => setIsMarkdownModalOpen(false)}
				onImport={handleImport}
			/>
		</>
	);
}
