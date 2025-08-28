// src/services/faceDetection.service.js
import * as faceapi from 'face-api.js';

class FaceDetectionService {
  constructor() {
    this.isInitialized = false;
    this.initializationPromise = null;
    this.cache = new Map(); // Cache detection results
  }

  async initialize() {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this._loadModels();
    await this.initializationPromise;
    this.isInitialized = true;
  }

  async _loadModels() {
    try {
      console.log('Loading face-api.js models...');
      
      // Load only the models we need (lighter approach)
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      ]);
      
      console.log('Face detection models loaded successfully');
    } catch (error) {
      console.error('Error loading face detection models:', error);
      throw new Error('Failed to load face detection models');
    }
  }

  async detectFaceInImage(imageUrl) {
    try {
      // Check cache first
      const cacheKey = imageUrl;
      if (this.cache.has(cacheKey)) {
        console.log('Returning cached face detection result for:', imageUrl);
        return this.cache.get(cacheKey);
      }

      // Ensure models are loaded
      await this.initialize();

      console.log('Detecting face in image:', imageUrl);
      
      // Create image element with authentication
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Get token for authentication  
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      // For authenticated images, we need to fetch them first then create blob URL
      if (token && (imageUrl.includes('/uploads/') || imageUrl.includes('/api/uploads/'))) {
        // Normalize the URL - remove /api if present, backend serves at /uploads
        const normalizedUrl = imageUrl.replace('/api/uploads/', '/uploads/').startsWith('/uploads/') 
          ? `http://localhost:3000${imageUrl.replace('/api/uploads/', '/uploads/')}` 
          : `http://localhost:3000${imageUrl}`;
        try {
          const response = await fetch(normalizedUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          img.src = blobUrl;
        } catch (fetchError) {
          console.error('Failed to fetch authenticated image:', fetchError);
          // Don't throw error for 404 - image doesn't exist
          if (fetchError.message?.includes('404')) {
            console.warn('Image not found, skipping face detection:', imageUrl);
            return false; // No face detected since image doesn't exist
          }
          throw new Error('Failed to load authenticated image');
        }
      } else {
        img.src = imageUrl;
      }
      const loadedImg = await imageLoadPromise;

      // Detect faces using TinyFaceDetector (faster)
      const detection = await faceapi
        .detectSingleFace(loadedImg, new faceapi.TinyFaceDetectorOptions());

      const hasFace = !!detection;
      
      // Clean up blob URL if we created one
      if (img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src);
      }
      
      // Cache the result
      this.cache.set(cacheKey, hasFace);
      
      console.log(`Face detection result for ${imageUrl}:`, hasFace);
      return hasFace;
      
    } catch (error) {
      console.error('Error detecting face:', error);
      // Cache the error result as false to avoid repeated failures
      this.cache.set(imageUrl, false);
      return false;
    }
  }

  async classifyImages(profileImageUrl, documentImageUrl) {
    try {
      console.log('Classifying images...');
      
      const [profileHasFace, documentHasFace] = await Promise.all([
        this.detectFaceInImage(profileImageUrl),
        this.detectFaceInImage(documentImageUrl)
      ]);

      // Decision logic for image classification
      if (profileHasFace && !documentHasFace) {
        // Profile has face, document doesn't - correct order
        return {
          profileImage: profileImageUrl,
          documentImage: documentImageUrl,
          isSwapped: false,
          confidence: 'high'
        };
      } else if (!profileHasFace && documentHasFace) {
        // Document has face, profile doesn't - swapped
        return {
          profileImage: documentImageUrl,
          documentImage: profileImageUrl,
          isSwapped: true,
          confidence: 'high'
        };
      } else if (profileHasFace && documentHasFace) {
        // Both have faces - ambiguous, keep original
        return {
          profileImage: profileImageUrl,
          documentImage: documentImageUrl,
          isSwapped: false,
          confidence: 'low'
        };
      } else {
        // Neither has faces - keep original
        return {
          profileImage: profileImageUrl,
          documentImage: documentImageUrl,
          isSwapped: false,
          confidence: 'low'
        };
      }
    } catch (error) {
      console.error('Error classifying images:', error);
      // Return original order on error
      return {
        profileImage: profileImageUrl,
        documentImage: documentImageUrl,
        isSwapped: false,
        confidence: 'error'
      };
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('Face detection cache cleared');
  }
}

// Create and export singleton instance
const faceDetectionService = new FaceDetectionService();
export default faceDetectionService;