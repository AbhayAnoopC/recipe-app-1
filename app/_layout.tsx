import { Stack, Redirect, Slot } from 'expo-router';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

function useProtectedRoute(user, initializing) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (initializing) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to the sign-in page.
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect away from the sign-in page.
            router.replace('/(tabs)/library');
        }
    }, [user, initializing, segments]);
}

function RootLayoutNav() {
    const { user, initializing } = useAuth();
    useProtectedRoute(user, initializing);

    if (initializing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}
