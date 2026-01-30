import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="library"
                options={{ title: 'Library' }}
            />
            <Tabs.Screen
                name="pantry"
                options={{ title: 'Pantry' }}
            />
            <Tabs.Screen
                name="cook"
                options={{ title: 'Cook' }}
            />
        </Tabs>
    );
}
