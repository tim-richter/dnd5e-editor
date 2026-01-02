import { describe, expect, it } from "vitest";
import {
	createHealRoll,
	type HealEnricherOptions,
} from "./healRoll";

describe("createHealRoll", () => {
	describe("legacy string support", () => {
		it("should handle string formulas", () => {
			expect(createHealRoll("2d4 + 2")).toBe("[[/heal 2d4 + 2]]");
			expect(createHealRoll("10")).toBe("[[/heal 10]]");
			expect(createHealRoll("1d8 + 3")).toBe("[[/heal 1d8 + 3]]");
		});

		it("should handle complex string formulas", () => {
			expect(createHealRoll("2d4 + @abilities.wis.mod")).toBe(
				"[[/heal 2d4 + @abilities.wis.mod]]",
			);
		});
	});

	describe("no options", () => {
		it("should create empty heal enricher with no options", () => {
			expect(createHealRoll()).toBe("[[/heal]]");
			expect(createHealRoll({})).toBe("[[/heal]]");
		});
	});

	describe("activity-only case", () => {
		it("should create heal enricher with activity only", () => {
			expect(createHealRoll({ activity: "jdRTb04FngE1B8cF" })).toBe(
				"[[/heal activity=jdRTb04FngE1B8cF]]",
			);
		});

		it("should not use activity-only format when formula is present", () => {
			expect(
				createHealRoll({ activity: "jdRTb04FngE1B8cF", formula: "2d4 + 2" }),
			).toBe("[[/heal formula=2d4 + 2 activity=jdRTb04FngE1B8cF]]");
		});
	});

	describe("shorthand format", () => {
		it("should create heal enricher with formula only", () => {
			expect(createHealRoll({ formula: "2d4 + 2" })).toBe("[[/heal 2d4 + 2]]");
			expect(createHealRoll({ formula: "10" })).toBe("[[/heal 10]]");
		});

		it("should create heal enricher with formula and type=temp", () => {
			expect(createHealRoll({ formula: "10", type: "temp" })).toBe(
				"[[/heal 10 temp]]",
			);
			expect(createHealRoll({ formula: "2d4 + 2", type: "temp" })).toBe(
				"[[/heal 2d4 + 2 temp]]",
			);
		});

		it("should create heal enricher with formula and type=temphp", () => {
			expect(createHealRoll({ formula: "10", type: "temphp" })).toBe(
				"[[/heal 10 temp]]",
			);
			expect(createHealRoll({ formula: "2d4 + 2", type: "temphp" })).toBe(
				"[[/heal 2d4 + 2 temp]]",
			);
		});

		it("should create heal enricher with formula and average=true", () => {
			expect(createHealRoll({ formula: "2d4 + 2", average: true })).toBe(
				"[[/heal 2d4 + 2 average]]",
			);
			expect(createHealRoll({ formula: "10", average: true })).toBe(
				"[[/heal 10 average]]",
			);
		});

		it("should create heal enricher with formula, type=temp, and average=true", () => {
			expect(
				createHealRoll({ formula: "2d4 + 2", type: "temp", average: true }),
			).toBe("[[/heal 2d4 + 2 temp average]]");
		});

		it("should create heal enricher with formula, type=temphp, and average=true", () => {
			expect(
				createHealRoll({ formula: "2d4 + 2", type: "temphp", average: true }),
			).toBe("[[/heal 2d4 + 2 temp average]]");
		});
	});

	describe("explicit format", () => {
		it("should use explicit format when activity is present", () => {
			expect(
				createHealRoll({ formula: "2d4 + 2", activity: "jdRTb04FngE1B8cF" }),
			).toBe("[[/heal formula=2d4 + 2 activity=jdRTb04FngE1B8cF]]");
		});

		it("should use explicit format when format option is present", () => {
			expect(createHealRoll({ formula: "2d4 + 2", format: "long" })).toBe(
				"[[/heal formula=2d4 + 2 format=long]]",
			);
			expect(createHealRoll({ formula: "2d4 + 2", format: "extended" })).toBe(
				"[[/heal formula=2d4 + 2 format=extended]]",
			);
		});

		it("should use explicit format when average is a number", () => {
			expect(createHealRoll({ formula: "2d4 + 2", average: 5 })).toBe(
				"[[/heal formula=2d4 + 2 average=5]]",
			);
			expect(createHealRoll({ formula: "2d4 + 2", average: 10 })).toBe(
				"[[/heal formula=2d4 + 2 average=10]]",
			);
		});

		it("should use explicit format when average is a string", () => {
			expect(
				createHealRoll({ formula: "2d4 + 2", average: "@abilities.wis.mod" }),
			).toBe("[[/heal formula=2d4 + 2 average=@abilities.wis.mod]]");
		});

		it("should use explicit format when type=healing", () => {
			expect(createHealRoll({ formula: "2d4 + 2", type: "healing" })).toBe(
				"[[/heal formula=2d4 + 2 type=healing]]",
			);
		});

		it("should convert type=temp to temphp in explicit format", () => {
			expect(
				createHealRoll({ formula: "2d4 + 2", type: "temp", format: "long" }),
			).toBe("[[/heal formula=2d4 + 2 type=temphp format=long]]");
		});

		it("should use temphp for type=temphp in explicit format", () => {
			expect(
				createHealRoll({ formula: "2d4 + 2", type: "temphp", format: "long" }),
			).toBe("[[/heal formula=2d4 + 2 type=temphp format=long]]");
		});

		it("should use explicit format with average=true when other complex options present", () => {
			expect(
				createHealRoll({ formula: "2d4 + 2", average: true, format: "long" }),
			).toBe("[[/heal formula=2d4 + 2 average=true format=long]]");
		});

		it("should use explicit format with all options", () => {
			const options: HealEnricherOptions = {
				formula: "2d4 + 2",
				type: "healing",
				average: 5,
				activity: "jdRTb04FngE1B8cF",
				format: "extended",
			};
			const result = createHealRoll(options);
			expect(result).toContain("formula=2d4 + 2");
			expect(result).toContain("type=healing");
			expect(result).toContain("average=5");
			expect(result).toContain("activity=jdRTb04FngE1B8cF");
			expect(result).toContain("format=extended");
			expect(result).toMatch(/^\[\[\/heal .+\]\]$/);
		});

		it("should use explicit format with type=temp and all options", () => {
			const options: HealEnricherOptions = {
				formula: "2d4 + 2",
				type: "temp",
				average: 5,
				activity: "jdRTb04FngE1B8cF",
				format: "extended",
			};
			const result = createHealRoll(options);
			expect(result).toContain("formula=2d4 + 2");
			expect(result).toContain("type=temphp");
			expect(result).toContain("average=5");
			expect(result).toContain("activity=jdRTb04FngE1B8cF");
			expect(result).toContain("format=extended");
		});
	});

	describe("edge cases", () => {
		it("should handle formula with complex expressions", () => {
			expect(createHealRoll({ formula: "2d4 + @abilities.wis.mod" })).toBe(
				"[[/heal 2d4 + @abilities.wis.mod]]",
			);
		});

		it("should handle type=temp with activity (explicit format)", () => {
			expect(
				createHealRoll({ formula: "10", type: "temp", activity: "jdRTb04FngE1B8cF" }),
			).toBe("[[/heal formula=10 type=temphp activity=jdRTb04FngE1B8cF]]");
		});

		it("should handle type=temphp with activity (explicit format)", () => {
			expect(
				createHealRoll({
					formula: "10",
					type: "temphp",
					activity: "jdRTb04FngE1B8cF",
				}),
			).toBe("[[/heal formula=10 type=temphp activity=jdRTb04FngE1B8cF]]");
		});

		it("should handle type=healing with average=true (explicit format)", () => {
			expect(
				createHealRoll({ formula: "2d4 + 2", type: "healing", average: true }),
			).toBe("[[/heal formula=2d4 + 2 type=healing average=true]]");
		});

		it("should handle formula with format=short (explicit format)", () => {
			expect(createHealRoll({ formula: "2d4 + 2", format: "short" })).toBe(
				"[[/heal formula=2d4 + 2 format=short]]",
			);
		});
	});
});

