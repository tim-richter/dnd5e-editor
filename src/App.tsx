import { useState } from "react";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import { Button } from "./components/ui/button";

function App() {
	const [htmlContent, setHtmlContent] = useState<string>("");
	const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

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
			<div className="flex flex-1 overflow-hidden flex-col md:flex-row">
				<div
					className={`flex-1 flex flex-col ${isPreviewOpen ? "border-r border-border" : ""} overflow-hidden`}
				>
					<Editor onUpdate={setHtmlContent} />
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
