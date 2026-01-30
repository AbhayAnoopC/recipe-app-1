import { View, Text, TextInput, Button, StyleSheet, Switch, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPantry, upsertPantry } from '../../services/firebase/db';
import { toCanonical } from '../../lib/ingredients';
import { PantryDocument, PantryItem } from '../../types/pantry';

const DEFAULT_STAPLES = {
    'salt': true,
    'black pepper': true,
    'olive oil': true,
    'butter': false,
    'garlic': true
};

const STAPLE_KEYS = Object.keys(DEFAULT_STAPLES);

export default function PantryScreen() {
    const { user, logout } = useAuth();
    const [pantry, setPantry] = useState<PantryDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [newItemText, setNewItemText] = useState('');

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            try {
                const fetched = await getPantry(user.uid);
                if (fetched) {
                    setPantry(fetched);
                } else {
                    const initial: PantryDocument = {
                        updatedAt: Date.now(),
                        staples: { ...DEFAULT_STAPLES },
                        items: []
                    };
                    await upsertPantry(user.uid, initial);
                    setPantry(initial);
                }
            } catch (e) {
                console.error("Failed to load pantry", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const savePantry = async (newPantry: PantryDocument) => {
        setPantry(newPantry);
        if (user) {
            await upsertPantry(user.uid, newPantry);
        }
    };

    const toggleStaple = (key: string) => {
        if (!pantry) return;
        const newStaples = { ...pantry.staples, [key]: !pantry.staples[key] };
        savePantry({ ...pantry, staples: newStaples, updatedAt: Date.now() });
    };

    const addItem = () => {
        if (!pantry || !newItemText.trim()) return;

        const canonical = toCanonical(newItemText);
        // Check duplicates in items
        if (pantry.items.some(i => i.canonical === canonical)) {
            setNewItemText('');
            return;
        }

        const newItem: PantryItem = {
            displayName: newItemText.trim(),
            canonical,
            addedAt: Date.now()
        };

        const newItems = [...pantry.items, newItem];
        savePantry({ ...pantry, items: newItems, updatedAt: Date.now() });
        setNewItemText('');
    };

    const removeItem = (canonical: string) => {
        if (!pantry) return;
        const newItems = pantry.items.filter(i => i.canonical !== canonical);
        savePantry({ ...pantry, items: newItems, updatedAt: Date.now() });
    };

    if (loading) return <View style={styles.center}><Text>Loading Pantry...</Text></View>;
    if (!pantry) return <View style={styles.center}><Text>Error loading pantry.</Text></View>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Pantry</Text>

            <Text style={styles.sectionTitle}>Staples</Text>
            <View style={styles.staplesContainer}>
                {STAPLE_KEYS.map(key => (
                    <View key={key} style={styles.stapleRow}>
                        <Text style={styles.stapleText}>{key}</Text>
                        <Switch
                            value={pantry.staples[key] || false}
                            onValueChange={() => toggleStaple(key)}
                        />
                    </View>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Items</Text>
            <View style={styles.addCtn}>
                <TextInput
                    style={styles.input}
                    placeholder="Add ingredient..."
                    value={newItemText}
                    onChangeText={setNewItemText}
                />
                <Button title="Add" onPress={addItem} />
            </View>

            <View style={styles.list}>
                {pantry.items.map(item => (
                    <View key={item.canonical} style={styles.itemRow}>
                        <Text style={styles.itemText}>{item.displayName}</Text>
                        <Button title="Remove" color="red" onPress={() => removeItem(item.canonical)} />
                    </View>
                ))}
                {pantry.items.length === 0 && <Text style={styles.emptyText}>No items added.</Text>}
            </View>

            <View style={styles.footer}>
                <Button title="Logout" onPress={logout} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingBottom: 50 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
    sectionTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    staplesContainer: { marginBottom: 10 },
    stapleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
    stapleText: { fontSize: 18, textTransform: 'capitalize' },
    addCtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginRight: 10 },
    list: { marginBottom: 30 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
    itemText: { fontSize: 18 },
    emptyText: { fontStyle: 'italic', color: '#666' },
    footer: { marginTop: 20 }
});
