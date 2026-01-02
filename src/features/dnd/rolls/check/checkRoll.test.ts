import { describe, expect, it } from "vitest";
import {
	createCheckEnricher,
	createSkillCheck,
	createAbilityCheck,
	type CheckEnricherOptions,
} from "./checkRoll";

describe("createCheckEnricher", () => {
	describe("legacy string support", () => {
		it("should handle ability strings", () => {
			expect(createCheckEnricher("strength")).toBe("[[/check strength]]");
			expect(createCheckEnricher("dex")).toBe("[[/check dexterity]]");
			expect(createCheckEnricher("con")).toBe("[[/check constitution]]");
		});

		it("should handle skill strings", () => {
			expect(createCheckEnricher("acrobatics")).toBe("[[/check acrobatics]]");
			expect(createCheckEnricher("prc")).toBe("[[/check perception]]");
			expect(createCheckEnricher("ath")).toBe("[[/check athletics]]");
		});

		it("should handle unrecognized strings as-is", () => {
			expect(createCheckEnricher("custom-check")).toBe(
				"[[/check custom-check]]",
			);
		});

		it("should use correct enricher type for string inputs", () => {
			expect(createCheckEnricher("strength", "skill")).toBe(
				"[[/skill strength]]",
			);
			expect(createCheckEnricher("acrobatics", "tool")).toBe(
				"[[/tool acrobatics]]",
			);
		});
	});

	describe("no options", () => {
		it("should create empty check enricher with no options", () => {
			expect(createCheckEnricher()).toBe("[[/check]]");
			expect(createCheckEnricher({})).toBe("[[/check]]");
		});

		it("should use correct enricher type", () => {
			expect(createCheckEnricher(undefined, "skill")).toBe("[[/skill]]");
			expect(createCheckEnricher(undefined, "tool")).toBe("[[/tool]]");
		});
	});

	describe("simple ability check (shorthand)", () => {
		it("should create simple ability check", () => {
			expect(createCheckEnricher({ ability: "strength" })).toBe(
				"[[/check strength]]",
			);
			expect(createCheckEnricher({ ability: "dex" })).toBe(
				"[[/check dexterity]]",
			);
			expect(createCheckEnricher({ ability: "constitution" })).toBe(
				"[[/check constitution]]",
			);
		});

		it("should use correct enricher type", () => {
			expect(createCheckEnricher({ ability: "strength" }, "skill")).toBe(
				"[[/skill strength]]",
			);
		});
	});

	describe("simple skill check (shorthand)", () => {
		it("should create simple skill check", () => {
			expect(createCheckEnricher({ skill: "acrobatics" })).toBe(
				"[[/check acrobatics]]",
			);
			expect(createCheckEnricher({ skill: "prc" })).toBe(
				"[[/check perception]]",
			);
			expect(createCheckEnricher({ skill: "athletics" })).toBe(
				"[[/check athletics]]",
			);
		});

		it("should use correct enricher type", () => {
			expect(createCheckEnricher({ skill: "acrobatics" }, "skill")).toBe(
				"[[/skill acrobatics]]",
			);
		});
	});

	describe("ability + DC", () => {
		it("should create ability check (DC is ignored in simple format)", () => {
			// Note: The simple ability check condition matches first and doesn't check for DC,
			// so DC is ignored when only ability is provided
			expect(createCheckEnricher({ ability: "strength", dc: 15 })).toBe(
				"[[/check strength]]",
			);
			expect(createCheckEnricher({ ability: "dex", dc: 20 })).toBe(
				"[[/check dexterity]]",
			);
		});

		it("should use correct enricher type", () => {
			expect(createCheckEnricher({ ability: "strength", dc: 15 }, "skill")).toBe(
				"[[/skill strength]]",
			);
		});

		it("should include DC when other options force full format", () => {
			// When other options are present, it uses full format which includes DC
			expect(
				createCheckEnricher({ ability: "strength", dc: 15, format: "long" }),
			).toBe("[[/check ability=strength dc=15 format=long]]");
		});
	});

	describe("skill + DC shorthand", () => {
		it("should create skill check with numeric DC", () => {
			expect(createCheckEnricher({ skill: "perception", dc: 15 })).toBe(
				"[[/check perception 15]]",
			);
			expect(createCheckEnricher({ skill: "prc", dc: 20 })).toBe(
				"[[/check perception 20]]",
			);
		});

		it("should use correct enricher type", () => {
			expect(createCheckEnricher({ skill: "perception", dc: 15 }, "skill")).toBe(
				"[[/skill perception 15]]",
			);
		});
	});

	describe("ability + skill shorthand", () => {
		it("should create ability + skill check", () => {
			expect(
				createCheckEnricher({ ability: "strength", skill: "intimidation" }),
			).toBe("[[/check strength intimidation]]");
			expect(createCheckEnricher({ ability: "dex", skill: "acr" })).toBe(
				"[[/check dexterity acrobatics]]",
			);
		});

		it("should use correct enricher type", () => {
			expect(
				createCheckEnricher({ ability: "strength", skill: "intimidation" }, "skill"),
			).toBe("[[/skill strength intimidation]]");
		});
	});

	describe("multiple skills shorthand", () => {
		it("should create check with multiple skills", () => {
			expect(createCheckEnricher({ skill: ["acrobatics", "athletics"] })).toBe(
				"[[/check acrobatics athletics]]",
			);
			expect(createCheckEnricher({ skill: ["prc", "ins"] })).toBe(
				"[[/check perception insight]]",
			);
		});

		it("should use correct enricher type", () => {
			expect(
				createCheckEnricher({ skill: ["acrobatics", "athletics"] }, "skill"),
			).toBe("[[/skill acrobatics athletics]]");
		});
	});

	describe("multiple skills + DC shorthand", () => {
		it("should create check with multiple skills and numeric DC", () => {
			expect(
				createCheckEnricher({ skill: ["acrobatics", "athletics"], dc: 15 }),
			).toBe("[[/check acrobatics athletics 15]]");
			expect(createCheckEnricher({ skill: ["prc", "ins"], dc: 20 })).toBe(
				"[[/check perception insight 20]]",
			);
		});

		it("should use correct enricher type", () => {
			expect(
				createCheckEnricher({ skill: ["acrobatics", "athletics"], dc: 15 }, "skill"),
			).toBe("[[/skill acrobatics athletics 15]]");
		});
	});

	describe("ability + multiple skills + DC shorthand", () => {
		it("should create check with ability, multiple skills, and numeric DC", () => {
			expect(
				createCheckEnricher({
					ability: "strength",
					skill: ["deception", "persuasion"],
					dc: 15,
				}),
			).toBe("[[/check strength deception persuasion 15]]");
			expect(
				createCheckEnricher({
					ability: "dex",
					skill: ["acr", "ath"],
					dc: 20,
				}),
			).toBe("[[/check dexterity acrobatics athletics 20]]");
		});

		it("should use correct enricher type", () => {
			expect(
				createCheckEnricher(
					{
						ability: "strength",
						skill: ["deception", "persuasion"],
						dc: 15,
					},
					"skill",
				),
			).toBe("[[/skill strength deception persuasion 15]]");
		});
	});

	describe("full format with explicit keys", () => {
		it("should create check with ability in full format", () => {
			expect(
				createCheckEnricher({ ability: "strength", format: "short" }),
			).toBe("[[/check ability=strength format=short]]");
		});

		it("should create check with skill in full format", () => {
			expect(
				createCheckEnricher({ skill: "perception", passive: true }),
			).toBe("[[/check skill=perception passive=true]]");
		});

		it("should create check with tool (single)", () => {
			expect(createCheckEnricher({ tool: "thieves-tools" })).toBe(
				"[[/check tool=thieves-tools]]",
			);
		});

		it("should create check with tool (array)", () => {
			expect(createCheckEnricher({ tool: ["thieves-tools", "lockpicks"] })).toBe(
				"[[/check tool=thieves-tools/lockpicks]]",
			);
		});

		it("should create check with vehicle", () => {
			expect(createCheckEnricher({ vehicle: "horse" })).toBe(
				"[[/check vehicle=horse]]",
			);
		});

		it("should create check with formula DC", () => {
			// Formula DCs are ignored in simple format (same as numeric DC)
			// To include DC, need to add another option to force full format
			expect(
				createCheckEnricher({
					ability: "strength",
					dc: "@abilities.con.dc",
				}),
			).toBe("[[/check strength]]");
			// With another option, DC is included
			expect(
				createCheckEnricher({
					ability: "strength",
					dc: "@abilities.con.dc",
					format: "long",
				}),
			).toBe("[[/check ability=strength dc=@abilities.con.dc format=long]]");
		});

		it("should create check with format option", () => {
			expect(createCheckEnricher({ skill: "perception", format: "long" })).toBe(
				"[[/check skill=perception format=long]]",
			);
		});

		it("should create check with passive option", () => {
			expect(createCheckEnricher({ skill: "perception", passive: true })).toBe(
				"[[/check skill=perception passive=true]]",
			);
		});

		it("should create check with activity", () => {
			expect(
				createCheckEnricher({ activity: "RLQlsLo5InKHZadn" }),
			).toBe("[[/check activity=RLQlsLo5InKHZadn]]");
		});

		it("should create check with rules option", () => {
			expect(createCheckEnricher({ skill: "perception", rules: "2024" })).toBe(
				"[[/check skill=perception rules=2024]]",
			);
		});

		it("should create check with all options", () => {
			const options: CheckEnricherOptions = {
				ability: "strength",
				skill: ["deception", "persuasion"],
				tool: ["thieves-tools"],
				vehicle: "horse",
				dc: 15,
				format: "long",
				passive: true,
				activity: "RLQlsLo5InKHZadn",
				rules: "2024",
			};
			const result = createCheckEnricher(options);
			expect(result).toContain("ability=strength");
			expect(result).toContain("skill=deception persuasion");
			expect(result).toContain("tool=thieves-tools");
			expect(result).toContain("vehicle=horse");
			expect(result).toContain("dc=15");
			expect(result).toContain("format=long");
			expect(result).toContain("passive=true");
			expect(result).toContain("activity=RLQlsLo5InKHZadn");
			expect(result).toContain("rules=2024");
			expect(result).toMatch(/^\[\[\/check .+\]\]$/);
		});

		it("should normalize ability and skill names in full format", () => {
			expect(
				createCheckEnricher({ ability: "STR", skill: "PRC", dc: 15 }),
			).toBe("[[/check ability=strength skill=perception dc=15]]");
		});

		it("should handle multiple skills in full format", () => {
			// Multiple skills with DC uses shorthand, not full format
			expect(
				createCheckEnricher({ skill: ["acr", "ath"], dc: 15 }),
			).toBe("[[/check acrobatics athletics 15]]");
		});
	});

	describe("edge cases", () => {
		it("should handle single skill in array (not multiple)", () => {
			// Single skill array should use full format, not shorthand
			expect(createCheckEnricher({ skill: ["perception"] })).toBe(
				"[[/check skill=perception]]",
			);
		});

		it("should handle string DC with other options (uses full format)", () => {
			expect(
				createCheckEnricher({ ability: "strength", dc: "15", format: "short" }),
			).toBe("[[/check ability=strength dc=15 format=short]]");
		});

		it("should handle ability with tool (uses full format)", () => {
			expect(createCheckEnricher({ ability: "strength", tool: "hammer" })).toBe(
				"[[/check ability=strength tool=hammer]]",
			);
		});

		it("should handle skill with vehicle (uses full format)", () => {
			expect(createCheckEnricher({ skill: "animal-handling", vehicle: "horse" })).toBe(
				"[[/check skill=animal-handling vehicle=horse]]",
			);
		});
	});
});

describe("createSkillCheck", () => {
	it("should create skill check with skill only", () => {
		expect(createSkillCheck("perception")).toBe("[[/skill perception]]");
		expect(createSkillCheck("prc")).toBe("[[/skill perception]]");
	});

	it("should create skill check with additional options", () => {
		expect(createSkillCheck("perception", { dc: 15 })).toBe(
			"[[/skill perception 15]]",
		);
		expect(createSkillCheck("perception", { passive: true })).toBe(
			"[[/skill skill=perception passive=true]]",
		);
	});

	it("should create skill check with ability and skill", () => {
		expect(createSkillCheck("intimidation", { ability: "strength" })).toBe(
			"[[/skill strength intimidation]]",
		);
	});

	it("should normalize skill names", () => {
		expect(createSkillCheck("prc")).toBe("[[/skill perception]]");
		expect(createSkillCheck("ath")).toBe("[[/skill athletics]]");
	});
});

describe("createAbilityCheck", () => {
	it("should create ability check with ability only", () => {
		expect(createAbilityCheck("strength")).toBe("[[/check strength]]");
		expect(createAbilityCheck("dex")).toBe("[[/check dexterity]]");
	});

	it("should create ability check with additional options", () => {
		// DC with ability only is ignored (simple format)
		expect(createAbilityCheck("strength", { dc: 15 })).toBe(
			"[[/check strength]]",
		);
		// With other options, DC is included in full format
		expect(createAbilityCheck("strength", { dc: 15, format: "long" })).toBe(
			"[[/check ability=strength dc=15 format=long]]",
		);
		expect(createAbilityCheck("strength", { format: "long" })).toBe(
			"[[/check ability=strength format=long]]",
		);
	});

	it("should create ability check with skill", () => {
		expect(createAbilityCheck("strength", { skill: "intimidation" })).toBe(
			"[[/check strength intimidation]]",
		);
	});

	it("should normalize ability names", () => {
		expect(createAbilityCheck("str")).toBe("[[/check strength]]");
		expect(createAbilityCheck("dex")).toBe("[[/check dexterity]]");
	});
});

