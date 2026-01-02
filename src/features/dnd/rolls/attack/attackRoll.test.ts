import { describe, expect, it } from "vitest";
import {
	createAttackRoll,
	type AttackEnricherOptions,
} from "./attackRoll";

describe("createAttackRoll", () => {
	describe("legacy string support", () => {
		it("should handle ability names (legacy format)", () => {
			expect(createAttackRoll("strength")).toBe("@attack[strength]");
			expect(createAttackRoll("dex")).toBe("@attack[dexterity]");
			expect(createAttackRoll("con")).toBe("@attack[constitution]");
		});

		it("should handle non-ability strings as formulas", () => {
			expect(createAttackRoll("+5")).toBe("[[/attack +5]]");
			expect(createAttackRoll("-2")).toBe("[[/attack -2]]");
			expect(createAttackRoll("5")).toBe("[[/attack 5]]");
		});

		it("should handle complex formula strings", () => {
			expect(createAttackRoll("@abilities.str.mod + 3")).toBe(
				"[[/attack @abilities.str.mod + 3]]",
			);
		});
	});

	describe("legacy number support", () => {
		it("should handle numbers as formulas with + prefix", () => {
			expect(createAttackRoll(5)).toBe("[[/attack +5]]");
			expect(createAttackRoll(10)).toBe("[[/attack +10]]");
			expect(createAttackRoll(-2)).toBe("[[/attack +-2]]");
		});
	});

	describe("no options", () => {
		it("should create empty attack enricher with no options", () => {
			expect(createAttackRoll()).toBe("[[/attack]]");
			expect(createAttackRoll({})).toBe("[[/attack]]");
		});
	});

	describe("shorthand formats", () => {
		describe("only format provided", () => {
			it("should create shorthand format with format only", () => {
				expect(createAttackRoll({ format: "short" })).toBe("[[/attack short]]");
				expect(createAttackRoll({ format: "long" })).toBe("[[/attack long]]");
				expect(createAttackRoll({ format: "extended" })).toBe(
					"[[/attack extended]]",
				);
			});
		});

		describe("only formula provided", () => {
			it("should create shorthand format with formula starting with +", () => {
				expect(createAttackRoll({ formula: "+5" })).toBe("[[/attack +5]]");
				expect(createAttackRoll({ formula: "+10" })).toBe("[[/attack +10]]");
			});

			it("should create shorthand format with formula starting with -", () => {
				expect(createAttackRoll({ formula: "-2" })).toBe("[[/attack -2]]");
			});

			it("should create shorthand format with numeric formula", () => {
				expect(createAttackRoll({ formula: 5 })).toBe("[[/attack +5]]");
				expect(createAttackRoll({ formula: 10 })).toBe("[[/attack +10]]");
			});

			it("should use full format when formula doesn't start with + or -", () => {
				expect(createAttackRoll({ formula: "5" })).toBe("[[/attack formula=5]]");
				expect(createAttackRoll({ formula: "@abilities.str.mod" })).toBe(
					"[[/attack formula=@abilities.str.mod]]",
				);
			});
		});

		describe("formula + attackMode", () => {
			it("should create shorthand format with numeric formula and attackMode", () => {
				expect(createAttackRoll({ formula: 5, attackMode: "thrown" })).toBe(
					"[[/attack 5 thrown]]",
				);
				expect(createAttackRoll({ formula: 10, attackMode: "melee" })).toBe(
					"[[/attack 10 melee]]",
				);
			});

			it("should create shorthand format with string formula and attackMode", () => {
				expect(createAttackRoll({ formula: "+5", attackMode: "thrown" })).toBe(
					"[[/attack 5 thrown]]",
				);
				expect(createAttackRoll({ formula: "-2", attackMode: "ranged" })).toBe(
					"[[/attack 2 ranged]]",
				);
				expect(createAttackRoll({ formula: "5", attackMode: "thrown" })).toBe(
					"[[/attack 5 thrown]]",
				);
			});
		});
	});

	describe("full format with explicit keys", () => {
		it("should create attack with numeric formula in full format", () => {
			expect(createAttackRoll({ formula: 5, activity: "jdRTb04FngE1B8cF" })).toBe(
				"[[/attack formula=+5 activity=jdRTb04FngE1B8cF]]",
			);
		});

		it("should create attack with string formula with + prefix in full format", () => {
			expect(createAttackRoll({ formula: "+5", activity: "jdRTb04FngE1B8cF" })).toBe(
				"[[/attack +5 activity=jdRTb04FngE1B8cF]]",
			);
		});

		it("should create attack with string formula without + prefix in full format", () => {
			expect(createAttackRoll({ formula: "5", activity: "jdRTb04FngE1B8cF" })).toBe(
				"[[/attack formula=5 activity=jdRTb04FngE1B8cF]]",
			);
		});

		it("should create attack with activity", () => {
			expect(createAttackRoll({ activity: "jdRTb04FngE1B8cF" })).toBe(
				"[[/attack activity=jdRTb04FngE1B8cF]]",
			);
		});

		it("should create attack with attackMode", () => {
			expect(createAttackRoll({ formula: "+5", attackMode: "thrown", format: "long" })).toBe(
				"[[/attack +5 attackMode=thrown format=long]]",
			);
		});

		it("should create attack with format", () => {
			// Formula with + prefix uses shorthand even with format
			expect(createAttackRoll({ formula: "+5", format: "extended" })).toBe(
				"[[/attack +5 format=extended]]",
			);
		});

		it("should create attack with rules", () => {
			// Formula with + prefix uses shorthand even with rules
			expect(createAttackRoll({ formula: "+5", rules: "2024" })).toBe(
				"[[/attack +5 rules=2024]]",
			);
			expect(createAttackRoll({ formula: "+5", rules: "2014" })).toBe(
				"[[/attack +5 rules=2014]]",
			);
		});

		it("should create attack with all options", () => {
			const options: AttackEnricherOptions = {
				formula: "+5",
				activity: "jdRTb04FngE1B8cF",
				attackMode: "thrown",
				format: "extended",
				rules: "2024",
			};
			const result = createAttackRoll(options);
			expect(result).toContain("+5");
			expect(result).toContain("activity=jdRTb04FngE1B8cF");
			expect(result).toContain("attackMode=thrown");
			expect(result).toContain("format=extended");
			expect(result).toContain("rules=2024");
			expect(result).toMatch(/^\[\[\/attack .+\]\]$/);
		});

		it("should handle complex formula expressions", () => {
			// Formula without + prefix with attackMode uses shorthand
			expect(
				createAttackRoll({
					formula: "@abilities.str.mod + 3",
					attackMode: "melee",
				}),
			).toBe("[[/attack @abilities.str.mod + 3 melee]]");
		});
	});

	describe("edge cases", () => {
		it("should handle formula with negative number", () => {
			expect(createAttackRoll({ formula: -2 })).toBe("[[/attack +-2]]");
		});

		it("should handle formula as zero", () => {
			expect(createAttackRoll({ formula: 0 })).toBe("[[/attack +0]]");
		});

		it("should handle formula with complex expression in full format", () => {
			expect(
				createAttackRoll({
					formula: "@abilities.dex.mod + @prof",
					format: "long",
				}),
			).toBe("[[/attack formula=@abilities.dex.mod + @prof format=long]]");
		});

		it("should handle activity with format", () => {
			expect(
				createAttackRoll({
					activity: "jdRTb04FngE1B8cF",
					format: "extended",
				}),
			).toBe("[[/attack activity=jdRTb04FngE1B8cF format=extended]]");
		});

		it("should handle formula with activity and rules", () => {
			expect(
				createAttackRoll({
					formula: 5,
					activity: "jdRTb04FngE1B8cF",
					rules: "2024",
				}),
			).toBe("[[/attack formula=+5 activity=jdRTb04FngE1B8cF rules=2024]]");
		});

		it("should handle formula without + prefix when other options present", () => {
			expect(createAttackRoll({ formula: "5", format: "long" })).toBe(
				"[[/attack formula=5 format=long]]",
			);
		});

		it("should handle formula with + prefix when other options present", () => {
			expect(createAttackRoll({ formula: "+5", format: "long" })).toBe(
				"[[/attack +5 format=long]]",
			);
		});
	});
});

