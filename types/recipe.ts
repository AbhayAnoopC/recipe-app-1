export type RecipeSource = {
    platform: 'tiktok' | 'instagram' | 'youtube' | 'web' | 'manual';
    url: string;
    creatorHandle?: string;
    importMethod: 'paste_link' | 'manual';
    rawCaption?: string;
};

export type Ingredient = {
    displayName: string;
    canonical: string;
    quantity?: string;
    optional?: boolean;
};

export type RecipeStep = {
    index: number;
    text: string;
};

export type RecipeStructured = {
    title: string;
    servings?: number;
    timeMinutes?: number;
    tags?: string[];
    equipment?: string[];
    ingredients: Ingredient[];
    steps: RecipeStep[];
};

export type Recipe = {
    id?: string;
    ownerId: string;
    createdAt: number;
    updatedAt: number;
    source: RecipeSource;
    status: 'draft' | 'ready';
    structured?: RecipeStructured;
};
