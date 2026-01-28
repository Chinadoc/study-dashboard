import { Stack } from 'expo-router';

export default function VehicleLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#0a0a0f' },
                headerTintColor: '#a78bfa',
                headerBackTitle: 'Back',
            }}
        />
    );
}
