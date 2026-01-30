import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { createRecipeDraft } from '../../../services/firebase/db';

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'web'];

export default function ImportScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [url, setUrl] = useState('');
    const [platform, setPlatform] = useState<any>('web');
    const [rawCaption, setRawCaption] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!user || !url) return;
        setLoading(true);
        try {
            const recipeId = await createRecipeDraft(user.uid, {
                platform,
                url,
                importMethod: 'paste_link',
                rawCaption: rawCaption || undefined
            });
            router.replace({ pathname: '/(tabs)/library/builder', params: { recipeId } });
        } catch (error) {
            console.error(error);
            alert('Failed to create draft');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Import Recipe</Text>

            <Text style={styles.label}>Platform</Text>
            <View style={styles.platformRow}>
                {PLATFORMS.map(p => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.platformBtn, platform === p && styles.platformBtnActive]}
                        onPress={() => setPlatform(p)}
                    >
                        <Text style={[styles.platformText, platform === p && styles.platformTextActive]}>
                            {p}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>URL</Text>
            <TextInput
                style={styles.input}
                placeholder="https://..."
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
            />

            <Text style={styles.label}>Paste caption/notes (optional)</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Paste original caption or typed notes..."
                value={rawCaption}
                onChangeText={setRawCaption}
                multiline
                numberOfLines={4}
            />

            <Button
                title={loading ? "Creating..." : "Create Draft"}
                onPress={handleCreate}
                disabled={loading || !url}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5 },
    platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    platformBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
    platformBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    platformText: { color: '#333' },
    platformTextActive: { color: 'white' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, backgroundColor: 'white' },
    textArea: { height: 100, textAlignVertical: 'top' }
});
