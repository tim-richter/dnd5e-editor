import { useState } from "react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface ImportModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (html: string) => void;
}

export default function ImportModal({
	isOpen,
	onClose,
	onImport,
}: ImportModalProps) {
	const [htmlContent, setHtmlContent] = useState("");

	const handleImport = () => {
		if (htmlContent.trim()) {
			onImport(htmlContent.trim());
			setHtmlContent("");
			onClose();
		}
	};

	const handleClose = () => {
		setHtmlContent("");
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Import HTML</DialogTitle>
					<DialogDescription>
						Paste your HTML content below. The HTML will be imported into the
						editor and you can edit it normally.
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 overflow-hidden flex flex-col">
					<Textarea
						className="flex-1 min-h-[200px] font-mono text-sm resize-y"
						value={htmlContent}
						onChange={(e) => setHtmlContent(e.target.value)}
						placeholder="Paste HTML here..."
						autoFocus
					/>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleImport} disabled={!htmlContent.trim()}>
						Import
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
