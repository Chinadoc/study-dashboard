import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import { Text, View } from '@/components/Themed';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

interface VehicleDetail {
    header: {
        make: string;
        model: string;
        platform?: string;
        immobilizer_system?: string;
        can_fd_required?: boolean;
    };
    specs: {
        chip?: string;
        fcc_id?: string;
        frequency?: string;
        battery?: string;
        keyway?: string;
        lishi?: string;
    };
}

interface Pearl {
    id: string;
    content: string;
    category?: string;
}

export default function VehicleDetailScreen() {
    const { make, model, year } = useLocalSearchParams<{ make: string; model: string; year: string }>();
    const [detail, setDetail] = useState<VehicleDetail | null>(null);
    const [pearls, setPearls] = useState<Pearl[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (make && model && year) {
            fetchVehicleData();
        }
    }, [make, model, year]);

    const fetchVehicleData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch vehicle detail
            const detailUrl = `${API_BASE}/api/vehicle-detail?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;
            const detailRes = await fetch(detailUrl);
            if (detailRes.ok) {
                const detailData = await detailRes.json();
                setDetail(detailData);
            }

            // Fetch pearls
            const pearlsUrl = `${API_BASE}/api/pearls?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
            const pearlsRes = await fetch(pearlsUrl);
            if (pearlsRes.ok) {
                const pearlsData = await pearlsRes.json();
                setPearls(pearlsData.pearls?.slice(0, 5) || []);
            }
        } catch (err) {
            setError('Failed to load vehicle data');
            console.error('Detail fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const title = `${year} ${make} ${model}`;

    return (
        <>
            <Stack.Screen
                options={{
                    title: title,
                    headerStyle: { backgroundColor: '#0a0a0f' },
                    headerTintColor: '#a78bfa',
                }}
            />
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator style={styles.loader} color="#a78bfa" size="large" />
                ) : error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            {detail?.header?.platform && (
                                <Text style={styles.platform}>{detail.header.platform} Platform</Text>
                            )}
                            {detail?.header?.can_fd_required && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>⚡ CAN-FD Required</Text>
                                </View>
                            )}
                        </View>

                        {/* Specs Grid */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Specifications</Text>
                            <View style={styles.specsGrid}>
                                {detail?.header?.immobilizer_system && (
                                    <SpecItem label="Immobilizer" value={detail.header.immobilizer_system} />
                                )}
                                {detail?.specs?.chip && (
                                    <SpecItem label="Chip" value={detail.specs.chip} />
                                )}
                                {detail?.specs?.fcc_id && (
                                    <SpecItem label="FCC ID" value={detail.specs.fcc_id} highlight />
                                )}
                                {detail?.specs?.frequency && (
                                    <SpecItem label="Frequency" value={detail.specs.frequency} />
                                )}
                                {detail?.specs?.keyway && (
                                    <SpecItem label="Keyway" value={detail.specs.keyway} />
                                )}
                                {detail?.specs?.lishi && (
                                    <SpecItem label="Lishi Tool" value={detail.specs.lishi} />
                                )}
                                {detail?.specs?.battery && (
                                    <SpecItem label="Battery" value={detail.specs.battery} />
                                )}
                            </View>
                        </View>

                        {/* Technical Pearls */}
                        {pearls.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>💎 Technical Insights</Text>
                                {pearls.map((pearl) => (
                                    <View key={pearl.id} style={styles.pearlCard}>
                                        <Text style={styles.pearlText}>{pearl.content}</Text>
                                        {pearl.category && (
                                            <Text style={styles.pearlCategory}>{pearl.category}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.spacer} />
                    </ScrollView>
                )}
            </View>
        </>
    );
}

function SpecItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <View style={styles.specItem}>
            <Text style={styles.specLabel}>{label}</Text>
            <Text style={[styles.specValue, highlight && styles.specValueHighlight]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    loader: {
        marginTop: 100,
    },
    error: {
        color: '#ef4444',
        textAlign: 'center',
        marginTop: 100,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139, 92, 246, 0.2)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    platform: {
        fontSize: 14,
        color: '#a78bfa',
        marginTop: 4,
    },
    badge: {
        marginTop: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#f59e0b',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139, 92, 246, 0.1)',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    specsGrid: {
        backgroundColor: 'transparent',
    },
    specItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: 'transparent',
    },
    specLabel: {
        fontSize: 14,
        color: '#94a3b8',
    },
    specValue: {
        fontSize: 14,
        color: '#f8fafc',
        fontWeight: '500',
    },
    specValueHighlight: {
        color: '#a78bfa',
        fontFamily: 'monospace',
    },
    pearlCard: {
        backgroundColor: 'rgba(20, 20, 30, 0.8)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    pearlText: {
        fontSize: 14,
        color: '#f8fafc',
        lineHeight: 20,
    },
    pearlCategory: {
        fontSize: 11,
        color: '#a78bfa',
        marginTop: 8,
        textTransform: 'uppercase',
    },
    spacer: {
        height: 40,
    },
});
