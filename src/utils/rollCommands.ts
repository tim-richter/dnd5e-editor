import type { Ability } from "@/features/dnd/abilities/abilities";

export const createSavingThrow = (ability: Ability): string => {
	return `@save[${ability}]`;
};

export const createSpellReference = (spellName: string): string => {
	return `@spell[${spellName}]`;
};
