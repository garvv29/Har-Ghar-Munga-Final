import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, ActivityIndicator, Alert } from 'react-native';
import { apiService } from '../utils/api'; 

export default function LoadingScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnectionAndNavigate = async () => {
      try {
        const result = await apiService.testConnection();

        if (result.success) {
          navigation.replace('Login');
        } else {
          Alert.alert('नेटवर्क त्रुटि', 'सर्वर से कनेक्ट नहीं हो पा रहा है।');
        }
      } catch (error) {
        Alert.alert('त्रुटि', 'कुछ गलत हो गया।');
      } finally {
        setLoading(false);
      }
    };

    checkConnectionAndNavigate();
  }, []);

  return (
    <View style={styles.container}>
      {/* Main Image */}
      <View style={styles.centerContent}>
        <Image
          source={require('../assets/logo.jpg')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>हर घर मुंगा</Text>
        <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />
      </View>

      {/* Powered by */}
      <View style={styles.footer}>
        <Text style={styles.poweredText}>Powered by</Text>
        <Text style={styles.instituteText}>SSIPMT</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  centerContent: {
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  footer: {
    alignItems: 'center',
  },
  poweredText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.7,
  },
  instituteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
});
