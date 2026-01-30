import { Recipe } from '../types/recipe';
import { PantryDocument } from '../types/pantry';

export function toCanonical(input: string): string {
    if (!input) return '';

    return input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, ''); // Remove leading/trailing punctuation
}

export function pantrySet(pantry: PantryDocument): Set<string> {
    const set = new Set<string>();

    // Add active staples
    if (pantry.staples) {
        Object.entries(pantry.staples).forEach(([name, isActive]) => {
            if (isActive) {
                set.add(name);
            }
        });
    }

    // Add pantry items
    if (pantry.items) {
        pantry.items.forEach(item => {
            set.add(item.canonical);
        });
    }

    return set;
}

export function computeMissingIngredients(
    recipe: Recipe,
    pantry: PantryDocument
): Array<{ displayName: string, canonical: string }> {
    const pSet = pantrySet(pantry);
    const missing: Array<{ displayName: string, canonical: string }> = [];

    if (!recipe.structured?.ingredients) {
        return [];
    }

    for (const ingredient of recipe.structured.ingredients) {
        // Skip optional ingredients
        if (ingredient.optional) {
            continue;
        }

        // Check if in pantry
        if (!pSet.has(ingredient.canonical)) {
            missing.push({
                displayName: ingredient.displayName,
                canonical: ingredient.canonical
            });
        }
    }

    return missing;
}
