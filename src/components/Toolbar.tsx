import type { Editor } from "@tiptap/react";
import { useState } from "react";
import { parseRollCommand } from "../utils/rollCommandParser";
import AsideButtons from "./AsideButtons";
import ImportModal from "./ImportModal";
import RollCommandButtons from "./RollCommandButtons";
import { Button } from "./ui/button";

interface ToolbarProps {
	editor: Editor;
}

export default function Toolbar({ editor }: ToolbarProps) {
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);

	const handleImport = (html: string) => {
		// Process HTML to convert plain text roll commands to proper span elements
		const processedHtml = processHtmlForRollCommands(html);
		editor.commands.setContent(processedHtml);
	};

	/**
	 * Processes HTML to detect and convert plain text roll commands to proper span elements
	 */
	function processHtmlForRollCommands(html: string): string {
		// Match roll command patterns: [[/check ...]], [[/skill ...]], [[/tool ...]], [[/attack ...]]
		// This regex matches the full command including the brackets
		const rollCommandRegex = /\[\[\/(check|skill|tool|attack)([^\]]*)\]\]/g;

		return html.replace(rollCommandRegex, (match) => {
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
							📥 Import
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
							H1
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
							H2
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
							H3
						</Button>
					</div>

					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant={editor.isActive("bold") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleBold().run()}
							title="Bold"
						>
							<strong>B</strong>
						</Button>
						<Button
							variant={editor.isActive("italic") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleItalic().run()}
							title="Italic"
						>
							<em>I</em>
						</Button>
						<Button
							variant={editor.isActive("underline") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleUnderline().run()}
							title="Underline"
						>
							<u>U</u>
						</Button>
					</div>

					<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
						<Button
							variant={editor.isActive("bulletList") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleBulletList().run()}
							title="Bullet List"
						>
							•
						</Button>
						<Button
							variant={editor.isActive("orderedList") ? "default" : "ghost"}
							size="sm"
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
							title="Numbered List"
						>
							1.
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
							🔗
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
							⬅
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
							⬌
						</Button>
						<Button
							variant={
								editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
							}
							size="sm"
							onClick={() => editor.chain().focus().setTextAlign("right").run()}
							title="Align Right"
						>
							➡
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
							↶
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().redo().run()}
							disabled={!editor.can().redo()}
							title="Redo"
						>
							↷
						</Button>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="w-px h-6 bg-border mx-2"></div>
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
						Foundry
					</span>
					<AsideButtons editor={editor} />
				</div>

				<div className="flex items-center gap-2">
					<div className="w-px h-6 bg-border mx-2"></div>
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
						D&D 5e
					</span>
					<RollCommandButtons editor={editor} />
				</div>
			</div>
			<ImportModal
				isOpen={isImportModalOpen}
				onClose={() => setIsImportModalOpen(false)}
				onImport={handleImport}
			/>
		</>
	);
}
