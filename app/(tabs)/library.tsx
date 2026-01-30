import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { listUserRecipes } from '../../services/firebase/db';
import { Recipe } from '../../types/recipe';

export default function LibraryScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const loadRecipes = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const list = await listUserRecipes(user.uid);
            setRecipes(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            loadRecipes();
        }, [loadRecipes])
    );

    const filtered = recipes.filter(r => {
        const title = r.structured?.title || 'Untitled Draft';
        return title.toLowerCase().includes(search.toLowerCase());
    });

    const renderItem = ({ item }: { item: Recipe }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(tabs)/library/builder', params: { recipeId: item.id } })}
        >
            <Text style={styles.cardTitle}>{item.structured?.title || 'Untitled Draft'}</Text>
            <View style={styles.cardMeta}>
                <Text style={styles.status}>{item.status}</Text>
                <Text style={styles.platform}>{item.source.platform}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Library</Text>
                <Button title="Import Recipe" onPress={() => router.push('/(tabs)/library/import')} />
            </View>

            <TextInput
                style={styles.search}
                placeholder="Search recipes..."
                value={search}
                onChangeText={setSearch}
            />

            <FlatList
                data={filtered}
                renderItem={renderItem}
                keyExtractor={r => r.id || String(Math.random())}
                refreshing={loading}
                onRefresh={loadRecipes}
                ListEmptyComponent={<Text style={styles.empty}>No recipes found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold' },
    search: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 20 },
    card: { padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    cardMeta: { flexDirection: 'row', gap: 10 },
    status: { fontSize: 12, color: '#666', textTransform: 'uppercase' },
    platform: { fontSize: 12, color: '#007AFF', textTransform: 'capitalize' },
    empty: { textAlign: 'center', marginTop: 20, color: '#666' }
});
