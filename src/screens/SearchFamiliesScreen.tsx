import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator, Linking, Modal, Clipboard } from 'react-native';
import { Card, Title, Button, Surface, Text, TextInput, Appbar, Chip, Avatar, IconButton, Portal, Dialog } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Keyboard } from 'react-native'; 
import {  } from '../utils/api';
import { API_BASE_URL } from '../utils/api';
interface SearchFamiliesScreenProps {
  navigation: any;
}

interface FamilyData {
  id: string;
  childName: string;
  parentName: string;
  mobileNumber: string;
  village: string;
  // registrationDate: string; -- (Still removed as per your DB schema)
  plantDistributed: boolean;
}

const apiService = {
  searchFamilies: async (query: string, signal?: AbortSignal): Promise<FamilyData[]> => {
    let url = `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`;
    
    console.log("FETCHING URL:", url); 
    
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); 
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      console.log("RECEIVED DATA:", data); 
      return data as FamilyData[];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('ERROR FETCHING SEARCH RESULTS:', error);
        Alert.alert('त्रुटि', `खोज परिणाम लोड नहीं हो पाए। (${error.message || 'कृपया पुनः प्रयास करें।'})`);
      }
      return [];
    }
  },
};

export default function SearchFamiliesScreen({ navigation }: SearchFamiliesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFamilies, setFilteredFamilies] = useState<FamilyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyData | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const fetchFamilies = useCallback(async (query: string, signal: AbortSignal) => {
    setLoading(true);
    try {
      const data = await apiService.searchFamilies(query, signal);
      setFilteredFamilies(data);
    } catch (error) {
      console.error("Error in fetchFamilies callback:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // AbortController for cancelling previous requests
    const abortController = new AbortController();
    const signal = abortController.signal;

    // --- DEBOUNCING LOGIC ADDED HERE ---
    const DEBOUNCE_DELAY = 500; // milliseconds

    const handler = setTimeout(() => {
      // Only call fetchFamilies if there's an actual search query,
      // or if you want to fetch all on empty query (current behavior)
      fetchFamilies(searchQuery, signal);
    }, DEBOUNCE_DELAY);

    // Cleanup function: clears the timeout and aborts the fetch request
    // This runs on component unmount AND before re-running the effect
    return () => {
      clearTimeout(handler); // Clear the timeout if searchQuery changes rapidly
      abortController.abort(); // Abort any ongoing fetch request
    };
    // --- END DEBOUNCING LOGIC ---

  }, [fetchFamilies, searchQuery]); // Dependencies: re-run when fetchFamilies or searchQuery change

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
  };

  const triggerSearch = () => {
    Keyboard.dismiss();
    // This function can remain, but the primary trigger is now the debounced useEffect.
    // If you want a hard "search" button to override debounce, you'd call fetchFamilies directly here.
    // For now, it just ensures the latest state is captured if the user hits enter.
  };

  const handleViewDetails = (family: FamilyData) => {
    setSelectedFamily(family);
    setDetailsVisible(true);
  };

  const handleCallFamily = async (mobileNumber: string) => {
    try {
      await Clipboard.setString(mobileNumber);
      Alert.alert('सफलता!', `${mobileNumber} नंबर कॉपी हो गया है। अब आप कॉल कर सकते हैं।`);
    } catch (error) {
      Alert.alert('त्रुटि', 'नंबर कॉपी नहीं हो पाया');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#66BB6A']}
        style={styles.backgroundGradient}
      />
      
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="परिवार खोजें" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Surface style={styles.searchContainer}>
          <TextInput
            label="परिवार खोजें"
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            onSubmitEditing={triggerSearch}
            mode="outlined"
            style={styles.searchInput}
            placeholder="बच्चे का नाम या मोबाइल नंबर लिखें" 
            left={<TextInput.Icon icon="magnify" color="#4CAF50" />}
            right={
              searchQuery ? 
                <TextInput.Icon icon="close" onPress={() => {setSearchQuery('');}} color="#666" />
                : 
                <IconButton icon="magnify" size={24} onPress={triggerSearch}/>
            }
            outlineColor="#E0E0E0"
            activeOutlineColor="#4CAF50"
            theme={{ colors: { primary: '#4CAF50' } }}
          />
          <Button
            mode="contained"
            onPress={triggerSearch}
            style={styles.searchButton}
            buttonColor="#4CAF50"
            disabled={loading}
            icon="magnify"
          >
            खोजें
          </Button>
        </Surface>

        <Surface style={styles.summaryContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Text style={styles.summaryText}>
              {filteredFamilies.length} परिवार मिले
            </Text>
          )}
        </Surface>

        <Surface style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>परिवार खोज रहे हैं...</Text>
            </View>
          ) : filteredFamilies.length > 0 ? (
            filteredFamilies.map((family) => (
              <Card key={family.id} style={styles.familyCard}>
                <Card.Content style={styles.familyCardContent}>
                  <View style={styles.familyHeader}>
                    <View style={styles.familyInfo}>
                      <Avatar.Text 
                        size={50} 
                        label={family.childName.charAt(0)} 
                        style={{ backgroundColor: '#4CAF50' }}
                      />
                      <View style={styles.familyDetails}>
                        <Text style={styles.childName}>{family.childName}</Text>
                        <Text style={styles.parentName}>माता/पिता: {family.parentName}</Text>
                        <Text style={styles.village}>गाँव: {family.village}</Text>
                      </View>
                    </View>
                    <View style={styles.familyActions}>
                      <IconButton
                        icon="phone"
                        size={20}
                        onPress={() => handleCallFamily(family.mobileNumber)}
                        style={styles.actionIcon}
                        iconColor="#4CAF50"
                      />
                      <IconButton
                        icon="eye"
                        size={20}
                        onPress={() => handleViewDetails(family)}
                        style={styles.actionIcon}
                        iconColor="#2196F3"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.familyFooter}>
                    <View style={styles.statusInfo}>
                      {family.plantDistributed && (
                        <Chip 
                          style={styles.plantChip}
                          textStyle={styles.plantText}
                          icon="check-circle"
                        >
                          पौधा मिला
                        </Chip>
                      )}
                    </View>
                    <Text style={styles.mobileNumber}>{family.mobileNumber}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>कोई परिवार नहीं मिला</Text>
              <Text style={styles.emptyStateMessage}>
                कृपया अलग शब्दों से खोजें
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setSearchQuery('');
                }}
                style={styles.resetButton}
                textColor="#4CAF50"
              >
                रीसेट करें
              </Button>
            </View>
          )}
        </Surface>
      </ScrollView>

      {/* Family Details Dialog */}
      <Portal>
        <Dialog visible={detailsVisible} onDismiss={() => setDetailsVisible(false)}>
          <Dialog.Title>परिवार की जानकारी</Dialog.Title>
          <Dialog.Content>
            {selectedFamily && (
              <View style={styles.detailsContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>बच्चे का नाम:</Text>
                  <Text style={styles.detailValue}>{selectedFamily.childName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>माता/पिता:</Text>
                  <Text style={styles.detailValue}>{selectedFamily.parentName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>मोबाइल:</Text>
                  <Text style={styles.detailValue}>{selectedFamily.mobileNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>गाँव:</Text>
                  <Text style={styles.detailValue}>{selectedFamily.village}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>पौधा वितरण:</Text>
                  <Chip 
                    style={selectedFamily.plantDistributed ? styles.plantChip : styles.noPlantChip}
                    textStyle={selectedFamily.plantDistributed ? styles.plantText : styles.noPlantText}
                    icon={selectedFamily.plantDistributed ? "check-circle" : "close-circle"}
                  >
                    {selectedFamily.plantDistributed ? 'हाँ' : 'नहीं'}
                  </Chip>
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDetailsVisible(false)}>बंद करें</Button>
            {selectedFamily && (
              <Button onPress={() => {
                setDetailsVisible(false);
                handleCallFamily(selectedFamily.mobileNumber);
              }}>
                नंबर कॉपी करें
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
  },
  searchButton: {
    marginTop: 10,
    borderRadius: 12,
  },
  summaryContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  familyCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  familyCardContent: {
    padding: 16,
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  familyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  familyDetails: {
    marginLeft: 12,
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  parentName: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  village: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  familyActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    margin: 0,
  },
  familyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  plantChip: {
    height: 28,
    backgroundColor: '#E8F5E8',
  },
  plantText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mobileNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  resetButton: {
    borderRadius: 12,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  detailsContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  noPlantChip: {
    height: 28,
    backgroundColor: '#FFEBEE',
  },
  noPlantText: {
    fontSize: 11,
    color: '#D32F2F',
    fontWeight: '600',
  },
});