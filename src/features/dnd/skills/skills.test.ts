import { describe, expect, it } from "vitest";
import { isSkill, normalizeSkill, SKILL_ABBREVIATIONS, SKILLS } from "./skills";

describe("SKILLS", () => {
	it("should contain all 18 D&D 5e skills", () => {
		expect(SKILLS).toHaveLength(18);
	});

	it("should contain expected skill names", () => {
		const expectedSkills = [
			"acrobatics",
			"animal-handling",
			"arcana",
			"athletics",
			"deception",
			"history",
			"insight",
			"intimidation",
			"investigation",
			"medicine",
			"nature",
			"perception",
			"performance",
			"persuasion",
			"religion",
			"sleight-of-hand",
			"stealth",
			"survival",
		];
		expectedSkills.forEach((skill) => {
			expect(SKILLS).toContain(skill);
		});
	});

	it("should have all skills in lowercase with hyphens", () => {
		SKILLS.forEach((skill) => {
			expect(skill).toBe(skill.toLowerCase());
			expect(skill).not.toMatch(/[A-Z]/);
		});
	});
});

describe("SKILL_ABBREVIATIONS", () => {
	it("should map abbreviations to full skill names", () => {
		expect(SKILL_ABBREVIATIONS.acr).toBe("acrobatics");
		expect(SKILL_ABBREVIATIONS.ath).toBe("athletics");
		expect(SKILL_ABBREVIATIONS.dec).toBe("deception");
		expect(SKILL_ABBREVIATIONS.ins).toBe("insight");
		expect(SKILL_ABBREVIATIONS.itm).toBe("intimidation");
		expect(SKILL_ABBREVIATIONS.inv).toBe("investigation");
		expect(SKILL_ABBREVIATIONS.prc).toBe("perception");
		expect(SKILL_ABBREVIATIONS.prf).toBe("performance");
		expect(SKILL_ABBREVIATIONS.per).toBe("persuasion");
		expect(SKILL_ABBREVIATIONS.slh).toBe("sleight-of-hand");
		expect(SKILL_ABBREVIATIONS.ste).toBe("stealth");
		expect(SKILL_ABBREVIATIONS.sur).toBe("survival");
	});

	it("should have all mapped values be valid skills", () => {
		Object.values(SKILL_ABBREVIATIONS).forEach((skill) => {
			expect(SKILLS).toContain(skill);
		});
	});
});

describe("normalizeSkill", () => {
	describe("with abbreviations", () => {
		it("should normalize abbreviations to full skill names", () => {
			expect(normalizeSkill("acr")).toBe("acrobatics");
			expect(normalizeSkill("ath")).toBe("athletics");
			expect(normalizeSkill("dec")).toBe("deception");
			expect(normalizeSkill("ins")).toBe("insight");
			expect(normalizeSkill("itm")).toBe("intimidation");
			expect(normalizeSkill("inv")).toBe("investigation");
			expect(normalizeSkill("prc")).toBe("perception");
			expect(normalizeSkill("prf")).toBe("performance");
			expect(normalizeSkill("per")).toBe("persuasion");
			expect(normalizeSkill("slh")).toBe("sleight-of-hand");
			expect(normalizeSkill("ste")).toBe("stealth");
			expect(normalizeSkill("sur")).toBe("survival");
		});

		it("should handle uppercase abbreviations", () => {
			expect(normalizeSkill("ACR")).toBe("acrobatics");
			expect(normalizeSkill("ATH")).toBe("athletics");
			expect(normalizeSkill("PrC")).toBe("perception");
		});
	});

	describe("with full skill names", () => {
		it("should normalize full skill names to lowercase", () => {
			expect(normalizeSkill("Acrobatics")).toBe("acrobatics");
			expect(normalizeSkill("ATHLETICS")).toBe("athletics");
			expect(normalizeSkill("Perception")).toBe("perception");
			expect(normalizeSkill("SLEIGHT-OF-HAND")).toBe("sleight-of-hand");
		});

		it("should return lowercase skill names as-is", () => {
			expect(normalizeSkill("acrobatics")).toBe("acrobatics");
			expect(normalizeSkill("athletics")).toBe("athletics");
			expect(normalizeSkill("perception")).toBe("perception");
		});
	});

	describe("with arrays", () => {
		it("should normalize each skill in an array and join with spaces", () => {
			expect(normalizeSkill(["acr", "ath"])).toBe("acrobatics athletics");
			expect(normalizeSkill(["ACR", "perception"])).toBe(
				"acrobatics perception",
			);
			expect(normalizeSkill(["prc", "ins", "inv"])).toBe(
				"perception insight investigation",
			);
		});

		it("should handle single-element arrays", () => {
			expect(normalizeSkill(["acr"])).toBe("acrobatics");
			expect(normalizeSkill(["perception"])).toBe("perception");
		});

		it("should handle empty arrays", () => {
			expect(normalizeSkill([])).toBe("");
		});
	});

	describe("with unrecognized strings", () => {
		it("should return unrecognized strings as-is", () => {
			expect(normalizeSkill("invalid-skill")).toBe("invalid-skill");
			expect(normalizeSkill("xyz")).toBe("xyz");
			expect(normalizeSkill("not-a-skill")).toBe("not-a-skill");
		});

		it("should return unrecognized strings in arrays as-is", () => {
			expect(normalizeSkill(["acr", "invalid"])).toBe("acrobatics invalid");
			expect(normalizeSkill(["invalid", "also-invalid"])).toBe(
				"invalid also-invalid",
			);
		});
	});
});

describe("isSkill", () => {
	describe("with valid full skill names", () => {
		it("should return true for all valid skills", () => {
			SKILLS.forEach((skill) => {
				expect(isSkill(skill)).toBe(true);
			});
		});

		it("should return false for case-varied full skill names (case-sensitive check)", () => {
			// Note: isSkill only checks abbreviations case-insensitively, not full names
			expect(isSkill("Acrobatics")).toBe(false);
			expect(isSkill("ATHLETICS")).toBe(false);
			expect(isSkill("Perception")).toBe(false);
			expect(isSkill("SLEIGHT-OF-HAND")).toBe(false);
		});
	});

	describe("with valid abbreviations", () => {
		it("should return true for all valid abbreviations", () => {
			Object.keys(SKILL_ABBREVIATIONS).forEach((abbr) => {
				expect(isSkill(abbr)).toBe(true);
			});
		});

		it("should handle case-insensitive abbreviations", () => {
			expect(isSkill("ACR")).toBe(true);
			expect(isSkill("Ath")).toBe(true);
			expect(isSkill("PrC")).toBe(true);
		});
	});

	describe("with invalid strings", () => {
		it("should return false for unrecognized strings", () => {
			expect(isSkill("invalid-skill")).toBe(false);
			expect(isSkill("xyz")).toBe(false);
			expect(isSkill("not-a-skill")).toBe(false);
			expect(isSkill("")).toBe(false);
		});

		it("should return false for partial matches", () => {
			expect(isSkill("acrobati")).toBe(false);
			expect(isSkill("athlet")).toBe(false);
			expect(isSkill("ac")).toBe(false);
		});

		it("should return false for skills with extra characters", () => {
			expect(isSkill("acrobatics-extra")).toBe(false);
			expect(isSkill("athletics123")).toBe(false);
		});
	});
});
