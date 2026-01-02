import TextAlign from "@tiptap/extension-text-align";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Toolbar from "./components/Toolbar";
import { Button } from "./components/ui/button";
import {
	Article,
	Aside,
	Figure,
	FVTTAdvice,
	FVTTNarrative,
	Image,
	RollCommand,
} from "./extensions/foundryExtensions";

function App() {
	const [htmlContent, setHtmlContent] = useState<string>("");
	const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3, 4, 5, 6],
				},
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Aside,
			Image,
			Figure,
			Article,
			FVTTAdvice,
			FVTTNarrative,
			RollCommand,
		],
		content: "<p>Start editing your Foundry VTT journal entry...</p>",
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			setHtmlContent(html);
		},
	});

	useEffect(() => {
		if (editor) {
			const html = editor.getHTML();
			setHtmlContent(html);
		}
	}, [editor]);

	if (!editor) {
		return null;
	}

	return (
		<div className="flex flex-col h-screen">
			<header className="bg-[#2c3e50] text-white p-4 shadow-md flex justify-between items-center">
				<h1 className="text-2xl font-semibold">
					Foundry VTT D&D 5e HTML Editor
				</h1>
				<Button
					onClick={() => setIsPreviewOpen(!isPreviewOpen)}
					className="bg-blue-600 hover:bg-blue-700 text-white"
				>
					{isPreviewOpen ? "Close Preview" : "Open Preview"}
				</Button>
			</header>
			<Toolbar editor={editor} htmlContent={htmlContent} />
			<div className="flex flex-1 overflow-hidden flex-col md:flex-row">
				<div
					className={`flex-1 flex flex-col ${isPreviewOpen ? "border-r border-border" : ""} overflow-hidden`}
				>
					<Editor editor={editor} />
				</div>
				{isPreviewOpen && (
					<div className="flex-1 flex flex-col overflow-hidden bg-muted">
						<Preview htmlContent={htmlContent} />
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
