import {
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Recipe, RecipeStructured } from '../../types/recipe';
import { PantryDocument } from '../../types/pantry';
import { CookSession, SessionHistoryItem } from '../../types/session';

// --- Types ---
export type ShoppingListItem = {
    displayName: string;
    canonical: string;
    checked: boolean;
};

export type ShoppingList = {
    id?: string;
    ownerId: string;
    recipeId: string;
    items: ShoppingListItem[];
    createdAt: number;
    updatedAt: number;
    status: 'active' | 'completed' | 'archived';
};

// --- Recipes ---

export async function createRecipeDraft(
    uid: string,
    source: {
        platform: 'tiktok' | 'instagram' | 'youtube' | 'web' | 'manual',
        url: string,
        importMethod: 'paste_link' | 'manual',
        rawCaption?: string
    }
): Promise<string> {
    const now = Date.now();
    const recipeData: Omit<Recipe, 'id'> = {
        ownerId: uid,
        createdAt: now,
        updatedAt: now,
        source: {
            ...source,
            rawCaption: source.rawCaption || null, // Sanitise undefined to null for Firestore
        } as any, // Cast to any to satisfy strict type if needed, or update type def
        status: 'draft',
    };

    // Remove keys that are undefined just in case
    Object.keys(recipeData).forEach(key => recipeData[key] === undefined && delete recipeData[key]);

    const docRef = await addDoc(collection(db, 'recipes'), recipeData);
    return docRef.id;
}

export async function updateRecipeStructured(
    recipeId: string,
    structured: RecipeStructured
): Promise<void> {
    const docRef = doc(db, 'recipes', recipeId);
    await updateDoc(docRef, {
        structured: structured,
        status: 'ready',
        updatedAt: Date.now()
    });
}

export async function listUserRecipes(uid: string): Promise<Recipe[]> {
    const q = query(
        collection(db, 'recipes'),
        where('ownerId', '==', uid),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const recipes: Recipe[] = [];

    querySnapshot.forEach((doc) => {
        recipes.push({ id: doc.id, ...doc.data() } as Recipe);
    });

    return recipes;
}

export async function getRecipe(recipeId: string): Promise<Recipe | null> {
    const docRef = doc(db, 'recipes', recipeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Recipe;
    } else {
        return null;
    }
}

// --- Pantry ---

export async function getPantry(uid: string): Promise<PantryDocument | null> {
    const docRef = doc(db, 'pantries', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as PantryDocument;
    } else {
        return null;
    }
}

export async function upsertPantry(uid: string, pantry: PantryDocument): Promise<void> {
    const docRef = doc(db, 'pantries', uid);
    // Ensure updatedAt is set
    const data = {
        ...pantry,
        updatedAt: Date.now()
    };
    await setDoc(docRef, data);
}

// --- Cook Sessions ---

export async function startCookSession(uid: string, recipeId: string): Promise<string> {
    const now = Date.now();
    const sessionData: Omit<CookSession, 'id'> = {
        ownerId: uid,
        recipeId: recipeId,
        createdAt: now,
        updatedAt: now,
        status: 'active',
        currentStepIndex: 1, // per requirements (usually 0-indexed, but req says 1)
        voice: {
            todayCount: 0,
            lastQuestionAt: undefined
        },
        history: []
    };

    const docRef = await addDoc(collection(db, 'cookSessions'), sessionData);
    return docRef.id;
}

export async function getActiveCookSession(uid: string): Promise<CookSession | null> {
    const q = query(
        collection(db, 'cookSessions'),
        where('ownerId', '==', uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as CookSession;
    }
    return null;
}

export async function updateCookSessionStep(sessionId: string, stepIndex: number): Promise<void> {
    const docRef = doc(db, 'cookSessions', sessionId);
    await updateDoc(docRef, {
        currentStepIndex: stepIndex,
        updatedAt: Date.now()
    });
}

export async function appendCookSessionHistory(
    sessionId: string,
    entry: SessionHistoryItem
): Promise<void> {
    const docRef = doc(db, 'cookSessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const session = docSnap.data() as CookSession;
        const history = session.history || [];
        history.push(entry);

        await updateDoc(docRef, {
            history: history,
            updatedAt: Date.now()
        });
    }
}

// --- Shopping Lists ---

export async function createShoppingList(
    uid: string,
    recipeId: string,
    items: Array<{ displayName: string, canonical: string }>
): Promise<string> {
    const now = Date.now();
    const listItems: ShoppingListItem[] = items.map(item => ({
        ...item,
        checked: false
    }));

    const listData: Omit<ShoppingList, 'id'> = {
        ownerId: uid,
        recipeId: recipeId,
        items: listItems,
        createdAt: now,
        updatedAt: now,
        status: 'active'
    };

    const docRef = await addDoc(collection(db, 'shoppingLists'), listData);
    return docRef.id;
}

export async function getShoppingList(listId: string): Promise<ShoppingList | null> {
    const docRef = doc(db, 'shoppingLists', listId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ShoppingList;
    } else {
        return null;
    }
}

export async function updateShoppingListItems(
    listId: string,
    items: ShoppingListItem[]
): Promise<void> {
    const docRef = doc(db, 'shoppingLists', listId);
    await updateDoc(docRef, {
        items: items,
        updatedAt: Date.now()
    });
}
