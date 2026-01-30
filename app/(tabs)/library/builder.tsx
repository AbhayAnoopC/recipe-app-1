import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { getRecipe } from '../../../services/firebase/db';
import { Recipe } from '../../../types/recipe';

export default function BuilderScreen() {
    const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [rawCaption, setRawCaption] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!recipeId) return;
        const load = async () => {
            const r = await getRecipe(recipeId);
            if (r) {
                setRecipe(r);
                setRawCaption(r.source.rawCaption || '');
            }
            setLoading(false);
        };
        load();
    }, [recipeId]);

    const handleSave = async () => {
        if (!recipeId) return;
        setSaving(true);
        try {
            const docRef = doc(db, 'recipes', recipeId);
            await updateDoc(docRef, {
                'source.rawCaption': rawCaption,
                updatedAt: Date.now()
            });
            alert('Saved!');
        } catch (e) {
            console.error(e);
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
    if (!recipe) return <View style={styles.center}><Text>Recipe not found</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recipe Builder</Text>

            <Text style={styles.label}>Raw Text / Caption</Text>
            <TextInput
                style={styles.textArea}
                value={rawCaption}
                onChangeText={setRawCaption}
                multiline
                placeholder="Recipe content..."
            />

            <View style={styles.buttons}>
                <Button
                    title={saving ? "Saving..." : "Save"}
                    onPress={handleSave}
                />
                <Button
                    title="Generate Structured Recipe (next step)"
                    onPress={() => { }}
                    color="gray"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 16, marginBottom: 5 },
    textArea: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20, textAlignVertical: 'top' },
    buttons: { gap: 10 }
});
