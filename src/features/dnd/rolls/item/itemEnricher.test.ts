import { describe, expect, it } from "vitest";
import { createItemEnricher, type ItemEnricherOptions } from "./itemEnricher";

describe("createItemEnricher", () => {
	describe("legacy string support", () => {
		it("should handle item name strings", () => {
			expect(createItemEnricher("Bite")).toBe("[[/item Bite]]");
			expect(createItemEnricher("Longsword")).toBe("[[/item Longsword]]");
			expect(createItemEnricher("Healing Potion")).toBe(
				"[[/item Healing Potion]]",
			);
		});

		it("should handle item names with special characters", () => {
			expect(createItemEnricher("Dagger +1")).toBe("[[/item Dagger +1]]");
			expect(createItemEnricher("Sword of Fire")).toBe(
				"[[/item Sword of Fire]]",
			);
		});
	});

	describe("no options", () => {
		it("should create empty item enricher with no options", () => {
			expect(createItemEnricher()).toBe("[[/item]]");
			expect(createItemEnricher({})).toBe("[[/item]]");
		});
	});

	describe("by item name", () => {
		it("should create item enricher by name", () => {
			expect(createItemEnricher({ itemName: "Bite" })).toBe("[[/item Bite]]");
			expect(createItemEnricher({ itemName: "Longsword" })).toBe(
				"[[/item Longsword]]",
			);
			expect(createItemEnricher({ itemName: "Healing Potion" })).toBe(
				"[[/item Healing Potion]]",
			);
		});

		it("should create item enricher by name with activity", () => {
			expect(createItemEnricher({ itemName: "Bite", activity: "Poison" })).toBe(
				"[[/item Bite activity=Poison]]",
			);
			expect(
				createItemEnricher({ itemName: "Tentacles", activity: "Escape" }),
			).toBe("[[/item Tentacles activity=Escape]]");
		});

		it("should quote activity when it contains spaces", () => {
			expect(
				createItemEnricher({
					itemName: "Tentacles",
					activity: "Escape Tentacles",
				}),
			).toBe('[[/item Tentacles activity="Escape Tentacles"]]');
			expect(
				createItemEnricher({
					itemName: "Bite",
					activity: "Poison Attack",
				}),
			).toBe('[[/item Bite activity="Poison Attack"]]');
		});

		it("should quote activity when it contains equals sign", () => {
			expect(
				createItemEnricher({
					itemName: "Item",
					activity: "activity=value",
				}),
			).toBe('[[/item Item activity="activity=value"]]');
		});

		it("should handle item name with spaces and activity", () => {
			expect(
				createItemEnricher({
					itemName: "Healing Potion",
					activity: "Drink",
				}),
			).toBe("[[/item Healing Potion activity=Drink]]");
		});
	});

	describe("by UUID", () => {
		it("should create item enricher by UUID", () => {
			const uuid = "Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU";
			expect(createItemEnricher({ uuid })).toBe(`[[/item ${uuid}]]`);
		});

		it("should create item enricher by UUID with activity", () => {
			const uuid = "Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU";
			expect(createItemEnricher({ uuid, activity: "Poison" })).toBe(
				`[[/item ${uuid} activity=Poison]]`,
			);
		});

		it("should quote activity when it contains spaces in UUID enricher", () => {
			const uuid = "Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU";
			expect(
				createItemEnricher({
					uuid,
					activity: "Escape Tentacles",
				}),
			).toBe(`[[/item ${uuid} activity="Escape Tentacles"]]`);
		});

		it("should quote activity when it contains equals sign in UUID enricher", () => {
			const uuid = "Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU";
			expect(
				createItemEnricher({
					uuid,
					activity: "activity=value",
				}),
			).toBe(`[[/item ${uuid} activity="activity=value"]]`);
		});
	});

	describe("by relative ID", () => {
		it("should create item enricher by relative ID", () => {
			expect(createItemEnricher({ relativeId: "amUUCouL69OK1GZU" })).toBe(
				"[[/item amUUCouL69OK1GZU]]",
			);
		});

		it("should create item enricher by relative UUID (starting with .)", () => {
			expect(createItemEnricher({ relativeId: ".amUUCouL69OK1GZU" })).toBe(
				"[[/item .amUUCouL69OK1GZU]]",
			);
		});

		it("should create item enricher by relative ID with activity", () => {
			expect(
				createItemEnricher({
					relativeId: "amUUCouL69OK1GZU",
					activity: "Poison",
				}),
			).toBe("[[/item amUUCouL69OK1GZU activity=Poison]]");
		});

		it("should create item enricher by relative UUID with activity", () => {
			expect(
				createItemEnricher({
					relativeId: ".amUUCouL69OK1GZU",
					activity: "Poison",
				}),
			).toBe("[[/item .amUUCouL69OK1GZU activity=Poison]]");
		});

		it("should quote activity when it contains spaces in relative ID enricher", () => {
			expect(
				createItemEnricher({
					relativeId: "amUUCouL69OK1GZU",
					activity: "Escape Tentacles",
				}),
			).toBe('[[/item amUUCouL69OK1GZU activity="Escape Tentacles"]]');
		});

		it("should quote activity when it contains equals sign in relative ID enricher", () => {
			expect(
				createItemEnricher({
					relativeId: "amUUCouL69OK1GZU",
					activity: "activity=value",
				}),
			).toBe('[[/item amUUCouL69OK1GZU activity="activity=value"]]');
		});
	});

	describe("priority", () => {
		it("should prioritize UUID over relativeId and itemName", () => {
			const uuid = "Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU";
			const options: ItemEnricherOptions = {
				uuid,
				relativeId: "amUUCouL69OK1GZU",
				itemName: "Bite",
			};
			expect(createItemEnricher(options)).toBe(`[[/item ${uuid}]]`);
		});

		it("should prioritize relativeId over itemName when UUID is not present", () => {
			const options: ItemEnricherOptions = {
				relativeId: "amUUCouL69OK1GZU",
				itemName: "Bite",
			};
			expect(createItemEnricher(options)).toBe("[[/item amUUCouL69OK1GZU]]");
		});

		it("should use itemName when UUID and relativeId are not present", () => {
			const options: ItemEnricherOptions = {
				itemName: "Bite",
			};
			expect(createItemEnricher(options)).toBe("[[/item Bite]]");
		});

		it("should preserve activity when UUID takes priority", () => {
			const uuid = "Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU";
			const options: ItemEnricherOptions = {
				uuid,
				relativeId: "amUUCouL69OK1GZU",
				itemName: "Bite",
				activity: "Poison",
			};
			expect(createItemEnricher(options)).toBe(
				`[[/item ${uuid} activity=Poison]]`,
			);
		});

		it("should preserve activity when relativeId takes priority", () => {
			const options: ItemEnricherOptions = {
				relativeId: "amUUCouL69OK1GZU",
				itemName: "Bite",
				activity: "Poison",
			};
			expect(createItemEnricher(options)).toBe(
				"[[/item amUUCouL69OK1GZU activity=Poison]]",
			);
		});
	});

	describe("edge cases", () => {
		it("should handle empty item name", () => {
			expect(createItemEnricher({ itemName: "" })).toBe("[[/item]]");
		});

		it("should handle empty UUID", () => {
			expect(createItemEnricher({ uuid: "" })).toBe("[[/item]]");
		});

		it("should handle empty relativeId", () => {
			expect(createItemEnricher({ relativeId: "" })).toBe("[[/item]]");
		});

		it("should handle empty activity", () => {
			expect(createItemEnricher({ itemName: "Bite", activity: "" })).toBe(
				"[[/item Bite]]",
			);
		});

		it("should handle activity with only spaces", () => {
			// Note: Implementation includes spaces as-is, doesn't trim
			expect(createItemEnricher({ itemName: "Bite", activity: "   " })).toBe(
				'[[/item Bite activity="   "]]',
			);
		});

		it("should handle item name with only spaces", () => {
			// Note: Implementation includes spaces as-is, doesn't trim
			expect(createItemEnricher({ itemName: "   " })).toBe("[[/item    ]]");
		});

		it("should handle activity with single character", () => {
			expect(createItemEnricher({ itemName: "Bite", activity: "P" })).toBe(
				"[[/item Bite activity=P]]",
			);
		});

		it("should handle very long item names", () => {
			const longName = "A".repeat(100);
			expect(createItemEnricher({ itemName: longName })).toBe(
				`[[/item ${longName}]]`,
			);
		});

		it("should handle very long UUIDs", () => {
			const longUuid = "Actor." + "A".repeat(50) + ".Item." + "B".repeat(50);
			expect(createItemEnricher({ uuid: longUuid })).toBe(
				`[[/item ${longUuid}]]`,
			);
		});

		it("should handle activity with multiple spaces", () => {
			expect(
				createItemEnricher({
					itemName: "Tentacles",
					activity: "Escape  Multiple  Spaces",
				}),
			).toBe('[[/item Tentacles activity="Escape  Multiple  Spaces"]]');
		});

		it("should handle activity that starts or ends with spaces", () => {
			expect(
				createItemEnricher({
					itemName: "Bite",
					activity: "  Poison  ",
				}),
			).toBe('[[/item Bite activity="  Poison  "]]');
		});

		it("should handle special characters in item name", () => {
			expect(createItemEnricher({ itemName: "Item (Special)" })).toBe(
				"[[/item Item (Special)]]",
			);
			expect(createItemEnricher({ itemName: "Item [Brackets]" })).toBe(
				"[[/item Item [Brackets]]]",
			);
		});

		it("should handle activity with quotes (wrapped but not escaped)", () => {
			// Note: The implementation wraps quotes but doesn't escape internal quotes
			// This creates potentially invalid output, but matches current implementation
			expect(
				createItemEnricher({
					itemName: "Bite",
					activity: 'Activity with "quotes"',
				}),
			).toBe('[[/item Bite activity="Activity with "quotes""]]');
		});

		it("should handle UUID format variations", () => {
			expect(
				createItemEnricher({
					uuid: "Actor.abc123.Item.def456",
				}),
			).toBe("[[/item Actor.abc123.Item.def456]]");
		});

		it("should handle relative ID with underscores and hyphens", () => {
			expect(createItemEnricher({ relativeId: "item_id-123" })).toBe(
				"[[/item item_id-123]]",
			);
		});
	});

	describe("activity quoting logic", () => {
		it("should not quote activity without spaces or equals", () => {
			expect(createItemEnricher({ itemName: "Bite", activity: "Poison" })).toBe(
				"[[/item Bite activity=Poison]]",
			);
			expect(createItemEnricher({ itemName: "Bite", activity: "Attack" })).toBe(
				"[[/item Bite activity=Attack]]",
			);
		});

		it("should quote activity with spaces", () => {
			expect(
				createItemEnricher({
					itemName: "Bite",
					activity: "Poison Attack",
				}),
			).toBe('[[/item Bite activity="Poison Attack"]]');
		});

		it("should quote activity with equals sign", () => {
			expect(
				createItemEnricher({
					itemName: "Bite",
					activity: "activity=value",
				}),
			).toBe('[[/item Bite activity="activity=value"]]');
		});

		it("should quote activity with both spaces and equals", () => {
			expect(
				createItemEnricher({
					itemName: "Bite",
					activity: "activity = value",
				}),
			).toBe('[[/item Bite activity="activity = value"]]');
		});
	});
});
