import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Alert } from 'react-native';
import { Appbar, Card, Title, Button, Surface, Text, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 5x2 grid with proper spacing

interface PlantOptionsScreenProps {
  navigation: any;
}

interface PlantOption {
  id: number;
  name: string;
  hindiName: string;
  emoji: string;
  description: string;
}

const plantOptions: PlantOption[] = [
  { id: 1, name: 'Munga 1', hindiName: 'मुंगा 1', emoji: '🌱', description: 'मुंगा किस्म 1' },
  { id: 2, name: 'Munga 2', hindiName: 'मुंगा 2', emoji: '🌱', description: 'मुंगा किस्म 2' },
  { id: 3, name: 'Munga 3', hindiName: 'मुंगा 3', emoji: '🌱', description: 'मुंगा किस्म 3' },
  { id: 4, name: 'Munga 4', hindiName: 'मुंगा 4', emoji: '🌱', description: 'मुंगा किस्म 4' },
  { id: 5, name: 'Munga 5', hindiName: 'मुंगा 5', emoji: '🌱', description: 'मुंगा किस्म 5' },
  { id: 6, name: 'Munga 6', hindiName: 'मुंगा 6', emoji: '🌱', description: 'मुंगा किस्म 6' },
  { id: 7, name: 'Munga 7', hindiName: 'मुंगा 7', emoji: '🌱', description: 'मुंगा किस्म 7' },
  { id: 8, name: 'Munga 8', hindiName: 'मुंगा 8', emoji: '🌱', description: 'मुंगा किस्म 8' },
  { id: 9, name: 'Munga 9', hindiName: 'मुंगा 9', emoji: '🌱', description: 'मुंगा किस्म 9' },
  { id: 10, name: 'Munga 10', hindiName: 'मुंगा 10', emoji: '🌱', description: 'मुंगा किस्म 10' },
];

export default function PlantOptionsScreen({ navigation }: PlantOptionsScreenProps) {
  const [uploadedImages, setUploadedImages] = useState<{[key: number]: string}>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const pickImage = async (plantId: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedImages(prev => ({
          ...prev,
          [plantId]: result.assets[0].uri
        }));
        setSnackbarMessage('फोटो सफलतापूर्वक अपलोड हुई!');
        setSnackbarVisible(true);
      }
    } catch (error) {
      Alert.alert('त्रुटि', 'फोटो अपलोड करने में समस्या हुई।');
    }
  };

  const takePhoto = async (plantId: number) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedImages(prev => ({
          ...prev,
          [plantId]: result.assets[0].uri
        }));
        setSnackbarMessage('फोटो सफलतापूर्वक अपलोड हुई!');
        setSnackbarVisible(true);
      }
    } catch (error) {
      Alert.alert('त्रुटि', 'फोटो लेने में समस्या हुई।');
    }
  };

  const showImageOptions = (plantId: number) => {
    Alert.alert(
      'फोटो चुनें',
      'आप कैसे फोटो अपलोड करना चाहते हैं?',
      [
        { text: 'कैमरा', onPress: () => takePhoto(plantId) },
        { text: 'गैलरी', onPress: () => pickImage(plantId) },
        { text: 'रद्द करें', style: 'cancel' },
      ]
    );
  };

  const renderPlantCard = (plant: PlantOption, index: number) => (
    <Card key={plant.id} style={[styles.plantCard, { width: cardWidth }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.plantHeader}>
          <Text style={styles.plantEmoji}>{plant.emoji}</Text>
          <Text style={styles.plantName}>{plant.hindiName}</Text>
        </View>
        
        <Text style={styles.plantDescription}>{plant.description}</Text>
        
        {uploadedImages[plant.id] && (
          <View style={styles.uploadedImageContainer}>
            <Text style={styles.uploadedLabel}>अपलोड की गई फोटो:</Text>
            <View style={styles.uploadedImageBox}>
              <Text style={styles.uploadedText}>✓ फोटो सेव हुई</Text>
            </View>
          </View>
        )}
        
        <Button
          mode="contained"
          icon="camera"
          style={styles.uploadButton}
          buttonColor={uploadedImages[plant.id] ? "#4CAF50" : "#2E7D32"}
          onPress={() => showImageOptions(plant.id)}
        >
          {uploadedImages[plant.id] ? 'फोटो बदलें' : 'अपलोड करें'}
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#66BB6A']}
        style={styles.backgroundGradient}
      />
      
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="हमारे पौधे" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Surface style={styles.titleContainer}>
          <Title style={styles.pageTitle}>हमारे पौधे</Title>
          <Text style={styles.subtitle}>नीचे दिए गए पौधों में से चुनें और फोटो अपलोड करें</Text>
        </Surface>

        <View style={styles.plantsGrid}>
          {plantOptions.map((plant, index) => renderPlantCard(plant, index))}
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
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
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  plantCard: {
    marginBottom: 15,
    elevation: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  plantHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  plantEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 20,
  },
  plantDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  uploadedImageContainer: {
    width: '100%',
    marginBottom: 12,
  },
  uploadedLabel: {
    fontSize: 11,
    color: '#4CAF50',
    marginBottom: 4,
    textAlign: 'center',
  },
  uploadedImageBox: {
    backgroundColor: '#E8F5E8',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  uploadButton: {
    width: '100%',
    borderRadius: 8,
  },
  snackbar: {
    backgroundColor: '#4CAF50',
  },
});
