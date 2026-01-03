import { useState } from "react";
import { processMarkdownToHtml } from "@/features/markdown/processor";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface MarkdownModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (html: string) => void;
}

type ParsingAlgorithm = "default" | "obsidian";

export default function MarkdownModal({
	isOpen,
	onClose,
	onImport,
}: MarkdownModalProps) {
	const [markdownContent, setMarkdownContent] = useState("");
	const [parsingAlgorithm, setParsingAlgorithm] =
		useState<ParsingAlgorithm>("default");

	const handleImport = async () => {
		if (markdownContent.trim()) {
			try {
				// Process markdown to HTML using remark
				const html = await processMarkdownToHtml(
					markdownContent.trim(),
					parsingAlgorithm,
				);
				onImport(html);
				setMarkdownContent("");
				onClose();
			} catch (error) {
				console.error("Failed to parse markdown:", error);
				alert("Failed to parse markdown. Please check your input.");
			}
		}
	};

	const handleClose = () => {
		setMarkdownContent("");
		setParsingAlgorithm("default");
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Import Markdown</DialogTitle>
					<DialogDescription>
						Paste your Markdown content below. It will be converted to HTML and
						imported into the editor.
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center gap-2 pb-2">
					<label htmlFor="parsing-algorithm" className="text-sm font-medium">
						Parsing Algorithm:
					</label>
					<Select
						value={parsingAlgorithm}
						onValueChange={(value) =>
							setParsingAlgorithm(value as ParsingAlgorithm)
						}
					>
						<SelectTrigger id="parsing-algorithm" className="w-[150px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="default">Default</SelectItem>
							<SelectItem value="obsidian">Obsidian</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex-1 overflow-hidden flex flex-col">
					<Textarea
						className="flex-1 min-h-[200px] font-mono text-sm resize-y"
						value={markdownContent}
						onChange={(e) => setMarkdownContent(e.target.value)}
						placeholder="Paste Markdown here..."
						autoFocus
					/>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleImport} disabled={!markdownContent.trim()}>
						Import Markdown
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
