import React, { useState, useRef } from 'react';
import { Camera, Upload, RotateCcw } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

// Moved compressImage function here for now - we can move it to utils later
const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          },
          'image/jpeg',
          0.7
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const PhotoCapture = ({ 
  label, 
  photo, 
  onPhotoCapture, 
  onPhotoRemove, 
  required = false 
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  
const startCamera = async () => {
    try {
      // Set camera open state first
      setIsCameraOpen(true);
      
      // Wait for a brief moment to ensure video element is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if video element exists
      if (!videoRef.current) {
        throw new Error('Video element not initialized');
      }
  
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
  
      // Double check video element still exists
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } else {
        // Clean up stream if video element is gone
        stream.getTracks().forEach(track => track.stop());
        throw new Error('Video element not available');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCameraOpen(false);
      
      // More user-friendly error messages
      let errorMessage = 'Error accessing camera. ';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Please ensure camera permissions are granted in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera device found. Please ensure your camera is connected.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Your camera might be in use by another application.';
      } else {
        errorMessage += 'Please try again or use the upload option.';
      }
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const compressedFile = await compressImage(file);
      const imageUrl = URL.createObjectURL(compressedFile);
      onPhotoCapture(imageUrl, compressedFile);
      stopCamera();
    }, 'image/jpeg', 0.8);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert('Please upload JPG or PNG files only');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      const imageUrl = URL.createObjectURL(compressedFile);
      onPhotoCapture(imageUrl, compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {isCameraOpen ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-lg"
            style={{ minHeight: '256px' }} 
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <button
              type="button"
              onClick={capturePhoto}
              className="bg-kitovu-purple text-white p-2 rounded-full"
            >
              <Camera className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-red-500 text-white p-2 rounded-full"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
          </div>
        </div>
      ) : photo ? (
        <div className="relative">
          <img
            src={photo}
            alt={label}
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={onPhotoRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Camera className="h-5 w-5 mr-2 text-gray-400" />
            Take Photo
          </button>
          <label className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <Upload className="h-5 w-5 mr-2 text-gray-400" />
            Upload Photo
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;