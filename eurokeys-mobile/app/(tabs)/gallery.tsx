import React from 'react';
import { StyleSheet, ScrollView, Image, Dimensions } from 'react-native';

import { Text, View } from '@/components/Themed';

const { width } = Dimensions.get('window');
const imageSize = (width - 52) / 2;

export default function GalleryScreen() {
    // Placeholder images - would come from R2 in production
    const images = [
        { id: 1, caption: 'CAN-FD Adapter Setup', category: 'Tools' },
        { id: 2, caption: 'HU100 Key Cutting', category: 'Mechanical' },
        { id: 3, caption: 'PEPS Module Location', category: 'Diagrams' },
        { id: 4, caption: 'BCM Programming', category: 'Procedures' },
        { id: 5, caption: 'Lishi HU101 Pick', category: 'Tools' },
        { id: 6, caption: 'Pin Code Retrieval', category: 'Procedures' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📷 Gallery</Text>
            <Text style={styles.subtitle}>Visual References & Infographics</Text>

            <ScrollView style={styles.grid} showsVerticalScrollIndicator={false}>
                <View style={styles.imageGrid}>
                    {images.map((img) => (
                        <View key={img.id} style={styles.imageCard}>
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.placeholderIcon}>🖼️</Text>
                            </View>
                            <Text style={styles.caption} numberOfLines={1}>{img.caption}</Text>
                            <Text style={styles.category}>{img.category}</Text>
                        </View>
                    ))}
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
    grid: {
        flex: 1,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    imageCard: {
        width: imageSize,
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    imagePlaceholder: {
        width: '100%',
        height: imageSize,
        backgroundColor: 'rgba(20, 20, 30, 0.8)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    placeholderIcon: {
        fontSize: 40,
    },
    caption: {
        fontSize: 13,
        fontWeight: '500',
        color: '#f8fafc',
        marginTop: 8,
    },
    category: {
        fontSize: 11,
        color: '#a78bfa',
        marginTop: 2,
    },
});
