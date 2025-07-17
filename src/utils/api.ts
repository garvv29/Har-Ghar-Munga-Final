import AsyncStorage from '@react-native-async-storage/async-storage'; 

// API Configuration
export const API_BASE_URL = 'https://grx6djfl-5001.inc1.devtunnels.ms'; // Your actual backend URL - keep this!

// API Response Types
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id?: string;
    username?: string;
    role?: 'admin' | 'anganwadi' | 'family' | string;
    name?: string;
    centerCode?: string;
    centerName?: string;
    district?: string;
    block?: string;
  };
  token?: string;
  [key: string]: any; // Allow additional properties
}

export interface FamilyRegistrationData {
  // Child Information
  childName: string;
  gender: 'लड़का' | 'लड़की';
  dateOfBirth: string;
  age: string;
  weight: string;
  height: string;
  
  // Parent Information
  motherName: string;
  fatherName: string;
  mobileNumber: string;
  village: string;
  ward: string;
  panchayat: string;
  district: string;
  
  // Plant Information
  distributionDate: string;
  
  // Center Information
  anganwadiCenterName: string;
  anganwadiCode: string;
  workerName: string;
  workerCode: string;
  block: string;
  registrationDate: string;
  
  // Photos
  plantPhoto: string | null;
  pledgePhoto: string | null;
}

export interface FamilyData {
  id: string;
  childName: string;
  parentName: string;
  mobileNumber: string;
  village: string;
  registrationDate: string;
  plantDistributed: boolean;
  centerCode: string;
  centerName: string;
  workerName: string;
  status: 'active' | 'inactive';
  totalImagesYet?: number;
  plant_photo?: string | null; // This will store the latest plant photo URL/path
  pledge_photo?: string | null; // This will store the latest pledge photo URL/path
  motherName?: string;
  fatherName?: string;
  anganwadiCode?: string;
  // Add other fields from your Family Dashboard fetch if they are part of FamilyData
  age?: string;
  gender?: string;
  weight?: string;
  height?: string;
  panchayat?: string;
  district?: string;
  block?: string;
  dateOfBirth?: string;
  // ... any other fields you fetch and use for FamilyData
}

export interface ProgressReportData {
  period: 'week' | 'month' | 'year';
  totalFamilies: number;
  distributedPlants: number;
  successRate: number;
  newAdded: number;
  activities: Array<{
    date: string;
    activity: string;
    type: 'registration' | 'distribution' | 'photo_upload' | 'progress_update';
  }>;
}

// NOTE: We are moving away from this specific PhotoUploadData interface for `makeRequest`'s JSON body
// as we are now using FormData for plant photo uploads.
// export interface PhotoUploadData {
//   familyId: string;
//   plantStage: string;
//   description?: string;
//   photoUri: string;
// }

// API Service Class
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    // Persist token using AsyncStorage here if not done via Axios interceptor
    // For now, relying on explicit setting/clearing and `getHeaders`
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    // Clear from AsyncStorage as well
    // Storage.removeItem('userToken');
  }

  // Get headers for API requests (for JSON data)
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method for JSON payloads
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(), // Use getHeaders for JSON content-type
    };

    console.log('Making API request to:', url);
    console.log('Request config:', config);

    try {
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        // Try to parse error as JSON if it looks like it
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `HTTP error! status: ${response.status}, message: ${errorText}`);
        } catch (parseError) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Test connection
// In api.ts
// ✅ Clean version of testConnection (inside ApiService class)
async testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: '', password: '' }), // dummy payload
    });
    return { success: response.status !== 404, message: `Status: ${response.status}` };
  } catch (error) {
    return { success: false, message: `Connection failed: ${error}` };
  }
}



  // Authentication APIs
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    // Assuming backend sends token in response.user.token or directly in response.token
    if (response.success && response.token) {
      this.setToken(response.token);
      await AsyncStorage.setItem('userToken', response.token); // Persist token on login
    }
    return response;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{ success: boolean; message: string }>('/logout', {
      method: 'POST',
    });
    if (response.success) {
      this.clearToken(); // Clear token on successful logout
    }
    return response;
  }

  async register(userData: any): Promise<{ success: boolean; message: string; userId?: string }> {
    return this.makeRequest<{ success: boolean; message: string; userId?: string }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getDetails(): Promise<any> {
    return this.makeRequest<any>('/details', {
      method: 'GET',
    });
  }

  // Family Registration APIs
  async registerFamily(familyData: FamilyRegistrationData): Promise<{
    success: boolean;
    message: string;
    familyId: string;
  }> {
    return this.makeRequest<{
      success: boolean;
      message: string;
      familyId: string;
    }>('/families/register', {
      method: 'POST',
      body: JSON.stringify(familyData),
    });
  }

  async getFamilies(centerCode?: string): Promise<FamilyData[]> {
    const endpoint = centerCode ? `/families?centerCode=${centerCode}` : '/families';
    return this.makeRequest<FamilyData[]>(endpoint, {
      method: 'GET',
    });
  }

  async searchFamilies(query: string, centerCode?: string): Promise<FamilyData[]> {
    const endpoint = centerCode 
      ? `/families/search?q=${encodeURIComponent(query)}&centerCode=${centerCode}`
      : `/families/search?q=${encodeURIComponent(query)}`;
    return this.makeRequest<FamilyData[]>(endpoint, {
      method: 'GET',
    });
  }

  async getFamilyDetails(familyId: string): Promise<FamilyData> {
    return this.makeRequest<FamilyData>(`/families/${familyId}`, {
      method: 'GET',
    });
  }

  async getFamilyByUserId(userId: string): Promise<FamilyData> {
    // We already have a getFamilyDetails that takes familyId.
    // Assuming userId IS the familyId for simplicity in the backend, or your backend maps userId to familyId.
    // If your backend endpoint for userId is different, adjust /families/user/${userId}
    return this.makeRequest<FamilyData>(`/families/user/${userId}`, { 
      method: 'GET',
    });
  }

  async updateFamily(familyId: string, updateData: Partial<FamilyData>): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/families/${familyId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Photo Upload APIs - **THIS IS THE NEW/MODIFIED METHOD**
  // This method is now dedicated to uploading plant photos with specific metadata
  async uploadPlantPhoto(
    imageUri: string,
    username: string,
    name: string,
    plantStage: string,
    description: string,
    // Add familyId if your backend needs it to link the photo,
    // though username should be sufficient for mapping to a family.
    // familyId?: string // Optional: if your backend needs familyId explicitly
  ): Promise<{ success: boolean; message: string; photoId?: string; fileUrl?: string }> {
    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileExtension = uriParts[uriParts.length - 1]; 
    const fileName = `plant_photo_${username}_${Date.now()}.${fileExtension}`; 
    
    let mimeType = `image/${fileExtension.toLowerCase()}`;
    if (fileExtension.toLowerCase() === 'jpg') {
        mimeType = 'image/jpeg';
    }

    formData.append('username', username);
    formData.append('name', name); // Parent/child name
    formData.append('plant_stage', plantStage);
    formData.append('description', description);
    // if (familyId) formData.append('familyId', familyId); // If needed by backend

    formData.append('photo', {
      uri: imageUri,
      name: fileName,
      type: mimeType, 
    } as any);

    // This endpoint should be where your Flask backend handles file uploads for plant photos
    const url = `${this.baseURL}/upload_plant_photo`; // **CONFIRM THIS ENDPOINT IN YOUR FLASK BACKEND**
    
    console.log('Uploading plant photo to:', url);
    console.log('FormData:', formData); // For debugging: check formData content

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          // 'Content-Type': 'multipart/form-data' is typically set automatically by fetch
          // when you pass FormData as body, but explicitly setting it doesn't hurt.
        },
        body: formData,
      });

      console.log('Upload Photo Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload Photo Response Error Text:', errorText);
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `HTTP error! status: ${response.status}, message: ${errorText}`);
        } catch (parseError) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Upload Photo Response Data:', data);
      return data;
    } catch (error) {
      console.error('Plant photo upload failed:', error);
      throw error;
    }
  }

  // --- EXISTING BUT MODIFIED uploadFile for generic file uploads (not plant photos specifically) ---
  // This is now more generic for other file types if needed.
  // The 'type' parameter will dictate content for the backend.
  // You might not use this for plant photos anymore if 'uploadPlantPhoto' is preferred.
  async uploadFile(fileUri: string, type: 'photo' | 'document', additionalData?: { [key: string]: string }): Promise<{
    success: boolean;
    message: string;
    fileUrl: string;
  }> {
    const formData = new FormData();
    const uriParts = fileUri.split('.');
    const fileExtension = uriParts[uriParts.length - 1]; 
    const fileName = `generic_file_${Date.now()}.${fileExtension}`; 
    let mimeType = `application/octet-stream`; // Default for generic files

    if (type === 'photo') {
        if (fileExtension.toLowerCase() === 'png') mimeType = 'image/png';
        else if (fileExtension.toLowerCase() === 'jpg' || fileExtension.toLowerCase() === 'jpeg') mimeType = 'image/jpeg';
    } else if (type === 'document') {
        if (fileExtension.toLowerCase() === 'pdf') mimeType = 'application/pdf';
        // Add other document types as needed
    }

    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: fileName,
    } as any);
    formData.append('type', type); // This 'type' tells backend what kind of file it is (photo/document)

    // Append any additional data provided
    if (additionalData) {
      for (const key in additionalData) {
        formData.append(key, additionalData[key]);
      }
    }

    const url = `${this.baseURL}/upload/file`; // Your generic file upload endpoint
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          // 'Content-Type': 'multipart/form-data' is implicitly set by fetch
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `HTTP error! status: ${response.status}, message: ${errorText}`);
        } catch (parseError) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Generic file upload failed:', error);
      throw error;
    }
  }

  // Get total images uploaded (global) - this looks like a generic endpoint
  async getTotalImages(): Promise<{ totalImages: number }> {
    return this.makeRequest<{ totalImages: number }>('/photos/total', {
      method: 'GET',
    });
  }

  // Fetch total families and total photos uploaded from /search2 - Keep if still used
  // This function is outside the class, which is fine if it doesn't need 'this.token'
  // but it's often better to put all API calls within the ApiService class for consistency.
  // If `search2` needs authentication, it should be moved into `ApiService` and use `makeRequest`.
  async fetchTotalFamiliesAndPhotosExternal() { // Renamed to avoid clash if moved into class
    try {
      const response = await fetch(`${API_BASE_URL}/search2`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch totals: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching total families and photos:', error);
      throw error;
    }
  }
}

// Create and export API service instance
export const apiService = new ApiService(API_BASE_URL); 

// The fetchTotalFamiliesAndPhotos function was originally outside the class.
// It's generally better to put all API logic inside the class.
// If you still need this exact function as is, keep it, but consider moving it.
export async function fetchTotalFamiliesAndPhotos() {
  const response = await fetch(`${API_BASE_URL}/search2`);
  if (!response.ok) {
    throw new Error('Failed to fetch totals');
  }
  return response.json();
}