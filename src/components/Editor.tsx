import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useEffect } from "react";

interface EditorProps {
	editor: Editor;
}

export default function Editor({ editor }: EditorProps) {

	// Add click handler for roll commands
	useEffect(() => {
		if (!editor) return;

		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const rollCommandElement = target.closest(".roll-command");

			if (rollCommandElement) {
				const command = rollCommandElement.getAttribute("data-command");
				if (!command) return;

				// Find the position of the node in the editor
				const { view } = editor;
				const { state } = view;

				// Get the DOM position
				const domPos = view.posAtDOM(rollCommandElement, 0);
				if (domPos === null || domPos < 0) return;

				const $pos = state.doc.resolve(domPos);

				// Find the rollCommand node
				let nodePos = domPos;
				let node = $pos.nodeAfter;

				if (!node || node.type.name !== "rollCommand") {
					node = $pos.nodeBefore;
					if (node && node.type.name === "rollCommand") {
						nodePos = $pos.pos - node.nodeSize;
					}
				}

				if (!node || node.type.name !== "rollCommand") {
					// Check parent nodes
					for (let i = $pos.depth; i > 0; i--) {
						const parent = $pos.node(i);
						if (parent.type.name === "rollCommand") {
							node = parent;
							nodePos = $pos.start(i);
							break;
						}
					}
				}

				if (node && node.type.name === "rollCommand") {
					// Dispatch custom event
					const customEvent = new CustomEvent("rollCommandClick", {
						detail: {
							command,
							position: nodePos,
							node,
						},
					});
					window.dispatchEvent(customEvent);

					event.preventDefault();
					event.stopPropagation();
				}
			}
		};

		const editorElement = editor.view.dom;
		editorElement.addEventListener("click", handleClick);

		return () => {
			editorElement.removeEventListener("click", handleClick);
		};
	}, [editor]);

	if (!editor) {
		return null;
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="flex-1 overflow-y-auto bg-background">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}
