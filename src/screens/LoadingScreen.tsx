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
          // Instead of blocking the app, show a warning and proceed to login
          console.warn('Server connection failed, proceeding to login anyway');
          navigation.replace('Login');
        }
      } catch (error) {
        // If connection fails completely, still proceed to login
        console.error('Connection error:', error);
        navigation.replace('Login');
      } finally {
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Connection timeout, proceeding to login');
      navigation.replace('Login');
    }, 10000); // 10 seconds timeout

    checkConnectionAndNavigate();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.centerContent}>
        <Image
          source={require('../assets/logo.jpg')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>हर घर मुंगा</Text>
        <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />
      </View>

      {/* Powered by Section */}
      <View style={styles.footer}>
        <Text style={styles.poweredText}>Powered by</Text>
        <View style={styles.poweredByRow}>
          <Image
            source={require('../assets/ssipmt.jpg')} 
            style={styles.ssipmtLogo}
            resizeMode="contain"
          />
          <Text style={styles.instituteText}>SSIPMT</Text>
        </View>
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
    flex: 1,                        
    justifyContent: 'center',      
    alignItems: 'center',         
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,            
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',           
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
  poweredByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ssipmtLogo: {
    width: 25,
    height: 25,
    marginRight: 6,
  }
});

