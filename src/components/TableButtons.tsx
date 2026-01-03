import type { Editor } from "@tiptap/react";
import {
	ChevronDown,
	Columns,
	Minus,
	Plus,
	Rows,
	Table,
	Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface TableButtonsProps {
	editor: Editor;
}

export default function TableButtons({ editor }: TableButtonsProps) {
	const isInTable = editor.isActive("table");

	return (
		<div className="flex gap-0.5 border-r border-border pr-2 mr-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" title="Table">
						<Table className="size-4" />
						<ChevronDown className="size-4 ml-1" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start">
					<DropdownMenuItem
						onSelect={() => {
							editor
								.chain()
								.focus()
								.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
								.run();
						}}
					>
						<Table className="size-4 mr-2" />
						Insert Table
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onSelect={() => editor.chain().focus().addColumnBefore().run()}
						disabled={!isInTable || !editor.can().addColumnBefore()}
					>
						<Columns className="size-4 mr-2" />
						<Plus className="size-3 mr-1" />
						Add Column Before
					</DropdownMenuItem>

					<DropdownMenuItem
						onSelect={() => editor.chain().focus().addColumnAfter().run()}
						disabled={!isInTable || !editor.can().addColumnAfter()}
					>
						<Plus className="size-3 mr-1" />
						<Columns className="size-4 mr-2" />
						Add Column After
					</DropdownMenuItem>

					<DropdownMenuItem
						onSelect={() => editor.chain().focus().deleteColumn().run()}
						disabled={!isInTable || !editor.can().deleteColumn()}
					>
						<Columns className="size-4 mr-2" />
						<Minus className="size-3 mr-1" />
						Delete Column
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onSelect={() => editor.chain().focus().addRowBefore().run()}
						disabled={!isInTable || !editor.can().addRowBefore()}
					>
						<Rows className="size-4 mr-2" />
						<Plus className="size-3 mr-1" />
						Add Row Before
					</DropdownMenuItem>

					<DropdownMenuItem
						onSelect={() => editor.chain().focus().addRowAfter().run()}
						disabled={!isInTable || !editor.can().addRowAfter()}
					>
						<Plus className="size-3 mr-1" />
						<Rows className="size-4 mr-2" />
						Add Row After
					</DropdownMenuItem>

					<DropdownMenuItem
						onSelect={() => editor.chain().focus().deleteRow().run()}
						disabled={!isInTable || !editor.can().deleteRow()}
					>
						<Rows className="size-4 mr-2" />
						<Minus className="size-3 mr-1" />
						Delete Row
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onSelect={() => editor.chain().focus().deleteTable().run()}
						disabled={!isInTable || !editor.can().deleteTable()}
						variant="destructive"
					>
						<Trash2 className="size-4 mr-2" />
						Delete Table
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

