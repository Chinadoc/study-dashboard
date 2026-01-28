import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function DossiersScreen() {
    const dossiers = [
        { name: 'Ford F-150 2015-2020', count: 12, icon: '🔑' },
        { name: 'Toyota Camry 2018-2024', count: 8, icon: '🚗' },
        { name: 'Honda Accord 2016-2022', count: 15, icon: '📋' },
        { name: 'Chevrolet Silverado 2019-2024', count: 10, icon: '🛻' },
        { name: 'BMW X5 2014-2023', count: 18, icon: '🏎️' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📚 Dossiers</Text>
            <Text style={styles.subtitle}>Technical Research Documents</Text>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {dossiers.map((dossier, i) => (
                    <TouchableOpacity key={i} style={styles.card}>
                        <View style={styles.cardContent}>
                            <Text style={styles.icon}>{dossier.icon}</Text>
                            <View style={styles.textContent}>
                                <Text style={styles.dossierName}>{dossier.name}</Text>
                                <Text style={styles.pearlCount}>{dossier.count} pearls</Text>
                            </View>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                ))}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        flex: 1,
    },
    icon: {
        fontSize: 28,
        marginRight: 14,
    },
    textContent: {
        backgroundColor: 'transparent',
        flex: 1,
    },
    dossierName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#f8fafc',
    },
    pearlCount: {
        fontSize: 13,
        color: '#a78bfa',
        marginTop: 2,
    },
    arrow: {
        fontSize: 24,
        color: '#64748b',
        fontWeight: '300',
    },
});
