import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, Text, FAB, Chip, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, API_BASE_URL } from '../utils/api';

const { width } = Dimensions.get('window');

interface AnganwadiDashboardProps {
  navigation: any;
}

export default function AnganwadiDashboard({ navigation }: AnganwadiDashboardProps) {
  const [stats, setStats] = useState({
    totalPlants: 0,
    distributedPlants: 0,
    activeFamilies: 0,
  });
  const [centerInfo, setCenterInfo] = useState({
    centerName: 'लोड हो रहा है...',
    centerCode: 'लोड हो रहा है...',
    workerName: 'लोड हो रहा है...',
    status: 'सक्रिय'
  });
  const [latestStudentName, setLatestStudentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    timestamp: number;
    type: 'new_student' | 'photo_upload';
  }>>([]);

  // Helper function to save notifications to local storage
  const saveNotifications = async (notifs: typeof notifications) => {
    try {
      await AsyncStorage.setItem('anganwadi_notifications', JSON.stringify(notifs));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  // Helper function to load notifications from local storage
  const loadNotifications = async () => {
    try {
      const saved = await AsyncStorage.getItem('anganwadi_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out notifications older than 24 hours
        const now = Date.now();
        const validNotifications = parsed.filter((notif: any) => 
          (now - notif.timestamp) < 24 * 60 * 60 * 1000
        );
        setNotifications(validNotifications);
        // Save back the filtered notifications
        await saveNotifications(validNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Helper function to add new notification
  const addNotification = async (message: string, type: 'new_student' | 'photo_upload') => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      timestamp: Date.now(),
      type
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // Fetch center information from backend using users table
  const fetchCenterInfo = async () => {
    try {
      // Get logged in user info from AsyncStorage
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (!userInfo) {
        throw new Error('No user info found');
      }
      
      const user = JSON.parse(userInfo);
      
      // Extract center information from user data according to the provided structure
      setCenterInfo({
        centerName: user.address || user.gram || 'आंगनबाड़ी केंद्र',
        centerCode: user.aanganwaadi_id ? `AWC-${user.aanganwaadi_id}` : 'AWC-001',
        workerName: user.name || 'कार्यकर्ता',
        status: 'सक्रिय'
      });
      
    } catch (error) {
      console.error('Error fetching center info:', error);
      // Fallback to default values on error
      setCenterInfo({
        centerName: 'आंगनबाड़ी केंद्र',
        centerCode: 'AWC-001',
        workerName: 'कार्यकर्ता',
        status: 'सक्रिय'
      });
    }
  };

  // Fetch latest student data from backend using existing endpoints
  const fetchLatestStudentData = async () => {
    try {
      setLoading(true);
      
      // Use the existing /search endpoint to get all students
      const response = await fetch(`${API_BASE_URL}/search`);
      if (!response.ok) {
        throw new Error('Failed to fetch students data');
      }
      
      const students = await response.json();
      
      if (students && students.length > 0) {
        // Calculate stats
        const totalStudents = students.length;
        const totalImagesUploaded = students.filter((student: any) => student.plantDistributed).length;
        
        setStats({
          totalPlants: totalStudents,
          distributedPlants: totalImagesUploaded,
          activeFamilies: totalStudents,
        });

        // Get the latest student (assuming students are ordered by registration date)
        // Since we don't have registration date in the response, we'll use the last one in the array
        const latestStudent = students[students.length - 1];
        
        if (latestStudent && latestStudent.childName) {
          const savedLatestStudent = await AsyncStorage.getItem('latest_student_name');
          if (savedLatestStudent !== latestStudent.childName) {
            // New student registered
            setLatestStudentName(latestStudent.childName);
            await AsyncStorage.setItem('latest_student_name', latestStudent.childName);
            await addNotification(
              `${latestStudent.childName} नया परिवार पंजीकृत हुआ`,
              'new_student'
            );
          } else {
            setLatestStudentName(latestStudent.childName);
          }
        }
      } else {
        setStats({
          totalPlants: 0,
          distributedPlants: 0,
          activeFamilies: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching latest student data:', error);
      Alert.alert('त्रुटि', 'डेटा लोड करने में समस्या हुई।');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'अभी';
    if (minutes < 60) return `${minutes} मिनट पहले`;
    if (hours < 24) return `${hours} घंटे पहले`;
    if (days < 7) return `${days} दिन पहले`;
    return new Date(timestamp).toLocaleDateString('hi-IN');
  };

  // Load data on component mount
  useEffect(() => {
    loadNotifications();
    fetchCenterInfo();
    fetchLatestStudentData();
  }, []);

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
                <Text style={styles.centerName}>केंद्र: {centerInfo.centerName}</Text>
                <Text style={styles.centerCode}>कोड: {centerInfo.centerCode}</Text>
                <Text style={styles.workerName}>कार्यकर्ता: {centerInfo.workerName}</Text>
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



        {/* Quick Actions */}
        <Surface style={styles.quickActionsContainer}>
          <Title style={styles.sectionTitle}>त्वरित कार्य</Title>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AddFamily')}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>👨‍👩‍👧‍👦</Text>
              </View>
              <Text style={styles.quickActionText}>नया परिवार जोड़ें</Text>
              <Text style={styles.quickActionDesc}>नए परिवार का पंजीकरण करें</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('SearchFamilies')}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>🔍</Text>
              </View>
              <Text style={styles.quickActionText}>परिवार खोजें</Text>
              <Text style={styles.quickActionDesc}>पंजीकृत परिवारों को खोजें</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('PlantOptions')}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>🌱</Text>
              </View>
              <Text style={styles.quickActionText}>हमारे पौधे</Text>
              <Text style={styles.quickActionDesc}>मूंगा पौधों की जानकारी</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ProgressReport')}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>📊</Text>
              </View>
              <Text style={styles.quickActionText}>प्रगति रिपोर्ट</Text>
              <Text style={styles.quickActionDesc}>अभियान की प्रगति देखें</Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Center Information */}
        <Surface style={styles.centerInfoContainer}>
          <Title style={styles.sectionTitle}>केंद्र की जानकारी</Title>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>केंद्र का नाम</Text>
              <Text style={styles.infoValue}>{centerInfo.centerName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>केंद्र कोड</Text>
              <Text style={styles.infoValue}>{centerInfo.centerCode}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>कार्यकर्ता</Text>
              <Text style={styles.infoValue}>{centerInfo.workerName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>स्थिति</Text>
              <Text style={styles.infoValue}>{centerInfo.status}</Text>
            </View>
          </View>
        </Surface>

        {/* Tips Section */}
        <Surface style={styles.tipsContainer}>
          <Title style={styles.sectionTitle}>आज का टिप</Title>
          <View style={styles.tipContent}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>
              नियमित रूप से परिवारों से संपर्क करें और उनकी प्रगति की जानकारी लें। 
              मूंगा पौधों की देखभाल के लिए उन्हें सही मार्गदर्शन दें।
            </Text>
          </View>
        </Surface>

        {/* Recent Activities */}
        <Surface style={styles.activitiesContainer}>
          <Title style={styles.sectionTitle}>हाल की गतिविधियां</Title>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>लोड हो रहा है...</Text>
            </View>
          ) : notifications.length > 0 ? (
            <View style={styles.activityList}>
              {notifications.map((notification) => {
                const timeAgo = getTimeAgo(notification.timestamp);
                const emoji = notification.type === 'new_student' ? '👨‍👩‍👧‍👦' : '📸';
                const statusText = notification.type === 'new_student' ? 'नया' : 'अपडेट';
                
                return (
                  <View key={notification.id} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <Text style={styles.activityEmoji}>{emoji}</Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{notification.message}</Text>
                      <Text style={styles.activityTime}>{timeAgo}</Text>
                      <Chip style={styles.statusChip} textStyle={styles.statusText}>{statusText}</Chip>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>कोई हाल की गतिविधि नहीं</Text>
            </View>
          )}
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    elevation: 4,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 14,
  },
  centerInfoContainer: {
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
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  tipsContainer: {
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
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    flex: 1,
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});