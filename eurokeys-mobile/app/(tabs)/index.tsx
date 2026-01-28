import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { api, Vehicle } from '@/lib/api';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);

  useEffect(() => {
    api.getMakes().then(setMakes);
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const result = await api.searchVehicles({ make: text, limit: 20 });
      setResults(result.rows || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehiclePress = (vehicle: Vehicle) => {
    const year = vehicle.year_start || 2020;
    router.push(`/vehicle/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}/${year}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔑 EuroKeys</Text>
      <Text style={styles.subtitle}>Automotive Locksmith Intelligence</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by make (e.g., Ford, BMW)..."
        placeholderTextColor="#64748b"
        value={query}
        onChangeText={handleSearch}
      />

      {loading && <ActivityIndicator style={styles.loader} color={Colors.dark.tint} />}

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.id || index}`}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => handleVehiclePress(item)}
            >
              <Text style={styles.vehicleName}>
                {item.year_start === item.year_end
                  ? item.year_start
                  : `${item.year_start}-${item.year_end}`} {item.make} {item.model}
              </Text>
              <Text style={styles.vehicleDetails}>
                {item.key_type || 'Smart Key'} • {item.chip || 'Transponder'}
              </Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      ) : query.length === 0 ? (
        <View style={styles.quickLinks}>
          <Text style={styles.sectionTitle}>Popular Makes</Text>
          <View style={styles.makeGrid}>
            {makes.slice(0, 8).map((make) => (
              <TouchableOpacity
                key={make}
                style={styles.makeButton}
                onPress={() => handleSearch(make)}
              >
                <Text style={styles.makeText}>{make}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: 'rgba(20, 20, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  loader: {
    marginTop: 20,
  },
  list: {
    marginTop: 16,
  },
  resultCard: {
    backgroundColor: 'rgba(20, 20, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1,
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#94a3b8',
    marginRight: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#64748b',
  },
  quickLinks: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  makeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  makeButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  makeText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '500',
  },
});
