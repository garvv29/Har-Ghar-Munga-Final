import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { Provider as PaperProvider, Card , Button, Surface, TextInput, Text, HelperText } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService, LoginResponse } from './src/utils/api';

import LoadingScreen from './src/screens/LoadingScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AnganwadiDashboard from './src/screens/AnganwadiDashboard';
import FamilyDashboard from './src/screens/FamilyDashboard';
import UploadPhotoScreen from './src/screens/UploadPhotoScreen';
import AddFamilyScreen from './src/screens/AddFamilyScreen';
import SearchFamiliesScreen from './src/screens/SearchFamiliesScreen';
import PlantOptionsScreen from './src/screens/PlantOptionsScreen';
import ProgressReportScreen from './src/screens/ProgressReportScreen';
import FamilyProgressScreen from './src/screens/FamilyProgressScreen';


const { width } = Dimensions.get('window');
const Stack = createStackNavigator();

function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('चेतावनी', 'कृपया उपयोगकर्ता नाम और पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);
    
    try {
      // Test server connection (optional)
      console.log('Testing connection to server...');
      const connectionTest = await apiService.testConnection();
      console.log('Connection test result:', connectionTest);

      if (!connectionTest.success) {
        Alert.alert('कनेक्शन त्रुटि', `सर्वर से कनेक्ट नहीं हो पा रहा है: ${connectionTest.message}`);
        return;
      }
      
      console.log('Connection successful, attempting login...');
      const response = await apiService.login(email.trim(), password);
      console.log('Login response:', response);

      if (response.success && response.user) {
        const user = response.user;

        // Store the token if available
        if (response.token) {
          apiService.setToken(response.token);
        }
        
        // Navigate based on user role
        const userRole = response.user?.role || response.role;
        console.log('User role:', userRole);
        
        switch (userRole) {
          case 'admin':
          Alert.alert('Admin dashboard is disabled.');
          break;
          case 'anganwadi':
          navigation.navigate('AnganwadiDashboard');
          break;
          case 'family':
            const userName = user.name || '';
            const userUsername = user.username || '';
            const guardianName = (user as any).guardian_name || '';
            const fatherName = (user as any).father_name || '';
            const motherName = (user as any).mother_name || '';
            const age = (user as any).age || '';
            const aanganwadi_code = (user as any).aanganwadi_code || (user as any).center_code || (user as any).anganwadi_center_code || '';
            console.log("Aanganwadi code:", aanganwadi_code);
            console.log("Full user object:", user);
            console.log("Student details received:", user);

            navigation.navigate('FamilyDashboard', {
              userId: userUsername,
              name: userName,
              age,
              guardianName,
              fatherName,
              motherName,
              aanganwadi_code,
            });
          break;
        default:
            // If no specific role, try to determine from username or other fields
            if (response.user?.username?.toUpperCase().includes('ADMIN') || 
                response.user?.username?.toUpperCase().includes('CGCO')) {
              Alert.alert('Admin dashboard is disabled.');
            } else if (response.user?.username?.toUpperCase().includes('ANGANWADI') || 
                       response.user?.username?.toUpperCase().includes('CGAB')) {
              navigation.navigate('AnganwadiDashboard');
            } else if (response.user?.username?.toUpperCase().includes('FAMILY') || 
                       response.user?.username?.toUpperCase().includes('CGPV')) {
              // Family user - extract and pass family details
              const userName = user.name || '';
              const userUsername = user.username || '';
              const guardianName = (user as any).guardian_name || '';
              const fatherName = (user as any).father_name || '';
              const motherName = (user as any).mother_name || '';
              const age = (user as any).age || '';
              const aanganwadi_code = (user as any).aanganwadi_code || (user as any).center_code || (user as any).anganwadi_center_code || '';
              
              navigation.navigate('FamilyDashboard', {
                userId: userUsername,
                name: userName,
                age,
                guardianName,
                fatherName,
                motherName,
                aanganwadi_code,
              });
            } else {
              Alert.alert('त्रुटि', 'अज्ञात उपयोगकर्ता भूमिका।');
            }
          break;
      }
      } else {
        Alert.alert('लॉगिन विफल', response.message || 'लॉगिन में त्रुटि हुई।');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('नेटवर्क त्रुटि', `सर्वर से कनेक्ट नहीं हो पा रहा है: ${error}`);
    } finally {
      setLoading(false);
    }
  };



  const handleSignUp = () => {
    // Add sign up navigation logic
  };

  // Ensure app content is visible during screen recording
  useEffect(() => {
    // Disable any privacy restrictions that might hide content
    if (Platform.OS === 'android') {
      // For Android, ensure screen recording is allowed
      console.log('Screen recording enabled for Android');
    } else if (Platform.OS === 'ios') {
      // For iOS, ensure screen recording is allowed
      console.log('Screen recording enabled for iOS');
    }
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <StatusBar style="light" />
        
        {/* Background Gradient */}
        <LinearGradient
          colors={['#2E7D32', '#4CAF50', '#66BB6A']}
          style={styles.backgroundGradient}
        />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Surface style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>HGM</Text>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <text style={styles.headerTitle}>हर घर मुंगा</text>
            </View>
          </Surface>

          {/* Login Card */}
          <Card style={styles.loginCard}>
            <Card.Content>
              <text style={styles.loginTitle}>लॉगिन करें</text>
              <text style={styles.loginSubtitle}>
                हर घर मुंगा अभियान में आपका स्वागत है
              </text>

              <TextInput
                label="उपयोगकर्ता नाम"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
                theme={{ colors: { primary: '#2E7D32' } }}
              />

              <TextInput
                label="पासवर्ड"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                theme={{ colors: { primary: '#2E7D32' } }}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
                buttonColor="#2E7D32"
                contentStyle={styles.loginButtonContent}
              >
                {loading ? 'लॉगिन हो रहा है...' : 'लॉगिन करें'}
              </Button>
            </Card.Content>
          </Card>

          {/* Powered by SSIPMT */}
          <View style={styles.poweredByContainer}>
            <Text style={styles.poweredByText}>Powered by</Text>
            <Text style={styles.ssimptText}>SSIPMT RAIPUR</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Loading"
          screenOptions={{
            headerShown: false,
          }}
        >
          
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AnganwadiDashboard" component={AnganwadiDashboard} />
          <Stack.Screen name="FamilyDashboard" component={FamilyDashboard} />
          <Stack.Screen name="UploadPhoto" component={UploadPhotoScreen as any} />
          <Stack.Screen name="AddFamily" component={AddFamilyScreen} />
          <Stack.Screen name="SearchFamilies" component={SearchFamiliesScreen} />
          <Stack.Screen name="PlantOptions" component={PlantOptionsScreen} />
          <Stack.Screen name="ProgressReport" component={ProgressReportScreen} />
          <Stack.Screen name="FamilyProgress" component={FamilyProgressScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
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
  },
  header: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    elevation: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: 5,
    width: '100%',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 32,
    includeFontPadding: false,
    flexWrap: 'wrap',
    width: '100%',
  },

  loginCard: {
    borderRadius: 20,
    elevation: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardContent: {
    padding: 32,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },

  loginButton: {
    borderRadius: 12,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  poweredByContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  poweredByText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    textAlign: 'center',
  },
  ssimptText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  helpContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 4,
  },
  helpPassword: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 8,
  },
});
