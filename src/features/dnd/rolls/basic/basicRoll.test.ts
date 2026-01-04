import { describe, expect, it } from "vitest";
import { createBasicRoll } from "./basicRoll";

describe("createBasicRoll", () => {
	describe("legacy string support", () => {
		it("should handle string as formula", () => {
			expect(createBasicRoll("5d20")).toBe("[[/roll 5d20]]");
			expect(createBasicRoll("1d10 + 1d4")).toBe("[[/roll 1d10 + 1d4]]");
			expect(createBasicRoll("1d20 / 2 + 10")).toBe("[[/roll 1d20 / 2 + 10]]");
		});

		it("should handle complex formula strings", () => {
			expect(createBasicRoll("1d100 * 2 / 1d4")).toBe(
				"[[/roll 1d100 * 2 / 1d4]]",
			);
			expect(createBasicRoll("(1d8+4) * 2")).toBe("[[/roll (1d8+4) * 2]]");
		});
	});

	describe("no options", () => {
		it("should create empty roll with no options", () => {
			expect(createBasicRoll()).toBe("[[/roll]]");
			expect(createBasicRoll({})).toBe("[[/roll]]");
		});
	});

	describe("basic rolls with formulas", () => {
		it("should create roll with simple formula", () => {
			expect(createBasicRoll({ formula: "5d20" })).toBe("[[/roll 5d20]]");
			expect(createBasicRoll({ formula: "1d6" })).toBe("[[/roll 1d6]]");
		});

		it("should create roll with formula and math", () => {
			expect(createBasicRoll({ formula: "1d10 + 1d4 + 4" })).toBe(
				"[[/roll 1d10 + 1d4 + 4]]",
			);
			expect(createBasicRoll({ formula: "1d20 / 2 + 10" })).toBe(
				"[[/roll 1d20 / 2 + 10]]",
			);
		});

		it("should create roll with complex formula", () => {
			expect(createBasicRoll({ formula: "1d100 * 2 / 1d4" })).toBe(
				"[[/roll 1d100 * 2 / 1d4]]",
			);
			expect(createBasicRoll({ formula: "(1d8+4) * 2" })).toBe(
				"[[/roll (1d8+4) * 2]]",
			);
		});
	});

	describe("roll modes", () => {
		it("should create public roll (default)", () => {
			expect(createBasicRoll({ formula: "1d20" })).toBe("[[/roll 1d20]]");
			expect(createBasicRoll({ formula: "1d20", mode: "public" })).toBe(
				"[[/publicroll 1d20]]",
			);
		});

		it("should create GM roll", () => {
			expect(createBasicRoll({ formula: "1d20", mode: "gm" })).toBe(
				"[[/gmroll 1d20]]",
			);
		});

		it("should create blind roll", () => {
			expect(createBasicRoll({ formula: "1d20", mode: "blind" })).toBe(
				"[[/blindroll 1d20]]",
			);
		});

		it("should create self roll", () => {
			expect(createBasicRoll({ formula: "1d20", mode: "self" })).toBe(
				"[[/selfroll 1d20]]",
			);
		});

		it("should create empty roll with mode only", () => {
			expect(createBasicRoll({ mode: "gm" })).toBe("[[/gmroll]]");
			expect(createBasicRoll({ mode: "blind" })).toBe("[[/blindroll]]");
			expect(createBasicRoll({ mode: "self" })).toBe("[[/selfroll]]");
		});
	});

	describe("roll descriptions", () => {
		it("should create roll with description", () => {
			expect(
				createBasicRoll({ formula: "5d20", description: "This is my roll!" }),
			).toBe("[[/roll 5d20 # This is my roll!]]");
		});

		it("should create roll with description and mode", () => {
			expect(
				createBasicRoll({
					formula: "1d20",
					mode: "gm",
					description: "Stealth check",
				}),
			).toBe("[[/gmroll 1d20 # Stealth check]]");
		});

		it("should create roll with description only (no formula)", () => {
			expect(createBasicRoll({ description: "Random roll" })).toBe(
				"[[/roll # Random roll]]",
			);
		});
	});

	describe("dice descriptions", () => {
		it("should create roll with single dice description", () => {
			expect(
				createBasicRoll({
					diceDescriptions: [
						{ formula: "2d6", description: "slashing damage" },
					],
				}),
			).toBe("[[/roll 2d6[slashing damage]]]");
		});

		it("should create roll with multiple dice descriptions", () => {
			expect(
				createBasicRoll({
					diceDescriptions: [
						{ formula: "2d6", description: "slashing damage" },
						{ formula: "1d8", description: "fire damage" },
					],
				}),
			).toBe("[[/roll 2d6[slashing damage]+1d8[fire damage]]]");
		});

		it("should prioritize dice descriptions over formula when both provided", () => {
			expect(
				createBasicRoll({
					formula: "2d6",
					diceDescriptions: [{ formula: "1d4", description: "test" }],
				}),
			).toBe("[[/roll 1d4[test]]]");
		});

		it("should create roll with dice descriptions and roll description", () => {
			expect(
				createBasicRoll({
					diceDescriptions: [
						{ formula: "2d6", description: "slashing damage" },
						{ formula: "1d8", description: "fire damage" },
					],
					description: "Sword attack",
				}),
			).toBe("[[/roll 2d6[slashing damage]+1d8[fire damage] # Sword attack]]");
		});
	});

	describe("inline rolls", () => {
		describe("immediate inline rolls", () => {
			it("should create immediate inline roll", () => {
				expect(createBasicRoll({ formula: "5d20", inline: "immediate" })).toBe(
					"[[5d20]]",
				);
			});

			it("should create immediate inline roll with label", () => {
				expect(
					createBasicRoll({
						formula: "5d20",
						inline: "immediate",
						label: "Roll for damage",
					}),
				).toBe("[[5d20]]{Roll for damage}");
			});

			it("should create immediate inline roll with dice descriptions", () => {
				expect(
					createBasicRoll({
						diceDescriptions: [
							{ formula: "2d6", description: "slashing damage" },
						],
						inline: "immediate",
					}),
				).toBe("[[2d6[slashing damage]]]");
			});

			it("should create immediate inline roll with dice descriptions and label", () => {
				expect(
					createBasicRoll({
						diceDescriptions: [
							{ formula: "2d6", description: "slashing damage" },
							{ formula: "1d8", description: "fire damage" },
						],
						inline: "immediate",
						label: "Weapon damage",
					}),
				).toBe("[[2d6[slashing damage]+1d8[fire damage]]]{Weapon damage}");
			});

			it("should create empty immediate inline roll when no formula", () => {
				expect(createBasicRoll({ inline: "immediate" })).toBe("[[]]");
			});
		});

		describe("deferred inline rolls", () => {
			it("should create deferred inline roll", () => {
				expect(createBasicRoll({ formula: "5d20", inline: "deferred" })).toBe(
					"[[/roll 5d20]]",
				);
			});

			it("should create deferred inline roll with label", () => {
				expect(
					createBasicRoll({
						formula: "5d20",
						inline: "deferred",
						label: "Click to roll",
					}),
				).toBe("[[/roll 5d20]]{Click to roll}");
			});

			it("should create deferred inline roll with dice descriptions", () => {
				expect(
					createBasicRoll({
						diceDescriptions: [
							{ formula: "2d6", description: "slashing damage" },
						],
						inline: "deferred",
					}),
				).toBe("[[/roll 2d6[slashing damage]]]");
			});

			it("should create deferred inline roll with dice descriptions and label", () => {
				expect(
					createBasicRoll({
						diceDescriptions: [
							{ formula: "2d6", description: "slashing damage" },
							{ formula: "1d8", description: "fire damage" },
						],
						inline: "deferred",
						label: "Roll damage",
					}),
				).toBe("[[/roll 2d6[slashing damage]+1d8[fire damage]]]{Roll damage}");
			});

			it("should create empty deferred inline roll when no formula", () => {
				expect(createBasicRoll({ inline: "deferred" })).toBe("[[]]");
			});

			it("should ignore mode for deferred inline rolls", () => {
				expect(
					createBasicRoll({
						formula: "1d20",
						mode: "gm",
						inline: "deferred",
					}),
				).toBe("[[/roll 1d20]]");
			});
		});
	});

	describe("combined options", () => {
		it("should create roll with formula, mode, and description", () => {
			expect(
				createBasicRoll({
					formula: "1d20",
					mode: "gm",
					description: "Stealth check",
				}),
			).toBe("[[/gmroll 1d20 # Stealth check]]");
		});

		it("should create roll with dice descriptions and description", () => {
			expect(
				createBasicRoll({
					diceDescriptions: [
						{ formula: "2d6", description: "slashing damage" },
						{ formula: "1d8", description: "fire damage" },
					],
					description: "Sword attack damage",
				}),
			).toBe(
				"[[/roll 2d6[slashing damage]+1d8[fire damage] # Sword attack damage]]",
			);
		});

		it("should create roll with all options (non-inline)", () => {
			expect(
				createBasicRoll({
					formula: "1d20",
					mode: "blind",
					description: "Secret roll",
					diceDescriptions: [{ formula: "1d20", description: "d20 roll" }],
				}),
			).toBe("[[/blindroll 1d20[d20 roll] # Secret roll]]");
		});
	});

	describe("edge cases", () => {
		it("should handle empty formula string", () => {
			expect(createBasicRoll({ formula: "" })).toBe("[[/roll]]");
		});

		it("should handle formula with spaces", () => {
			expect(createBasicRoll({ formula: "1d10 + 1d4 + 4" })).toBe(
				"[[/roll 1d10 + 1d4 + 4]]",
			);
		});

		it("should handle description with special characters", () => {
			expect(
				createBasicRoll({
					formula: "1d20",
					description: "Roll with # and [brackets]",
				}),
			).toBe("[[/roll 1d20 # Roll with # and [brackets]]]");
		});

		it("should handle dice description with special characters", () => {
			expect(
				createBasicRoll({
					diceDescriptions: [
						{ formula: "2d6", description: "damage (slashing)" },
					],
				}),
			).toBe("[[/roll 2d6[damage (slashing)]]]");
		});

		it("should handle inline false (regular roll)", () => {
			expect(createBasicRoll({ formula: "1d20", inline: false })).toBe(
				"[[/roll 1d20]]",
			);
		});

		it("should handle inline undefined (regular roll)", () => {
			expect(createBasicRoll({ formula: "1d20" })).toBe("[[/roll 1d20]]");
		});

		it("should handle multiple dice descriptions with complex formulas", () => {
			expect(
				createBasicRoll({
					diceDescriptions: [
						{ formula: "2d6", description: "slashing" },
						{ formula: "1d8", description: "fire" },
						{ formula: "1d4", description: "cold" },
					],
				}),
			).toBe("[[/roll 2d6[slashing]+1d8[fire]+1d4[cold]]]");
		});

		it("should handle label without inline (should be ignored)", () => {
			expect(createBasicRoll({ formula: "1d20", label: "Test" })).toBe(
				"[[/roll 1d20]]",
			);
		});

		it("should handle empty dice descriptions array", () => {
			expect(createBasicRoll({ formula: "1d20", diceDescriptions: [] })).toBe(
				"[[/roll 1d20]]",
			);
		});

		it("should handle formula with parentheses", () => {
			expect(createBasicRoll({ formula: "(1d8+4) * 2" })).toBe(
				"[[/roll (1d8+4) * 2]]",
			);
		});

		it("should handle formula with division", () => {
			expect(createBasicRoll({ formula: "1d20 / 3" })).toBe(
				"[[/roll 1d20 / 3]]",
			);
		});

		it("should handle formula with multiplication", () => {
			expect(createBasicRoll({ formula: "1d100 * 2" })).toBe(
				"[[/roll 1d100 * 2]]",
			);
		});
	});

	describe("documentation examples", () => {
		it("should match documentation example: 5d20", () => {
			expect(createBasicRoll("5d20")).toBe("[[/roll 5d20]]");
		});

		it("should match documentation example: 1d10 + 1d4 + 4", () => {
			expect(createBasicRoll("1d10 + 1d4 + 4")).toBe(
				"[[/roll 1d10 + 1d4 + 4]]",
			);
		});

		it("should match documentation example: 1d20 / 2 + 10", () => {
			expect(createBasicRoll("1d20 / 2 + 10")).toBe("[[/roll 1d20 / 2 + 10]]");
		});

		it("should match documentation example: 1d100 * 2 / 1d4", () => {
			expect(createBasicRoll("1d100 * 2 / 1d4")).toBe(
				"[[/roll 1d100 * 2 / 1d4]]",
			);
		});

		it("should match documentation example: (1d8+4) * 2", () => {
			expect(createBasicRoll("(1d8+4) * 2")).toBe("[[/roll (1d8+4) * 2]]");
		});

		it("should match documentation example: roll with description", () => {
			expect(
				createBasicRoll({
					formula: "1d20 + 2",
					description: "This is my roll!",
				}),
			).toBe("[[/roll 1d20 + 2 # This is my roll!]]");
		});

		it("should match documentation example: dice descriptions", () => {
			expect(
				createBasicRoll({
					diceDescriptions: [
						{ formula: "2d6", description: "slashing damage" },
						{ formula: "1d8", description: "fire damage" },
					],
				}),
			).toBe("[[/roll 2d6[slashing damage]+1d8[fire damage]]]");
		});

		it("should match documentation example: immediate inline roll", () => {
			expect(createBasicRoll({ formula: "2d12", inline: "immediate" })).toBe(
				"[[2d12]]",
			);
		});

		it("should match documentation example: deferred inline roll", () => {
			expect(createBasicRoll({ formula: "1d10", inline: "deferred" })).toBe(
				"[[/roll 1d10]]",
			);
		});
	});
});
