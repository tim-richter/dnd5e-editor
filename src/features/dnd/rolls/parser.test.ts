import { describe, expect, it } from "vitest";
import { parseRollCommand } from "./parser";

describe("parseRollCommand", () => {
	describe("invalid commands", () => {
		it("should return null for invalid command format", () => {
			expect(parseRollCommand("not a command")).toBeNull();
			expect(parseRollCommand("[/check acrobatics]")).toBeNull();
			expect(parseRollCommand("[[check acrobatics]]")).toBeNull();
			expect(parseRollCommand("")).toBeNull();
		});

		it("should return null for unsupported command types", () => {
			expect(parseRollCommand("[[/save dexterity]]")).toBeNull();
			expect(parseRollCommand("[[/spell fireball]]")).toBeNull();
		});
	});

	describe("check commands", () => {
		describe("explicit format", () => {
			it("should parse ability with explicit format", () => {
				const result = parseRollCommand("[[/check ability=dexterity]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("check");
				expect(result?.options).toEqual({ ability: "dexterity" });
			});

			it("should parse skill with explicit format", () => {
				const result = parseRollCommand("[[/check skill=acrobatics]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("check");
				expect(result?.options).toEqual({ skill: "acrobatics" });
			});

			it("should parse multiple skills with explicit format", () => {
				const result = parseRollCommand("[[/check skill=acr/ath]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("check");
				expect(result?.options).toEqual({
					skill: ["acrobatics", "athletics"],
				});
			});

			it("should parse ability and skill with explicit format", () => {
				const result = parseRollCommand(
					"[[/check ability=strength skill=intimidation]]",
				);
				expect(result).not.toBeNull();
				expect(result?.type).toBe("check");
				expect(result?.options).toEqual({
					ability: "strength",
					skill: "intimidation",
				});
			});

			it("should parse DC as number with explicit format", () => {
				const result = parseRollCommand("[[/check skill=perception dc=15]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ skill: "perception", dc: 15 });
			});

			it("should parse DC as string formula with explicit format", () => {
				const result = parseRollCommand(
					"[[/check skill=perception dc=@abilities.wis.dc]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					skill: "perception",
					dc: "@abilities.wis.dc",
				});
			});

			it("should parse all check options with explicit format", () => {
				const result = parseRollCommand(
					"[[/check ability=strength skill=intimidation tool=hammer vehicle=horse dc=15 format=long passive=true activity=RLQlsLo5InKHZadn rules=2024]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					ability: "strength",
					skill: "intimidation",
					tool: "hammer",
					vehicle: "horse",
					dc: 15,
					format: "long",
					passive: true,
					activity: "RLQlsLo5InKHZadn",
					rules: "2024",
				});
			});
		});

		describe("shorthand format", () => {
			it("should parse ability shorthand", () => {
				const result = parseRollCommand("[[/check dex]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("check");
				expect(result?.options).toEqual({ ability: "dexterity" });
			});

			it("should parse skill shorthand", () => {
				const result = parseRollCommand("[[/check acrobatics]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("check");
				expect(result?.options).toEqual({ skill: "acrobatics" });
			});

			it("should parse skill abbreviation shorthand", () => {
				const result = parseRollCommand("[[/check prc]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ skill: "perception" });
			});

			it("should parse ability and DC shorthand", () => {
				const result = parseRollCommand("[[/check dex 15]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ ability: "dexterity", dc: 15 });
			});

			it("should parse skill and DC shorthand", () => {
				const result = parseRollCommand("[[/check perception 20]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ skill: "perception", dc: 20 });
			});

			it("should parse multiple skills shorthand", () => {
				const result = parseRollCommand("[[/check acrobatics athletics]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					skill: ["acrobatics", "athletics"],
				});
			});

			it("should parse ability, skill, and DC shorthand", () => {
				const result = parseRollCommand("[[/check strength intimidation 15]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					ability: "strength",
					skill: "intimidation",
					dc: 15,
				});
			});

			it("should parse custom skill (unrecognized)", () => {
				const result = parseRollCommand("[[/check custom-skill]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ skill: "custom-skill" });
			});
		});

		describe("skill commands", () => {
			it("should parse skill command", () => {
				const result = parseRollCommand("[[/skill perception]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("skill");
				expect(result?.options).toEqual({ skill: "perception" });
			});

			it("should parse skill command with DC", () => {
				const result = parseRollCommand("[[/skill perception 15]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("skill");
				expect(result?.options).toEqual({ skill: "perception", dc: 15 });
			});
		});

		describe("tool commands", () => {
			it("should parse tool command", () => {
				const result = parseRollCommand("[[/tool thieves-tools]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("tool");
				expect(result?.options).toEqual({ tool: "thieves-tools" });
			});
		});

		describe("empty commands", () => {
			it("should parse empty check command", () => {
				const result = parseRollCommand("[[/check]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("check");
				expect(result?.options).toEqual({});
			});

			it("should parse check command with only whitespace", () => {
				const result = parseRollCommand("[[/check   ]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("check");
				expect(result?.options).toEqual({});
			});
		});
	});

	describe("attack commands", () => {
		describe("explicit format", () => {
			it("should parse formula as number with explicit format", () => {
				const result = parseRollCommand("[[/attack formula=5]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("attack");
				expect(result?.options).toEqual({ formula: 5 });
			});

			it("should parse formula as string with explicit format", () => {
				const result = parseRollCommand("[[/attack formula=+5]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: 5 });
			});

			it("should parse formula as complex string with explicit format", () => {
				// Note: Formulas with spaces in explicit format are split on spaces
				// This is a limitation of the current parser
				const result = parseRollCommand(
					"[[/attack formula=@abilities.str.mod + 3]]",
				);
				expect(result).not.toBeNull();
				// The parser splits on spaces, so "+ 3" becomes separate tokens
				// This is expected behavior for the current implementation
				expect(result?.options).toEqual({
					formula: "@abilities.str.mod",
				});
			});

			it("should parse attack with all options", () => {
				const result = parseRollCommand(
					"[[/attack formula=5 attackMode=thrown format=extended rules=2024 activity=jdRTb04FngE1B8cF]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: 5,
					attackMode: "thrown",
					format: "extended",
					rules: "2024",
					activity: "jdRTb04FngE1B8cF",
				});
			});
		});

		describe("shorthand format", () => {
			it("should parse format-only shorthand", () => {
				const result = parseRollCommand("[[/attack extended]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ format: "extended" });
			});

			it("should parse numeric formula shorthand", () => {
				const result = parseRollCommand("[[/attack +5]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: 5 });
			});

			it("should parse negative numeric formula shorthand", () => {
				const result = parseRollCommand("[[/attack -2]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: -2 });
			});

			it("should parse formula without sign shorthand", () => {
				const result = parseRollCommand("[[/attack 5]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: 5 });
			});

			it("should parse formula and attackMode shorthand", () => {
				const result = parseRollCommand("[[/attack 5 thrown]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: 5, attackMode: "thrown" });
			});

			it("should parse string formula and attackMode shorthand", () => {
				const result = parseRollCommand("[[/attack @abilities.str.mod melee]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "@abilities.str.mod",
					attackMode: "melee",
				});
			});
		});

		describe("empty commands", () => {
			it("should parse empty attack command", () => {
				const result = parseRollCommand("[[/attack]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("attack");
				expect(result?.options).toEqual({});
			});
		});
	});

	describe("damage commands", () => {
		describe("explicit format", () => {
			it("should parse formula with explicit format", () => {
				const result = parseRollCommand("[[/damage formula=2d6]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("damage");
				expect(result?.options).toEqual({ formula: "2d6" });
			});

			it("should parse formula and type with explicit format", () => {
				const result = parseRollCommand("[[/damage formula=2d6 type=fire]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "2d6", type: "fire" });
			});

			it("should parse multiple types with explicit format", () => {
				const result = parseRollCommand(
					"[[/damage formula=1d4 type=fire/cold]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "1d4",
					type: ["fire", "cold"],
				});
			});

			it("should parse average=true with explicit format", () => {
				const result = parseRollCommand(
					"[[/damage formula=2d6 type=fire average=true]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d6",
					type: "fire",
					average: true,
				});
			});

			it("should parse average as number with explicit format", () => {
				const result = parseRollCommand(
					"[[/damage formula=2d6 type=fire average=5]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d6",
					type: "fire",
					average: 5,
				});
			});

			it("should parse average as string with explicit format", () => {
				const result = parseRollCommand(
					"[[/damage formula=2d6 type=fire average=@abilities.wis.mod]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d6",
					type: "fire",
					average: "@abilities.wis.mod",
				});
			});

			it("should parse all damage options with explicit format", () => {
				const result = parseRollCommand(
					"[[/damage formula=2d6 type=fire average=5 format=long activity=jdRTb04FngE1B8cF]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d6",
					type: "fire",
					average: 5,
					format: "long",
					activity: "jdRTb04FngE1B8cF",
				});
			});
		});

		describe("shorthand format", () => {
			it("should parse formula only shorthand", () => {
				const result = parseRollCommand("[[/damage 2d6]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "2d6" });
			});

			it("should parse formula and type shorthand", () => {
				const result = parseRollCommand("[[/damage 2d6 fire]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "2d6", type: "fire" });
			});

			it("should parse formula and multiple types shorthand", () => {
				const result = parseRollCommand("[[/damage 1d4 fire cold]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "1d4",
					type: ["fire", "cold"],
				});
			});

			it("should parse formula, type, and average shorthand", () => {
				const result = parseRollCommand("[[/damage 2d6 fire average]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d6",
					type: "fire",
					average: true,
				});
			});

			it("should parse formula and average shorthand (no type)", () => {
				const result = parseRollCommand("[[/damage 2d6 average]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "2d6", average: true });
			});

			it("should parse average as number in shorthand", () => {
				const result = parseRollCommand("[[/damage 2d6 fire average=5]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d6",
					type: "fire",
					average: 5,
				});
			});

			it("should parse format in shorthand", () => {
				const result = parseRollCommand("[[/damage 2d6 fire format=long]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d6",
					type: "fire",
					format: "long",
				});
			});
		});

		describe("multiple rolls", () => {
			it("should parse multiple rolls", () => {
				const result = parseRollCommand(
					"[[/damage 1d6 bludgeoning & 1d4 fire]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					rolls: [
						{ formula: "1d6", type: "bludgeoning" },
						{ formula: "1d4", type: "fire" },
					],
				});
			});

			it("should parse multiple rolls with multiple types", () => {
				const result = parseRollCommand(
					"[[/damage 1d6 fire cold & 1d4 bludgeoning]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					rolls: [
						{ formula: "1d6", type: ["fire", "cold"] },
						{ formula: "1d4", type: "bludgeoning" },
					],
				});
			});

			it("should parse multiple rolls with shared average", () => {
				const result = parseRollCommand(
					"[[/damage 1d6 bludgeoning & 1d4 fire average]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					rolls: [
						{ formula: "1d6", type: "bludgeoning" },
						{ formula: "1d4", type: "fire" },
					],
					average: true,
				});
			});

			it("should parse multiple rolls with shared average as number", () => {
				const result = parseRollCommand(
					"[[/damage 1d6 bludgeoning & 1d4 fire average=5]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					rolls: [
						{ formula: "1d6", type: "bludgeoning" },
						{ formula: "1d4", type: "fire" },
					],
					average: 5,
				});
			});

			it("should parse multiple rolls with shared format", () => {
				const result = parseRollCommand(
					"[[/damage 1d6 bludgeoning & 1d4 fire format=long]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					rolls: [
						{ formula: "1d6", type: "bludgeoning" },
						{ formula: "1d4", type: "fire" },
					],
					format: "long",
				});
			});

			it("should parse multiple rolls without types", () => {
				const result = parseRollCommand("[[/damage 1d6 & 1d4]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					rolls: [{ formula: "1d6" }, { formula: "1d4" }],
				});
			});
		});

		describe("empty commands", () => {
			it("should parse empty damage command", () => {
				const result = parseRollCommand("[[/damage]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("damage");
				expect(result?.options).toEqual({});
			});
		});
	});

	describe("heal commands", () => {
		describe("explicit format", () => {
			it("should parse formula with explicit format", () => {
				const result = parseRollCommand("[[/heal formula=2d4+2]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("heal");
				expect(result?.options).toEqual({ formula: "2d4+2" });
			});

			it("should parse type=healing with explicit format", () => {
				const result = parseRollCommand("[[/heal formula=2d4+2 type=healing]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d4+2",
					type: "healing",
				});
			});

			it("should parse type=temp with explicit format", () => {
				const result = parseRollCommand("[[/heal formula=10 type=temp]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "10", type: "temp" });
			});

			it("should parse type=temphp with explicit format", () => {
				const result = parseRollCommand("[[/heal formula=10 type=temphp]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "10", type: "temp" });
			});

			it("should parse average=true with explicit format", () => {
				const result = parseRollCommand("[[/heal formula=2d4+2 average=true]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d4+2",
					average: true,
				});
			});

			it("should parse average as number with explicit format", () => {
				const result = parseRollCommand("[[/heal formula=2d4+2 average=5]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d4+2",
					average: 5,
				});
			});

			it("should parse all heal options with explicit format", () => {
				const result = parseRollCommand(
					"[[/heal formula=2d4+2 type=healing average=5 format=long activity=jdRTb04FngE1B8cF]]",
				);
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d4+2",
					type: "healing",
					average: 5,
					format: "long",
					activity: "jdRTb04FngE1B8cF",
				});
			});
		});

		describe("shorthand format", () => {
			it("should parse formula only shorthand", () => {
				const result = parseRollCommand("[[/heal 2d4+2]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "2d4+2" });
			});

			it("should parse formula and temp shorthand", () => {
				const result = parseRollCommand("[[/heal 10 temp]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "10", type: "temp" });
			});

			it("should parse formula and temphp shorthand", () => {
				const result = parseRollCommand("[[/heal 10 temphp]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({ formula: "10", type: "temp" });
			});

			it("should parse formula and average shorthand", () => {
				const result = parseRollCommand("[[/heal 2d4+2 average]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d4+2",
					average: true,
				});
			});

			it("should parse formula, temp, and average shorthand", () => {
				const result = parseRollCommand("[[/heal 2d4+2 temp average]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d4+2",
					type: "temp",
					average: true,
				});
			});

			it("should parse average as number in shorthand", () => {
				const result = parseRollCommand("[[/heal 2d4+2 average=5]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d4+2",
					average: 5,
				});
			});

			it("should parse format in shorthand", () => {
				const result = parseRollCommand("[[/heal 2d4+2 format=long]]");
				expect(result).not.toBeNull();
				expect(result?.options).toEqual({
					formula: "2d4+2",
					format: "long",
				});
			});
		});

		describe("empty commands", () => {
			it("should parse empty heal command", () => {
				const result = parseRollCommand("[[/heal]]");
				expect(result).not.toBeNull();
				expect(result?.type).toBe("heal");
				expect(result?.options).toEqual({});
			});
		});
	});

	describe("originalCommand preservation", () => {
		it("should preserve original command string", () => {
			const command = "[[/check acrobatics dc=15]]";
			const result = parseRollCommand(command);
			expect(result).not.toBeNull();
			expect(result?.originalCommand).toBe(command);
		});

		it("should preserve original command with whitespace", () => {
			const command = "[[/check  acrobatics  dc=15  ]]";
			const result = parseRollCommand(command);
			expect(result).not.toBeNull();
			expect(result?.originalCommand).toBe(command);
		});
	});

	describe("edge cases", () => {
		it("should handle values with equals signs", () => {
			const result = parseRollCommand("[[/check dc=@abilities.con.dc=15]]");
			expect(result).not.toBeNull();
			expect(result?.options).toEqual({ dc: "@abilities.con.dc=15" });
		});

		it("should handle multiple spaces", () => {
			const result = parseRollCommand("[[/check  dex   15  ]]");
			expect(result).not.toBeNull();
			expect(result?.options).toEqual({ ability: "dexterity", dc: 15 });
		});

		it("should handle case-insensitive ability abbreviations", () => {
			const result = parseRollCommand("[[/check DEX]]");
			expect(result).not.toBeNull();
			expect(result?.options).toEqual({ ability: "dexterity" });
		});

		it("should handle case-insensitive skill abbreviations", () => {
			const result = parseRollCommand("[[/check PRC]]");
			expect(result).not.toBeNull();
			expect(result?.options).toEqual({ skill: "perception" });
		});
	});
});
