import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function FCCScreen() {
    // Sample FCC data - would come from API in production
    const fccSamples = [
        { id: 'M3N-A2C93142300', make: 'Ford', freq: '902 MHz', type: 'Smart Key' },
        { id: 'HYQ14FBN', make: 'Toyota', freq: '314.3 MHz', type: 'Smart Key' },
        { id: 'KR5V2X', make: 'Honda', freq: '433 MHz', type: 'Smart Key' },
        { id: 'NBGIDGNG', make: 'Chevrolet', freq: '315 MHz', type: 'Smart Key' },
        { id: 'YGOHUF14FBX', make: 'BMW', freq: '868 MHz', type: 'Smart Key' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📡 FCC Database</Text>
            <Text style={styles.subtitle}>Remote & Smart Key Identification</Text>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {fccSamples.map((fcc) => (
                    <TouchableOpacity key={fcc.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.fccId}>{fcc.id}</Text>
                            <Text style={styles.freq}>{fcc.freq}</Text>
                        </View>
                        <Text style={styles.make}>{fcc.make} • {fcc.type}</Text>
                    </TouchableOpacity>
                ))}

                <View style={styles.comingSoon}>
                    <Text style={styles.comingSoonText}>
                        Full FCC database with 10,000+ entries coming soon
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#0a0a0f',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#a78bfa',
        marginTop: 20,
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 24,
    },
    list: {
        flex: 1,
    },
    card: {
        backgroundColor: 'rgba(20, 20, 30, 0.8)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    fccId: {
        fontSize: 16,
        fontWeight: '700',
        color: '#a78bfa',
        fontFamily: 'monospace',
    },
    freq: {
        fontSize: 12,
        color: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    make: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
    },
    comingSoon: {
        marginTop: 20,
        padding: 20,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    comingSoonText: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
    },
});
