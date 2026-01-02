import { describe, expect, it } from "vitest";
import {
	createDamageRoll,
	type DamageEnricherOptions,
} from "./damageRoll";

describe("createDamageRoll", () => {
	describe("legacy string support", () => {
		it("should handle string formulas", () => {
			expect(createDamageRoll("2d6")).toBe("[[/damage 2d6]]");
			expect(createDamageRoll("1d8+3")).toBe("[[/damage 1d8+3]]");
			expect(createDamageRoll("2d6kh fire")).toBe("[[/damage 2d6kh fire]]");
		});

		it("should handle complex string formulas", () => {
			expect(createDamageRoll("1d6 + @abilities.dex.mod")).toBe(
				"[[/damage 1d6 + @abilities.dex.mod]]",
			);
		});
	});

	describe("no options", () => {
		it("should create empty damage enricher with no options", () => {
			expect(createDamageRoll()).toBe("[[/damage]]");
			expect(createDamageRoll({})).toBe("[[/damage]]");
		});
	});

	describe("activity-only case", () => {
		it("should create damage enricher with activity only", () => {
			expect(createDamageRoll({ activity: "RLQlsLo5InKHZadn" })).toBe(
				"[[/damage activity=RLQlsLo5InKHZadn]]",
			);
		});

		it("should not use activity-only format when formula is present", () => {
			expect(
				createDamageRoll({ activity: "RLQlsLo5InKHZadn", formula: "2d6" }),
			).toBe("[[/damage formula=2d6 activity=RLQlsLo5InKHZadn]]");
		});

		it("should not use activity-only format when rolls are present", () => {
			expect(
				createDamageRoll({
					activity: "RLQlsLo5InKHZadn",
					rolls: [{ formula: "2d6" }],
				}),
			).toBe("[[/damage 2d6]]");
		});
	});

	describe("multiple rolls", () => {
		it("should create damage enricher with multiple rolls", () => {
			expect(
				createDamageRoll({
					rolls: [
						{ formula: "1d6", type: "bludgeoning" },
						{ formula: "1d4", type: "fire" },
					],
				}),
			).toBe("[[/damage 1d6 bludgeoning & 1d4 fire]]");
		});

		it("should handle multiple rolls with array types", () => {
			expect(
				createDamageRoll({
					rolls: [
						{ formula: "1d6", type: ["fire", "cold"] },
						{ formula: "1d4", type: "bludgeoning" },
					],
				}),
			).toBe("[[/damage 1d6 fire cold & 1d4 bludgeoning]]");
		});

		it("should handle multiple rolls without types", () => {
			expect(
				createDamageRoll({
					rolls: [{ formula: "1d6" }, { formula: "1d4" }],
				}),
			).toBe("[[/damage 1d6 & 1d4]]");
		});

		it("should handle multiple rolls with average=true", () => {
			expect(
				createDamageRoll({
					rolls: [
						{ formula: "1d6", type: "fire" },
						{ formula: "1d4", type: "cold" },
					],
					average: true,
				}),
			).toBe("[[/damage 1d6 fire & 1d4 cold average]]");
		});

		it("should handle multiple rolls with average as number", () => {
			expect(
				createDamageRoll({
					rolls: [
						{ formula: "1d6", type: "fire" },
						{ formula: "1d4", type: "cold" },
					],
					average: 5,
				}),
			).toBe("[[/damage 1d6 fire & 1d4 cold average=5]]");
		});

		it("should handle multiple rolls with average as string", () => {
			expect(
				createDamageRoll({
					rolls: [
						{ formula: "1d6", type: "fire" },
						{ formula: "1d4", type: "cold" },
					],
					average: "@abilities.str.mod",
				}),
			).toBe("[[/damage 1d6 fire & 1d4 cold average=@abilities.str.mod]]");
		});

		it("should handle multiple rolls with format", () => {
			expect(
				createDamageRoll({
					rolls: [
						{ formula: "1d6", type: "fire" },
						{ formula: "1d4", type: "cold" },
					],
					format: "long",
				}),
			).toBe("[[/damage 1d6 fire & 1d4 cold format=long]]");
		});

		it("should handle multiple rolls with all options", () => {
			expect(
				createDamageRoll({
					rolls: [
						{ formula: "1d6", type: "fire" },
						{ formula: "1d4", type: "cold" },
					],
					average: 5,
					format: "extended",
				}),
			).toBe("[[/damage 1d6 fire & 1d4 cold average=5 format=extended]]");
		});
	});

	describe("single roll - shorthand format", () => {
		it("should create damage enricher with formula only", () => {
			expect(createDamageRoll({ formula: "2d6" })).toBe("[[/damage 2d6]]");
			expect(createDamageRoll({ formula: "1d8+3" })).toBe("[[/damage 1d8+3]]");
		});

		it("should create damage enricher with formula and single type", () => {
			expect(createDamageRoll({ formula: "2d6", type: "fire" })).toBe(
				"[[/damage 2d6 fire]]",
			);
			expect(createDamageRoll({ formula: "1d8", type: "bludgeoning" })).toBe(
				"[[/damage 1d8 bludgeoning]]",
			);
		});

		it("should create damage enricher with formula and multiple types (array)", () => {
			expect(createDamageRoll({ formula: "1d4", type: ["fire", "cold"] })).toBe(
				"[[/damage 1d4 fire cold]]",
			);
			expect(
				createDamageRoll({ formula: "2d6", type: ["fire", "cold", "lightning"] }),
			).toBe("[[/damage 2d6 fire cold lightning]]");
		});

		it("should create damage enricher with formula, type, and average=true", () => {
			expect(
				createDamageRoll({ formula: "2d6", type: "fire", average: true }),
			).toBe("[[/damage 2d6 fire average]]");
		});

		it("should create damage enricher with formula and average=true (no type)", () => {
			expect(createDamageRoll({ formula: "2d6", average: true })).toBe(
				"[[/damage 2d6 average]]",
			);
		});
	});

	describe("single roll - explicit format", () => {
		it("should use explicit format when activity is present", () => {
			expect(
				createDamageRoll({ formula: "2d6", type: "fire", activity: "RLQlsLo5InKHZadn" }),
			).toBe("[[/damage formula=2d6 type=fire activity=RLQlsLo5InKHZadn]]");
		});

		it("should use explicit format when format option is present", () => {
			expect(createDamageRoll({ formula: "2d6", type: "fire", format: "long" })).toBe(
				"[[/damage formula=2d6 type=fire format=long]]",
			);
			expect(createDamageRoll({ formula: "2d6", type: "fire", format: "extended" })).toBe(
				"[[/damage formula=2d6 type=fire format=extended]]",
			);
		});

		it("should use explicit format when average is a number", () => {
			expect(createDamageRoll({ formula: "2d6", type: "fire", average: 5 })).toBe(
				"[[/damage formula=2d6 type=fire average=5]]",
			);
			expect(createDamageRoll({ formula: "2d6", type: "fire", average: 10 })).toBe(
				"[[/damage formula=2d6 type=fire average=10]]",
			);
		});

		it("should use explicit format when average is a string", () => {
			expect(
				createDamageRoll({
					formula: "2d6",
					type: "fire",
					average: "@abilities.str.mod",
				}),
			).toBe("[[/damage formula=2d6 type=fire average=@abilities.str.mod]]");
		});

		it("should use slash-separated types in explicit format when multiple types", () => {
			expect(
				createDamageRoll({ formula: "1d4", type: ["fire", "cold"], format: "long" }),
			).toBe("[[/damage formula=1d4 type=fire/cold format=long]]");
		});

		it("should use single type in explicit format", () => {
			expect(
				createDamageRoll({ formula: "2d6", type: "fire", format: "long" }),
			).toBe("[[/damage formula=2d6 type=fire format=long]]");
		});

		it("should use explicit format with all options", () => {
			const options: DamageEnricherOptions = {
				formula: "2d6",
				type: ["fire", "cold"],
				average: 5,
				activity: "RLQlsLo5InKHZadn",
				format: "extended",
			};
			const result = createDamageRoll(options);
			expect(result).toContain("formula=2d6");
			expect(result).toContain("type=fire/cold");
			expect(result).toContain("average=5");
			expect(result).toContain("activity=RLQlsLo5InKHZadn");
			expect(result).toContain("format=extended");
			expect(result).toMatch(/^\[\[\/damage .+\]\]$/);
		});

		it("should use explicit format with average=true when other complex options present", () => {
			expect(
				createDamageRoll({ formula: "2d6", type: "fire", average: true, format: "long" }),
			).toBe("[[/damage formula=2d6 type=fire average=true format=long]]");
		});
	});

	describe("edge cases", () => {
		it("should handle formula with complex expressions", () => {
			expect(
				createDamageRoll({ formula: "1d6 + @abilities.dex.mod" }),
			).toBe("[[/damage 1d6 + @abilities.dex.mod]]");
		});

		it("should handle formula with keep highest", () => {
			expect(createDamageRoll({ formula: "2d6kh", type: "fire" })).toBe(
				"[[/damage 2d6kh fire]]",
			);
		});

		it("should handle empty rolls array", () => {
			// Empty rolls array still processes and creates a space-separated result
			expect(createDamageRoll({ rolls: [] })).toBe("[[/damage ]]");
		});

		it("should handle single roll in rolls array", () => {
			expect(createDamageRoll({ rolls: [{ formula: "2d6", type: "fire" }] })).toBe(
				"[[/damage 2d6 fire]]",
			);
		});

		it("should handle formula with activity (explicit format)", () => {
			expect(createDamageRoll({ formula: "2d6", activity: "RLQlsLo5InKHZadn" })).toBe(
				"[[/damage formula=2d6 activity=RLQlsLo5InKHZadn]]",
			);
		});

		it("should handle type array with single element in explicit format", () => {
			expect(
				createDamageRoll({ formula: "2d6", type: ["fire"], format: "long" }),
			).toBe("[[/damage formula=2d6 type=fire format=long]]");
		});
	});
});

