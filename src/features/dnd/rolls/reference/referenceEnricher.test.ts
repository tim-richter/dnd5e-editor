import { describe, expect, it } from "vitest";
import { createReferenceEnricher } from "./referenceEnricher";
import {
	ABILITY_REFERENCES,
	CONDITION_REFERENCES,
	DAMAGE_TYPE_REFERENCES,
	SKILL_REFERENCES,
} from "./references";

describe("createReferenceEnricher", () => {
	describe("legacy string support", () => {
		it("should handle rule name strings", () => {
			expect(createReferenceEnricher("prone")).toBe("&Reference[prone]");
			expect(createReferenceEnricher("strength")).toBe(
				"&Reference[strength]",
			);
			expect(createReferenceEnricher("Difficult Terrain")).toBe(
				'&Reference[Difficult Terrain]',
			);
		});

		it("should handle strings with special characters", () => {
			expect(createReferenceEnricher("rule=value")).toBe(
				'&Reference[rule=value]',
			);
		});
	});

	describe("no options", () => {
		it("should create empty reference enricher with no options", () => {
			expect(createReferenceEnricher()).toBe("&Reference[]");
			expect(createReferenceEnricher({})).toBe("&Reference[]");
		});

		it("should create empty reference enricher with only category", () => {
			expect(createReferenceEnricher({ category: "condition" })).toBe(
				"&Reference[condition=]",
			);
		});
	});

	describe("explicit category references", () => {
		describe("condition references", () => {
			it("should create condition reference with explicit category", () => {
				expect(
					createReferenceEnricher({
						category: "condition",
						rule: "prone",
					}),
				).toBe("&Reference[condition=prone]");
				expect(
					createReferenceEnricher({
						category: "condition",
						rule: "blinded",
					}),
				).toBe("&Reference[condition=blinded]");
			});

			it("should normalize condition names", () => {
				expect(
					createReferenceEnricher({
						category: "condition",
						rule: "PRONE",
					}),
				).toBe("&Reference[condition=prone]");
				expect(
					createReferenceEnricher({
						category: "condition",
						rule: "Blinded",
					}),
				).toBe("&Reference[condition=blinded]");
			});

			it("should handle condition with apply=false", () => {
				expect(
					createReferenceEnricher({
						category: "condition",
						rule: "prone",
						apply: false,
					}),
				).toBe("&Reference[condition=prone apply=false]");
			});

			it("should not include apply=true (default)", () => {
				expect(
					createReferenceEnricher({
						category: "condition",
						rule: "prone",
						apply: true,
					}),
				).toBe("&Reference[condition=prone]");
			});
		});

		describe("ability references", () => {
			it("should create ability reference with explicit category", () => {
				expect(
					createReferenceEnricher({
						category: "ability",
						rule: "strength",
					}),
				).toBe("&Reference[ability=strength]");
				expect(
					createReferenceEnricher({
						category: "ability",
						rule: "dexterity",
					}),
				).toBe("&Reference[ability=dexterity]");
			});

			it("should normalize ability names and abbreviations", () => {
				expect(
					createReferenceEnricher({
						category: "ability",
						rule: "str",
					}),
				).toBe("&Reference[ability=strength]");
				expect(
					createReferenceEnricher({
						category: "ability",
						rule: "DEX",
					}),
				).toBe("&Reference[ability=dexterity]");
			});
		});

		describe("skill references", () => {
			it("should create skill reference with explicit category", () => {
				expect(
					createReferenceEnricher({
						category: "skill",
						rule: "acrobatics",
					}),
				).toBe("&Reference[skill=acrobatics]");
				expect(
					createReferenceEnricher({
						category: "skill",
						rule: "perception",
					}),
				).toBe("&Reference[skill=perception]");
			});

			it("should normalize skill names and abbreviations", () => {
				expect(
					createReferenceEnricher({
						category: "skill",
						rule: "prc",
					}),
				).toBe("&Reference[skill=perception]");
				expect(
					createReferenceEnricher({
						category: "skill",
						rule: "ATH",
					}),
				).toBe("&Reference[skill=athletics]");
			});
		});

		describe("damage type references", () => {
			it("should create damage type reference with explicit category", () => {
				expect(
					createReferenceEnricher({
						category: "damageType",
						rule: "fire",
					}),
				).toBe("&Reference[damageType=fire]");
				expect(
					createReferenceEnricher({
						category: "damageType",
						rule: "cold",
					}),
				).toBe("&Reference[damageType=cold]");
			});

			it("should normalize damage type names", () => {
				expect(
					createReferenceEnricher({
						category: "damageType",
						rule: "FIRE",
					}),
				).toBe("&Reference[damageType=fire]");
			});
		});

		describe("generic rule references", () => {
			it("should create generic rule reference with explicit category", () => {
				expect(
					createReferenceEnricher({
						category: "rule",
						rule: "Difficult Terrain",
					}),
				).toBe('&Reference[rule="Difficult Terrain"]');
			});

			it("should quote generic rules with spaces", () => {
				expect(
					createReferenceEnricher({
						category: "rule",
						rule: "Cover Rules",
					}),
				).toBe('&Reference[rule="Cover Rules"]');
			});

			it("should quote generic rules with equals sign", () => {
				expect(
					createReferenceEnricher({
						category: "rule",
						rule: "rule=value",
					}),
				).toBe('&Reference[rule="rule=value"]');
			});
		});
	});

	describe("inferred category references", () => {
		it("should infer condition category", () => {
			expect(createReferenceEnricher({ rule: "prone" })).toBe(
				"&Reference[prone]",
			);
			expect(createReferenceEnricher({ rule: "blinded" })).toBe(
				"&Reference[blinded]",
			);
		});

		it("should infer ability category", () => {
			expect(createReferenceEnricher({ rule: "strength" })).toBe(
				"&Reference[strength]",
			);
			expect(createReferenceEnricher({ rule: "dexterity" })).toBe(
				"&Reference[dexterity]",
			);
		});

		it("should infer skill category", () => {
			expect(createReferenceEnricher({ rule: "acrobatics" })).toBe(
				"&Reference[acrobatics]",
			);
			expect(createReferenceEnricher({ rule: "perception" })).toBe(
				"&Reference[perception]",
			);
		});

		it("should infer damage type category", () => {
			expect(createReferenceEnricher({ rule: "fire" })).toBe(
				"&Reference[fire]",
			);
			expect(createReferenceEnricher({ rule: "cold" })).toBe(
				"&Reference[cold]",
			);
		});

		it("should handle abbreviations in inferred references", () => {
			expect(createReferenceEnricher({ rule: "str" })).toBe(
				"&Reference[strength]",
			);
			expect(createReferenceEnricher({ rule: "prc" })).toBe(
				"&Reference[perception]",
			);
		});

		it("should handle inferred condition with apply=false", () => {
			expect(
				createReferenceEnricher({
					rule: "prone",
					apply: false,
				}),
			).toBe("&Reference[prone apply=false]");
		});

		it("should not add apply option for non-conditions", () => {
			expect(
				createReferenceEnricher({
					rule: "strength",
					apply: false,
				}),
			).toBe("&Reference[strength]");
		});

		it("should treat unrecognized names as generic rules", () => {
			expect(createReferenceEnricher({ rule: "Custom Rule" })).toBe(
				'&Reference["Custom Rule"]',
			);
			expect(createReferenceEnricher({ rule: "UnknownReference" })).toBe(
				"&Reference[UnknownReference]",
			);
		});
	});

	describe("quoting behavior", () => {
		it("should quote values with spaces", () => {
			expect(
				createReferenceEnricher({
					category: "rule",
					rule: "Difficult Terrain",
				}),
			).toBe('&Reference[rule="Difficult Terrain"]');
		});

		it("should quote values with equals signs", () => {
			expect(
				createReferenceEnricher({
					category: "rule",
					rule: "key=value",
				}),
			).toBe('&Reference[rule="key=value"]');
		});

		it("should not quote simple values", () => {
			expect(
				createReferenceEnricher({
					category: "condition",
					rule: "prone",
				}),
			).toBe("&Reference[condition=prone]");
		});

		it("should quote inferred generic rules with spaces", () => {
			expect(createReferenceEnricher({ rule: "Difficult Terrain" })).toBe(
				'&Reference["Difficult Terrain"]',
			);
		});
	});

	describe("all condition references", () => {
		it("should handle all condition references", () => {
			for (const condition of CONDITION_REFERENCES) {
				expect(
					createReferenceEnricher({
						category: "condition",
						rule: condition,
					}),
				).toBe(`&Reference[condition=${condition}]`);
			}
		});

		it("should handle all condition references with apply=false", () => {
			for (const condition of CONDITION_REFERENCES) {
				expect(
					createReferenceEnricher({
						category: "condition",
						rule: condition,
						apply: false,
					}),
				).toBe(`&Reference[condition=${condition} apply=false]`);
			}
		});
	});

	describe("all ability references", () => {
		it("should handle all ability references", () => {
			for (const ability of ABILITY_REFERENCES) {
				expect(
					createReferenceEnricher({
						category: "ability",
						rule: ability,
					}),
				).toBe(`&Reference[ability=${ability}]`);
			}
		});

		it("should handle all ability abbreviations", () => {
			const abbreviations = ["str", "dex", "con", "int", "wis", "cha"];
			const expected = [
				"strength",
				"dexterity",
				"constitution",
				"intelligence",
				"wisdom",
				"charisma",
			];

			abbreviations.forEach((abbr, index) => {
				expect(
					createReferenceEnricher({
						category: "ability",
						rule: abbr,
					}),
				).toBe(`&Reference[ability=${expected[index]}]`);
			});
		});
	});

	describe("all skill references", () => {
		it("should handle all skill references", () => {
			for (const skill of SKILL_REFERENCES) {
				expect(
					createReferenceEnricher({
						category: "skill",
						rule: skill,
					}),
				).toBe(`&Reference[skill=${skill}]`);
			}
		});
	});

	describe("all damage type references", () => {
		it("should handle all damage type references", () => {
			for (const damageType of DAMAGE_TYPE_REFERENCES) {
				expect(
					createReferenceEnricher({
						category: "damageType",
						rule: damageType,
					}),
				).toBe(`&Reference[damageType=${damageType}]`);
			}
		});
	});

	describe("case insensitivity", () => {
		it("should handle case-insensitive condition names", () => {
			expect(
				createReferenceEnricher({
					category: "condition",
					rule: "PRONE",
				}),
			).toBe("&Reference[condition=prone]");
			expect(
				createReferenceEnricher({
					category: "condition",
					rule: "Prone",
				}),
			).toBe("&Reference[condition=prone]");
			expect(
				createReferenceEnricher({
					category: "condition",
					rule: "pRoNe",
				}),
			).toBe("&Reference[condition=prone]");
		});

		it("should handle case-insensitive ability names", () => {
			expect(
				createReferenceEnricher({
					category: "ability",
					rule: "STRENGTH",
				}),
			).toBe("&Reference[ability=strength]");
			expect(
				createReferenceEnricher({
					category: "ability",
					rule: "Str",
				}),
			).toBe("&Reference[ability=strength]");
		});
	});

	describe("edge cases", () => {
		it("should handle empty rule name", () => {
			expect(
				createReferenceEnricher({
					category: "condition",
					rule: "",
				}),
			).toBe("&Reference[condition=]");
		});

		it("should handle whitespace in rule names", () => {
			expect(
				createReferenceEnricher({
					category: "condition",
					rule: "  prone  ",
				}),
			).toBe("&Reference[condition=prone]");
		});

		it("should preserve case for generic rules", () => {
			expect(
				createReferenceEnricher({
					category: "rule",
					rule: "Difficult Terrain",
				}),
			).toBe('&Reference[rule="Difficult Terrain"]');
		});

		it("should handle apply option for inferred conditions", () => {
			expect(
				createReferenceEnricher({
					rule: "blinded",
					apply: false,
				}),
			).toBe("&Reference[blinded apply=false]");
		});

		it("should not add apply option when category is not condition and rule is not a condition", () => {
			expect(
				createReferenceEnricher({
					category: "ability",
					rule: "strength",
					apply: false,
				}),
			).toBe("&Reference[ability=strength]");
		});
	});

	describe("real-world examples", () => {
		it("should match documentation examples", () => {
			// Example: Reference a condition
			expect(
				createReferenceEnricher({
					category: "condition",
					rule: "prone",
				}),
			).toBe("&Reference[condition=prone]");
			expect(createReferenceEnricher({ rule: "Prone" })).toBe(
				"&Reference[prone]",
			);
			expect(createReferenceEnricher({ rule: "prone" })).toBe(
				"&Reference[prone]",
			);

			// Example: Reference a condition without the apply button
			expect(
				createReferenceEnricher({
					rule: "blinded",
					apply: false,
				}),
			).toBe("&Reference[blinded apply=false]");

			// Example: Reference another rule
			expect(
				createReferenceEnricher({
					category: "rule",
					rule: "Difficult Terrain",
				}),
			).toBe('&Reference[rule="Difficult Terrain"]');
			expect(createReferenceEnricher({ rule: "Difficult Terrain" })).toBe(
				'&Reference["Difficult Terrain"]',
			);
		});
	});
});

