export type PantryItem = {
    displayName: string;
    canonical: string;
    addedAt: number;
};

export type PantryDocument = {
    updatedAt: number;
    staples: Record<string, boolean>; // canonical staple name -> boolean
    items: PantryItem[];
};
