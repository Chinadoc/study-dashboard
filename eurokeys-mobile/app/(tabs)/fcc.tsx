import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

interface FCCEntry {
    fcc_id: string;
    make?: string;
    model?: string;
    frequency?: string;
    button_count?: number;
    key_type?: string;
}

export default function FCCScreen() {
    const [fccData, setFccData] = useState<FCCEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFCCData();
    }, []);

    const fetchFCCData = async (search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const url = search
                ? `${API_BASE}/api/fcc?search=${encodeURIComponent(search)}&limit=50`
                : `${API_BASE}/api/fcc?limit=50`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch FCC data');

            const data = await response.json();
            setFccData(data.entries || data.rows || []);
        } catch (err) {
            setError('Failed to load FCC data');
            console.error('FCC fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setQuery(text);
        if (text.length >= 2) {
            fetchFCCData(text);
        } else if (text.length === 0) {
            fetchFCCData();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📡 FCC Database</Text>
            <Text style={styles.subtitle}>Remote & Smart Key Identification</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Search by FCC ID or make..."
                placeholderTextColor="#64748b"
                value={query}
                onChangeText={handleSearch}
            />

            {loading ? (
                <ActivityIndicator style={styles.loader} color={Colors.dark.tint} />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {fccData.length === 0 ? (
                        <Text style={styles.noResults}>No FCC entries found</Text>
                    ) : (
                        fccData.map((fcc, index) => (
                            <TouchableOpacity key={`${fcc.fcc_id}-${index}`} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.fccId}>{fcc.fcc_id}</Text>
                                    {fcc.frequency && (
                                        <Text style={styles.freq}>{fcc.frequency}</Text>
                                    )}
                                </View>
                                <Text style={styles.make}>
                                    {fcc.make || 'Unknown'}
                                    {fcc.model ? ` • ${fcc.model}` : ''}
                                    {fcc.button_count ? ` • ${fcc.button_count}-Button` : ''}
                                </Text>
                                {fcc.key_type && (
                                    <Text style={styles.keyType}>{fcc.key_type}</Text>
                                )}
                            </TouchableOpacity>
                        ))
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Showing {fccData.length} entries
                        </Text>
                    </View>
                </ScrollView>
            )}
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
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: 'rgba(20, 20, 30, 0.8)',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#f8fafc',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        marginBottom: 16,
    },
    loader: {
        marginTop: 40,
    },
    error: {
        color: '#ef4444',
        textAlign: 'center',
        marginTop: 40,
    },
    noResults: {
        color: '#64748b',
        textAlign: 'center',
        marginTop: 40,
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
        fontSize: 11,
        color: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
    },
    make: {
        fontSize: 14,
        color: '#f8fafc',
        marginTop: 8,
    },
    keyType: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    footer: {
        marginTop: 12,
        marginBottom: 40,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    footerText: {
        color: '#64748b',
        fontSize: 12,
    },
});
