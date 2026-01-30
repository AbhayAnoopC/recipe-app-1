import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function CookScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cook</Text>
            <View style={styles.buttonRow}>
                <Button title="Go to Login" onPress={() => router.push('/login')} />
                <Button title="Go to Signup" onPress={() => router.push('/signup')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 32, marginBottom: 20 },
    buttonRow: { flexDirection: 'row', gap: 10 },
});
