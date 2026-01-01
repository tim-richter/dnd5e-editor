import { mergeAttributes, Node } from "@tiptap/core";

// Aside extension for Foundry VTT aside elements
export const Aside = Node.create({
	name: "aside",
	group: "block",
	content: "block+",
	defining: true,

	addAttributes() {
		return {
			class: {
				default: "note",
				parseHTML: (element) => element.getAttribute("class"),
				renderHTML: (attributes) => {
					return {
						class: attributes.class,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "aside",
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["aside", mergeAttributes(HTMLAttributes), 0];
	},

	addCommands() {
		return {
			setAside:
				(attributes: { class: string }) =>
				({ commands }) => {
					return commands.wrapIn(this.name, attributes);
				},
			toggleAside:
				(attributes: { class: string }) =>
				({ commands }) => {
					return commands.toggleWrap(this.name, attributes);
				},
			unsetAside:
				() =>
				({ commands }) => {
					return commands.lift(this.name);
				},
		};
	},
});

// Simple Image node for figure elements
export const Image = Node.create({
	name: "image",
	group: "block",
	atom: true,
	addAttributes() {
		return {
			src: {
				default: "",
				parseHTML: (element) => element.getAttribute("src"),
				renderHTML: (attributes) => ({
					src: attributes.src,
				}),
			},
			class: {
				default: "",
				parseHTML: (element) => element.getAttribute("class"),
				renderHTML: (attributes) => {
					if (!attributes.class) return {};
					return { class: attributes.class };
				},
			},
		};
	},
	parseHTML() {
		return [{ tag: "img" }];
	},
	renderHTML({ HTMLAttributes }) {
		return ["img", mergeAttributes(HTMLAttributes)];
	},
});

// Figure extension for advice/quest blocks
export const Figure = Node.create({
	name: "figure",
	group: "block",
	content: "(block | image)+",
	parseHTML() {
		return [{ tag: "figure" }];
	},
	renderHTML({ HTMLAttributes }) {
		return ["figure", mergeAttributes(HTMLAttributes), 0];
	},
});

// Article extension for advice/quest blocks
export const Article = Node.create({
	name: "article",
	group: "block",
	content: "block+",
	parseHTML() {
		return [{ tag: "article" }];
	},
	renderHTML({ HTMLAttributes }) {
		return ["article", mergeAttributes(HTMLAttributes), 0];
	},
});

// FVTT Advice/Quest block extension
export const FVTTAdvice = Node.create({
	name: "fvttAdvice",
	group: "block",
	content: "(figure | article)+",
	defining: true,

	addAttributes() {
		return {
			class: {
				default: "fvtt advice",
				parseHTML: (element) => {
					const classes = element.getAttribute("class") || "";
					if (classes.includes("advice")) return "fvtt advice";
					if (classes.includes("quest")) return "fvtt quest";
					return "fvtt advice";
				},
				renderHTML: (attributes) => {
					return {
						class: attributes.class,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "div.fvtt.advice",
			},
			{
				tag: "div.fvtt.quest",
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["div", mergeAttributes(HTMLAttributes), 0];
	},

	addCommands() {
		return {
			setFVTTAdvice:
				(attributes: { class: string }) =>
				({ commands }) => {
					return commands.wrapIn(this.name, attributes);
				},
		};
	},
});

// FVTT Narrative block extension
export const FVTTNarrative = Node.create({
	name: "fvttNarrative",
	group: "block",
	content: "block+",
	defining: true,

	addAttributes() {
		return {
			class: {
				default: "fvtt narrative",
				parseHTML: (element) =>
					element.getAttribute("class") || "fvtt narrative",
				renderHTML: (attributes) => {
					return {
						class: attributes.class,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "aside.fvtt.narrative",
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["aside", mergeAttributes(HTMLAttributes), 0];
	},

	addCommands() {
		return {
			setFVTTNarrative:
				(attributes: { class: string }) =>
				({ commands }) => {
					return commands.wrapIn(this.name, attributes);
				},
		};
	},
});

// Roll command extension for D&D 5e roll syntax
export const RollCommand = Node.create({
	name: "rollCommand",
	group: "inline",
	inline: true,
	atom: true,

	addAttributes() {
		return {
			command: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-command"),
				renderHTML: (attributes) => ({
					"data-command": attributes.command,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-command]",
				getAttrs: (node) => {
					if (typeof node === "string") return false;
					const element = node as HTMLElement;
					return {
						command:
							element.getAttribute("data-command") || element.textContent || "",
					};
				},
			},
			{
				tag: "span.roll-command",
				getAttrs: (node) => {
					if (typeof node === "string") return false;
					const element = node as HTMLElement;
					const command =
						element.getAttribute("data-command") || element.textContent || "";
					return { command };
				},
			},
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			"span",
			mergeAttributes(HTMLAttributes, {
				class: "roll-command",
				"data-command": node.attrs.command,
			}),
			node.attrs.command,
		];
	},

	addCommands() {
		return {
			setRollCommand:
				(command: string) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: { command },
					});
				},
		};
	},
});
