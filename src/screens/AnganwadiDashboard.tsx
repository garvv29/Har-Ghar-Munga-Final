import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, Text, FAB, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AnganwadiDashboardProps {
  navigation: any;
}

export default function AnganwadiDashboard({ navigation }: AnganwadiDashboardProps) {
  const [stats] = useState({
    totalPlants: 45,
    distributedPlants: 38,
    activeFamilies: 32,
  });

  const handleAddFamily = () => {
    navigation.navigate('AddFamily');
  };

  const handleSearchFamilies = () => {
    navigation.navigate('SearchFamilies');
  };

  const handleViewProgress = () => {
    navigation.navigate('ProgressReport');
  };

  const handlePlantOptions = () => {
    navigation.navigate('PlantOptions');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#66BB6A']}
        style={styles.backgroundGradient}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>आं</Text>
              </View>
            </View>
            <View style={styles.headerText}>
              <Title style={styles.headerTitle}>आंगनबाड़ी डैशबोर्ड</Title>
              <View style={styles.centerInfo}>
                <Text style={styles.centerName}>केंद्र: सरस्वती आंगनबाड़ी केंद्र</Text>
                <Text style={styles.centerCode}>कोड: AWC-123-DLH</Text>
                <Text style={styles.workerName}>कार्यकर्ता: श्रीमती सुनीता देवी</Text>
              </View>
              <View style={styles.statusInfo}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>सक्रिय</Text>
                </View>
                <Text style={styles.lastUpdate}>अंतिम अपडेट: आज, 3:45 PM</Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Quick Stats */}
        <Surface style={styles.statsContainer}>
          <Title style={styles.sectionTitle}>आज का सारांश</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalPlants}</Text>
              <Text style={styles.statLabel}>कुल पौधे</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.distributedPlants}</Text>
              <Text style={styles.statLabel}>वितरित पौधे</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.activeFamilies}</Text>
              <Text style={styles.statLabel}>सक्रिय परिवार</Text>
            </View>
          </View>
        </Surface>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AddFamily')}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>👨‍👩‍👧‍👦</Text>
            </View>
            <Text style={styles.quickActionText}>नया परिवार जोड़ें</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('SearchFamilies')}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>🔍</Text>
            </View>
            <Text style={styles.quickActionText}>परिवार खोजें</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('PlantOptions')}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>🌱</Text>
            </View>
            <Text style={styles.quickActionText}>हमारे पौधे</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ProgressReport')}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📊</Text>
            </View>
            <Text style={styles.quickActionText}>प्रगति रिपोर्ट</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <Surface style={styles.activitiesContainer}>
          <Title style={styles.sectionTitle}>हाल की गतिविधियां</Title>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>🌱</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>राम कुमार को पौधा वितरित</Text>
                <Text style={styles.activityTime}>आज, 2:30 PM</Text>
                <Chip style={styles.statusChip} textStyle={styles.statusText}>वितरित</Chip>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>📸</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>सीता देवी ने फोटो अपलोड किया</Text>
                <Text style={styles.activityTime}>कल, 4:15 PM</Text>
                <Chip style={styles.statusChip} textStyle={styles.statusText}>अपडेट</Chip>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>👨‍👩‍👧‍👦</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>नया परिवार पंजीकृत</Text>
                <Text style={styles.activityTime}>कल, 11:20 AM</Text>
                <Chip style={styles.statusChip} textStyle={styles.statusText}>नया</Chip>
              </View>
            </View>
          </View>
        </Surface>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddFamily}
        color="#FFFFFF"
      />
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    elevation: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 16,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  centerInfo: {
    marginBottom: 12,
  },
  centerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  centerCode: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  workerName: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  lastUpdate: {
    fontSize: 11,
    color: '#999999',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 4,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    backgroundColor: '#E8F5E8',
    borderRadius: 24,
    padding: 8,
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 24,
    color: '#4CAF50',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  activitiesContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});