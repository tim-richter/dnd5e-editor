import { describe, expect, it } from "vitest";
import {
	createConcentrationEnricher,
	createSaveEnricher,
	type SaveEnricherOptions,
} from "./saveRoll";

describe("createSaveEnricher", () => {
	describe("legacy string support", () => {
		it("should handle ability strings", () => {
			expect(createSaveEnricher("strength")).toBe("[[/save strength]]");
			expect(createSaveEnricher("dex")).toBe("[[/save dexterity]]");
			expect(createSaveEnricher("con")).toBe("[[/save constitution]]");
		});

		it("should handle unrecognized strings as-is", () => {
			expect(createSaveEnricher("custom-ability")).toBe(
				"[[/save custom-ability]]",
			);
		});

		it("should normalize ability abbreviations", () => {
			expect(createSaveEnricher("str")).toBe("[[/save strength]]");
			expect(createSaveEnricher("DEX")).toBe("[[/save dexterity]]");
			expect(createSaveEnricher("Con")).toBe("[[/save constitution]]");
		});
	});

	describe("no options", () => {
		it("should create empty save enricher with no options", () => {
			expect(createSaveEnricher()).toBe("[[/save]]");
			expect(createSaveEnricher({})).toBe("[[/save]]");
		});

		it("should create empty save enricher for activity lookup", () => {
			// Empty save enricher auto-detects activity
			expect(createSaveEnricher()).toBe("[[/save]]");
		});
	});

	describe("simple ability save (shorthand)", () => {
		it("should create simple ability save", () => {
			expect(createSaveEnricher({ ability: "strength" })).toBe(
				"[[/save strength]]",
			);
			expect(createSaveEnricher({ ability: "dex" })).toBe(
				"[[/save dexterity]]",
			);
			expect(createSaveEnricher({ ability: "constitution" })).toBe(
				"[[/save constitution]]",
			);
		});

		it("should normalize ability names", () => {
			expect(createSaveEnricher({ ability: "STR" })).toBe("[[/save strength]]");
			expect(createSaveEnricher({ ability: "Dexterity" })).toBe(
				"[[/save dexterity]]",
			);
		});
	});

	describe("ability + DC shorthand", () => {
		it("should create ability save with numeric DC", () => {
			expect(createSaveEnricher({ ability: "dexterity", dc: 15 })).toBe(
				"[[/save dexterity 15]]",
			);
			expect(createSaveEnricher({ ability: "dex", dc: 20 })).toBe(
				"[[/save dexterity 20]]",
			);
		});

		it("should normalize ability names in shorthand", () => {
			expect(createSaveEnricher({ ability: "str", dc: 15 })).toBe(
				"[[/save strength 15]]",
			);
		});
	});

	describe("multiple abilities shorthand", () => {
		it("should create save with multiple abilities", () => {
			expect(createSaveEnricher({ ability: ["strength", "dexterity"] })).toBe(
				"[[/save strength dexterity]]",
			);
			expect(createSaveEnricher({ ability: ["str", "dex"] })).toBe(
				"[[/save strength dexterity]]",
			);
		});

		it("should normalize ability names in multiple abilities", () => {
			expect(createSaveEnricher({ ability: ["STR", "DEX", "CON"] })).toBe(
				"[[/save strength dexterity constitution]]",
			);
		});
	});

	describe("multiple abilities + DC shorthand", () => {
		it("should create save with multiple abilities and numeric DC", () => {
			expect(
				createSaveEnricher({ ability: ["strength", "dexterity"], dc: 20 }),
			).toBe("[[/save strength dexterity 20]]");
			expect(createSaveEnricher({ ability: ["str", "dex"], dc: 15 })).toBe(
				"[[/save strength dexterity 15]]",
			);
		});

		it("should normalize ability names in multiple abilities with DC", () => {
			expect(createSaveEnricher({ ability: ["STR", "DEX"], dc: 20 })).toBe(
				"[[/save strength dexterity 20]]",
			);
		});
	});

	describe("full format with explicit keys", () => {
		it("should create save with ability in full format", () => {
			expect(createSaveEnricher({ ability: "strength", format: "short" })).toBe(
				"[[/save ability=strength format=short]]",
			);
		});

		it("should create save with multiple abilities in full format", () => {
			expect(
				createSaveEnricher({
					ability: ["strength", "dexterity"],
					format: "long",
				}),
			).toBe("[[/save ability=strength/dexterity format=long]]");
		});

		it("should create save with numeric DC in full format", () => {
			expect(
				createSaveEnricher({ ability: "dexterity", dc: 15, format: "long" }),
			).toBe("[[/save ability=dexterity dc=15 format=long]]");
		});

		it("should create save with formula DC in full format", () => {
			expect(
				createSaveEnricher({
					ability: "dexterity",
					dc: "@abilities.con.dc",
				}),
			).toBe("[[/save ability=dexterity dc=@abilities.con.dc]]");
		});

		it("should create save with format option", () => {
			expect(createSaveEnricher({ ability: "dexterity", format: "long" })).toBe(
				"[[/save ability=dexterity format=long]]",
			);
			expect(
				createSaveEnricher({ ability: "dexterity", format: "short" }),
			).toBe("[[/save ability=dexterity format=short]]");
		});

		it("should create save with activity", () => {
			expect(createSaveEnricher({ activity: "RLQlsLo5InKHZadn" })).toBe(
				"[[/save activity=RLQlsLo5InKHZadn]]",
			);
		});

		it("should create save with all options", () => {
			const options: SaveEnricherOptions = {
				ability: "dexterity",
				dc: 15,
				format: "long",
				activity: "RLQlsLo5InKHZadn",
			};
			const result = createSaveEnricher(options);
			expect(result).toContain("ability=dexterity");
			expect(result).toContain("dc=15");
			expect(result).toContain("format=long");
			expect(result).toContain("activity=RLQlsLo5InKHZadn");
			expect(result).toMatch(/^\[\[\/save .+\]\]$/);
		});

		it("should normalize ability names in full format", () => {
			expect(
				createSaveEnricher({ ability: "STR", dc: 15, format: "long" }),
			).toBe("[[/save ability=strength dc=15 format=long]]");
		});

		it("should handle multiple abilities in full format", () => {
			expect(
				createSaveEnricher({
					ability: ["str", "dex"],
					dc: 20,
					format: "long",
				}),
			).toBe("[[/save ability=strength/dexterity dc=20 format=long]]");
		});
	});

	describe("edge cases", () => {
		it("should handle single ability in array (not multiple)", () => {
			// Single ability array should use full format, not shorthand
			expect(createSaveEnricher({ ability: ["dexterity"] })).toBe(
				"[[/save ability=dexterity]]",
			);
		});

		it("should handle string DC with other options (uses full format)", () => {
			expect(
				createSaveEnricher({ ability: "strength", dc: "15", format: "short" }),
			).toBe("[[/save ability=strength dc=15 format=short]]");
		});

		it("should handle ability with activity (uses full format)", () => {
			expect(
				createSaveEnricher({
					ability: "dexterity",
					activity: "RLQlsLo5InKHZadn",
				}),
			).toBe("[[/save ability=dexterity activity=RLQlsLo5InKHZadn]]");
		});

		it("should handle ability with format (uses full format)", () => {
			expect(createSaveEnricher({ ability: "dexterity", format: "long" })).toBe(
				"[[/save ability=dexterity format=long]]",
			);
		});

		it("should handle formula DC with ability (uses full format)", () => {
			expect(
				createSaveEnricher({
					ability: "dexterity",
					dc: "@abilities.con.dc",
				}),
			).toBe("[[/save ability=dexterity dc=@abilities.con.dc]]");
		});

		it("should handle all six abilities", () => {
			const abilities = [
				"strength",
				"dexterity",
				"constitution",
				"intelligence",
				"wisdom",
				"charisma",
			];
			abilities.forEach((ability) => {
				expect(createSaveEnricher({ ability })).toBe(`[[/save ${ability}]]`);
			});
		});

		it("should handle all ability abbreviations", () => {
			const abbreviations = ["str", "dex", "con", "int", "wis", "cha"];
			const fullNames = [
				"strength",
				"dexterity",
				"constitution",
				"intelligence",
				"wisdom",
				"charisma",
			];
			abbreviations.forEach((abbr, index) => {
				expect(createSaveEnricher({ ability: abbr })).toBe(
					`[[/save ${fullNames[index]}]]`,
				);
			});
		});
	});
});

describe("createConcentrationEnricher", () => {
	describe("no options", () => {
		it("should create empty concentration enricher with no options", () => {
			expect(createConcentrationEnricher()).toBe("[[/concentration]]");
			expect(createConcentrationEnricher({})).toBe("[[/concentration]]");
		});
	});

	describe("legacy string support", () => {
		it("should handle ability strings", () => {
			expect(createConcentrationEnricher("charisma")).toBe(
				"[[/concentration charisma]]",
			);
			expect(createConcentrationEnricher("cha")).toBe(
				"[[/concentration charisma]]",
			);
		});

		it("should normalize ability abbreviations", () => {
			expect(createConcentrationEnricher("CHA")).toBe(
				"[[/concentration charisma]]",
			);
		});
	});

	describe("with DC", () => {
		it("should create concentration save with numeric DC", () => {
			expect(createConcentrationEnricher({ dc: 15 })).toBe(
				"[[/concentration dc=15]]",
			);
			expect(createConcentrationEnricher({ dc: 20 })).toBe(
				"[[/concentration dc=20]]",
			);
		});

		it("should create concentration save with formula DC", () => {
			expect(createConcentrationEnricher({ dc: "@abilities.con.dc" })).toBe(
				"[[/concentration dc=@abilities.con.dc]]",
			);
		});
	});

	describe("with ability override", () => {
		it("should create concentration save with ability override (shorthand)", () => {
			expect(createConcentrationEnricher({ ability: "charisma" })).toBe(
				"[[/concentration charisma]]",
			);
			expect(createConcentrationEnricher({ ability: "cha" })).toBe(
				"[[/concentration charisma]]",
			);
		});

		it("should create concentration save with ability and DC (shorthand)", () => {
			expect(createConcentrationEnricher({ ability: "charisma", dc: 15 })).toBe(
				"[[/concentration charisma 15]]",
			);
		});

		it("should normalize ability names", () => {
			expect(createConcentrationEnricher({ ability: "CHA" })).toBe(
				"[[/concentration charisma]]",
			);
		});
	});

	describe("with format", () => {
		it("should create concentration save with format", () => {
			expect(createConcentrationEnricher({ format: "long" })).toBe(
				"[[/concentration format=long]]",
			);
			expect(createConcentrationEnricher({ format: "short" })).toBe(
				"[[/concentration format=short]]",
			);
		});

		it("should create concentration save with ability and format", () => {
			expect(
				createConcentrationEnricher({ ability: "charisma", format: "long" }),
			).toBe("[[/concentration ability=charisma format=long]]");
		});
	});

	describe("with all options", () => {
		it("should create concentration save with all options", () => {
			const options: SaveEnricherOptions = {
				ability: "charisma",
				dc: 15,
				format: "long",
			};
			const result = createConcentrationEnricher(options);
			expect(result).toContain("ability=charisma");
			expect(result).toContain("dc=15");
			expect(result).toContain("format=long");
			expect(result).toMatch(/^\[\[\/concentration .+\]\]$/);
		});
	});

	describe("edge cases", () => {
		it("should handle multiple abilities (uses shorthand)", () => {
			expect(
				createConcentrationEnricher({ ability: ["charisma", "wisdom"] }),
			).toBe("[[/concentration charisma wisdom]]");
		});

		it("should handle multiple abilities with DC (uses shorthand)", () => {
			expect(
				createConcentrationEnricher({
					ability: ["charisma", "wisdom"],
					dc: 15,
				}),
			).toBe("[[/concentration charisma wisdom 15]]");
		});

		it("should handle multiple abilities with format (uses full format)", () => {
			expect(
				createConcentrationEnricher({
					ability: ["charisma", "wisdom"],
					format: "long",
				}),
			).toBe("[[/concentration ability=charisma/wisdom format=long]]");
		});

		it("should handle numeric DC shorthand", () => {
			// When only DC is provided with no other options, it uses full format
			expect(createConcentrationEnricher({ dc: 15 })).toBe(
				"[[/concentration dc=15]]",
			);
		});
	});
});
