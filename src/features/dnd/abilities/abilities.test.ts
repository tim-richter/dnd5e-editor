import { describe, expect, it } from "vitest";
import {
	ABILITIES,
	ABILITY_ABBREVIATIONS,
	isAbility,
	normalizeAbility,
} from "./abilities";

describe("ABILITIES", () => {
	it("should contain all 6 D&D 5e abilities", () => {
		expect(ABILITIES).toHaveLength(6);
	});

	it("should contain expected ability names", () => {
		const expectedAbilities = [
			"strength",
			"dexterity",
			"constitution",
			"intelligence",
			"wisdom",
			"charisma",
		];
		expectedAbilities.forEach((ability) => {
			expect(ABILITIES).toContain(ability);
		});
	});

	it("should have all abilities in lowercase", () => {
		ABILITIES.forEach((ability) => {
			expect(ability).toBe(ability.toLowerCase());
			expect(ability).not.toMatch(/[A-Z]/);
		});
	});
});

describe("ABILITY_ABBREVIATIONS", () => {
	it("should map abbreviations to full ability names", () => {
		expect(ABILITY_ABBREVIATIONS.str).toBe("strength");
		expect(ABILITY_ABBREVIATIONS.dex).toBe("dexterity");
		expect(ABILITY_ABBREVIATIONS.con).toBe("constitution");
		expect(ABILITY_ABBREVIATIONS.int).toBe("intelligence");
		expect(ABILITY_ABBREVIATIONS.wis).toBe("wisdom");
		expect(ABILITY_ABBREVIATIONS.cha).toBe("charisma");
	});

	it("should have all mapped values be valid abilities", () => {
		Object.values(ABILITY_ABBREVIATIONS).forEach((ability) => {
			expect(ABILITIES).toContain(ability);
		});
	});

	it("should have exactly 6 abbreviations", () => {
		expect(Object.keys(ABILITY_ABBREVIATIONS)).toHaveLength(6);
	});
});

describe("normalizeAbility", () => {
	describe("with abbreviations", () => {
		it("should normalize abbreviations to full ability names", () => {
			expect(normalizeAbility("str")).toBe("strength");
			expect(normalizeAbility("dex")).toBe("dexterity");
			expect(normalizeAbility("con")).toBe("constitution");
			expect(normalizeAbility("int")).toBe("intelligence");
			expect(normalizeAbility("wis")).toBe("wisdom");
			expect(normalizeAbility("cha")).toBe("charisma");
		});

		it("should handle uppercase abbreviations", () => {
			expect(normalizeAbility("STR")).toBe("strength");
			expect(normalizeAbility("DEX")).toBe("dexterity");
			expect(normalizeAbility("Con")).toBe("constitution");
			expect(normalizeAbility("INT")).toBe("intelligence");
			expect(normalizeAbility("WIS")).toBe("wisdom");
			expect(normalizeAbility("CHA")).toBe("charisma");
		});
	});

	describe("with full ability names", () => {
		it("should normalize full ability names to lowercase", () => {
			expect(normalizeAbility("Strength")).toBe("strength");
			expect(normalizeAbility("DEXTERITY")).toBe("dexterity");
			expect(normalizeAbility("Constitution")).toBe("constitution");
			expect(normalizeAbility("INTELLIGENCE")).toBe("intelligence");
			expect(normalizeAbility("Wisdom")).toBe("wisdom");
			expect(normalizeAbility("CHARISMA")).toBe("charisma");
		});

		it("should return lowercase ability names as-is", () => {
			expect(normalizeAbility("strength")).toBe("strength");
			expect(normalizeAbility("dexterity")).toBe("dexterity");
			expect(normalizeAbility("constitution")).toBe("constitution");
			expect(normalizeAbility("intelligence")).toBe("intelligence");
			expect(normalizeAbility("wisdom")).toBe("wisdom");
			expect(normalizeAbility("charisma")).toBe("charisma");
		});
	});

	describe("with unrecognized strings", () => {
		it("should return unrecognized strings as-is", () => {
			expect(normalizeAbility("invalid-ability")).toBe("invalid-ability");
			expect(normalizeAbility("xyz")).toBe("xyz");
			expect(normalizeAbility("not-an-ability")).toBe("not-an-ability");
		});

		it("should return empty string as-is", () => {
			expect(normalizeAbility("")).toBe("");
		});
	});
});

describe("isAbility", () => {
	describe("with valid full ability names", () => {
		it("should return true for all valid abilities", () => {
			ABILITIES.forEach((ability) => {
				expect(isAbility(ability)).toBe(true);
			});
		});

		it("should return false for case-varied full ability names (case-sensitive check)", () => {
			// Note: isAbility only checks abbreviations case-insensitively, not full names
			expect(isAbility("Strength")).toBe(false);
			expect(isAbility("DEXTERITY")).toBe(false);
			expect(isAbility("Constitution")).toBe(false);
			expect(isAbility("INTELLIGENCE")).toBe(false);
			expect(isAbility("Wisdom")).toBe(false);
			expect(isAbility("CHARISMA")).toBe(false);
		});
	});

	describe("with valid abbreviations", () => {
		it("should return true for all valid abbreviations", () => {
			Object.keys(ABILITY_ABBREVIATIONS).forEach((abbr) => {
				expect(isAbility(abbr)).toBe(true);
			});
		});

		it("should handle case-insensitive abbreviations", () => {
			expect(isAbility("STR")).toBe(true);
			expect(isAbility("Dex")).toBe(true);
			expect(isAbility("CON")).toBe(true);
			expect(isAbility("Int")).toBe(true);
			expect(isAbility("WIS")).toBe(true);
			expect(isAbility("Cha")).toBe(true);
		});
	});

	describe("with invalid strings", () => {
		it("should return false for unrecognized strings", () => {
			expect(isAbility("invalid-ability")).toBe(false);
			expect(isAbility("xyz")).toBe(false);
			expect(isAbility("not-an-ability")).toBe(false);
			expect(isAbility("")).toBe(false);
		});

		it("should return false for partial matches", () => {
			expect(isAbility("stren")).toBe(false);
			expect(isAbility("dexter")).toBe(false);
			expect(isAbility("st")).toBe(false);
			expect(isAbility("de")).toBe(false);
		});

		it("should return false for abilities with extra characters", () => {
			expect(isAbility("strength-extra")).toBe(false);
			expect(isAbility("dexterity123")).toBe(false);
		});
	});
});
