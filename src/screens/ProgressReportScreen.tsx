import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Title, Surface, Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchTotalFamiliesAndPhotos } from '../utils/api';

interface ProgressReportScreenProps {
  navigation: any;
}

export default function ProgressReportScreen({ navigation }: ProgressReportScreenProps) {
  const handleBack = () => {
    navigation.goBack();
  };

  // Static data for total families and photo uploads
  const [loading, setLoading] = useState(true);
  const [totalFamilies, setTotalFamilies] = useState<number | null>(null);
  const [photoUploads, setPhotoUploads] = useState<number | null>(null);

  useEffect(() => {
    fetchTotalFamiliesAndPhotos()
      .then((data) => {
        setTotalFamilies(data.total_students);
        setPhotoUploads(data.total_images_uploaded);
      })
      .catch(() => {
        setTotalFamilies(null);
        setPhotoUploads(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#66BB6A']}
        style={styles.backgroundGradient}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>प्रगति रिपोर्ट</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Total Families Card */}
        <Surface style={styles.statsContainer}>
          {loading ? (
            <View style={{ alignItems: 'center', padding: 48 }}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={{ marginTop: 16, color: '#4CAF50', fontSize: 18 }}>लोड हो रहा है...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statCardFuller}>
                <Text style={styles.statEmoji}>👨‍👩‍👧‍👦</Text>
                <Text style={styles.statNumber}>{totalFamilies !== null ? totalFamilies : '-'}</Text>
                <Text style={styles.statLabel}>कुल परिवार</Text>
              </View>
              <View style={styles.statCardFuller}>
                <Text style={styles.statEmoji}>🌱</Text>
                <Text style={styles.statNumber}>{totalFamilies !== null ? totalFamilies : '-'}</Text>
                <Text style={styles.statLabel}>वितरित पौधे</Text>
              </View>
              <View style={styles.statCardFuller}>
                <Text style={styles.statEmoji}>📸</Text>
                <Text style={styles.statNumber}>{photoUploads !== null ? photoUploads : '-'}</Text>
                <Text style={styles.statLabel}>फोटो अपलोड</Text>
              </View>
            </>
          )}
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  statsGrid: {
    display: 'none', // Remove old grid
  },
  statCardFull: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statCardFuller: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    marginBottom: 24,
    elevation: 3,
  },
  statNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
  },
  actionButton: {
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
});
