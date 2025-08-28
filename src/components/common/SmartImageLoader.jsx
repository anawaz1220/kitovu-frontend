// src/components/common/SmartImageLoader.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, User, FileText, AlertCircle } from 'lucide-react';
import faceDetectionService from '../../services/faceDetection.service';
import AuthenticatedImage from './AuthenticatedImage';

const SmartImageLoader = ({ 
  profileImageUrl, 
  documentImageUrl, 
  farmerName,
  onImagesClassified = () => {},
  className = ""
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [classifiedImages, setClassifiedImages] = useState(null);
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState('Initializing AI models...');

  useEffect(() => {
    const classifyImages = async () => {
      if (!profileImageUrl || !documentImageUrl) {
        setIsProcessing(false);
        return;
      }

      try {
        setIsProcessing(true);
        setError(null);
        
        // Step 1: Initialize models
        setProcessingStep('Loading AI models...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        
        // Step 2: Process images
        setProcessingStep('Analyzing images...');
        const result = await faceDetectionService.classifyImages(
          profileImageUrl, 
          documentImageUrl
        );
        
        // Step 3: Complete
        setProcessingStep('Classification complete');
        setClassifiedImages(result);
        onImagesClassified(result);
        
        // Small delay before hiding loader
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsProcessing(false);
        
      } catch (err) {
        console.error('Error in image classification:', err);
        // Handle various image loading errors gracefully
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          setError('Images require authentication - displaying without AI analysis');
        } else if (err.message?.includes('404') || err.message?.includes('Not Found')) {
          setError('Images not found - displaying placeholders');
        } else if (err.message?.includes('Failed to load image')) {
          setError('Unable to load images - displaying without AI analysis');
        } else {
          setError('Failed to classify images - displaying without AI analysis');
        }
        setIsProcessing(false);
        
        // Fallback to original images
        const fallbackResult = {
          profileImage: profileImageUrl,
          documentImage: documentImageUrl,
          isSwapped: false,
          confidence: 'error'
        };
        setClassifiedImages(fallbackResult);
        onImagesClassified(fallbackResult);
      }
    };

    classifyImages();
  }, [profileImageUrl, documentImageUrl, onImagesClassified]);

  if (isProcessing) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Profile Image Placeholder */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-2 border-kitovu-purple bg-gray-100 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-kitovu-purple animate-spin" />
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-xl font-bold text-gray-800">{farmerName}</h3>
            <div className="flex items-center justify-center mt-2">
              <Loader2 className="h-4 w-4 text-gray-500 animate-spin mr-2" />
              <span className="text-xs text-gray-500">{processingStep}</span>
            </div>
          </div>
        </div>

        {/* ID Document Placeholder */}
        <div className="mt-8">
          <p className="text-sm font-medium text-gray-500 mb-2">ID Document</p>
          <div className="border rounded-md bg-gray-100 h-32 flex flex-col items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400 mb-2" />
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 text-gray-500 animate-spin mr-2" />
              <span className="text-xs text-gray-500">Processing...</span>
            </div>
          </div>
        </div>

        {/* Processing Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">AI Image Classification</p>
              <p className="text-xs text-blue-600 mt-1">
                Detecting faces to ensure correct image placement...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">Classification Error</p>
              <p className="text-xs text-red-600 mt-1">
                Using original image order. {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!classifiedImages) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Classification Result Info */}
      {classifiedImages.isSwapped && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
            <div>
              <p className="text-xs font-medium text-yellow-800">Images Auto-Corrected</p>
              <p className="text-xs text-yellow-600 mt-1">
                AI detected swapped images and corrected the order
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-kitovu-purple">
          <AuthenticatedImage 
            src={classifiedImages.profileImage}
            alt={farmerName}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-800 mt-3">
          {farmerName}
        </h3>
      </div>

      {/* ID Document */}
      <div className="mt-8">
        <p className="text-sm font-medium text-gray-500 mb-2">ID Document</p>
        <div className="border rounded-md overflow-hidden">
          <AuthenticatedImage 
            src={classifiedImages.documentImage}
            alt="ID Document" 
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default SmartImageLoader;