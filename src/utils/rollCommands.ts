import type { Ability } from "@/features/dnd/abilities/abilities";
import { createSaveEnricher } from "@/features/dnd/rolls/save/saveRoll";

export const createSavingThrow = (ability: Ability): string => {
	return createSaveEnricher({ ability });
};

export const createSpellReference = (spellName: string): string => {
	return `@spell[${spellName}]`;
};
