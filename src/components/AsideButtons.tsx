import type { Editor } from "@tiptap/react";
import { BookOpen, MessageSquare, Star } from "lucide-react";
import { Button } from "./ui/button";

interface AsideButtonsProps {
	editor: Editor;
}

type BlockType = "advice" | "narrative" | "notable";

const blockTypes: {
	type: BlockType;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ type: "advice", label: "Advice/Quest", icon: MessageSquare },
	{ type: "narrative", label: "Narrative", icon: BookOpen },
	{ type: "notable", label: "Notable", icon: Star },
];

export default function AsideButtons({ editor }: AsideButtonsProps) {
	const insertBlock = (type: BlockType) => {
		switch (type) {
			case "advice":
				editor
					.chain()
					.focus()
					.insertContent(
						`<div class="fvtt advice"><figure class="icon"><img src="icons/equipment/chest/robe-layered-red.webp" class="round"></figure><article><h4></h4><p></p></article></div>`,
					)
					.run();
				break;
			case "narrative":
				editor
					.chain()
					.focus()
					.insertContent(`<aside class="fvtt narrative"><p></p></aside>`)
					.run();
				break;
			case "notable":
				editor
					.chain()
					.focus()
					.insertContent({
						type: "aside",
						attrs: { class: "notable" },
						content: [
							{
								type: "heading",
								attrs: { level: 4 },
								content: [],
							},
							{
								type: "paragraph",
								content: [],
							},
						],
					})
					.run();
				break;
		}
	};

	return (
		<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
			{blockTypes.map(({ type, label, icon: Icon }) => (
				<Button
					key={type}
					variant="ghost"
					size="sm"
					onClick={() => insertBlock(type)}
					title={`Insert ${label} Block`}
				>
					<Icon className="size-4" />
				</Button>
			))}
		</div>
	);
}
