// src/components/dashboard/RightDrawer.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';

import { X, User, Phone, MapPin, Calendar, CreditCard, User2, Tractor, Loader2, Users, RefreshCw, Edit3, Save, XCircle } from 'lucide-react';
import defaultUserImage from '../../assets/images/default-user.svg';
import { getFarmerById, getFarmsByFarmerId, clearCache } from '../../services/api/farmerQuery.service';
import { farmerService } from '../../services/api/farmer.service';
import SmartImageLoader from '../common/SmartImageLoader';
import StableFormInput from './StableFormInput';
import {
  GENDER_OPTIONS,
  ID_TYPE_OPTIONS,
  EDUCATION_OPTIONS,
  ABIA_LGA_OPTIONS,
  COOPERATIVE_ACTIVITIES,
  MARKETING_CHANNEL_OPTIONS
} from '../../constants/farmerFormConstants';


// Base URL for images - use your development server URL
// const IMAGE_BASE_URL = import.meta.env.VITE_API_URL||'http://localhost:3000';
// console.log('Using IMAGE_BASE_URL:', IMAGE_BASE_URL);
const IMAGE_BASE_URL = 'http://localhost:3000';
// Simple date formatter function (to avoid date-fns dependency)
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Format cooperative activities from complex nested format
const formatCooperativeActivities = (activities) => {
  if (!activities) return 'None';
  
  console.log('Raw activities input:', activities);
  
  try {
    // New format: "{\"{\\\"{\\\\\\\"Farming\\\\\\\"\\\"\",\"\\\"\\\\\\\"Marketing\\\\\\\"\\\"\",\"\\\"\\\\\\\"group_farming\\\\\\\"\\\"\",\"\\\"\\\\\\\"joint_marketing\\\\\\\"\\\"\",\"\\\"\\\\\\\"processing_activities\\\\\\\"\\\"\",\"\\\"\\\\\\\"financial_services\\\\\\\"\\\"\",\"\\\"\\\\\\\"training_capacity_building\\\\\\\"\\\"\",\"\\\"\\\\\\\"storage_facilities\\\\\\\"\\\"\",\"\\\"\\\\\\\"bulk_purchasing_of_inputs\\\\\\\"}\\\"}\",\"group_farming\",\"joint_marketing\",\"processing_activities\"}"
    
    // Step 1: Use regex to extract all activity names that are not heavily escaped
    const activityPattern = /\"([a-z_]+)\"/g;
    const matches = [];
    let match;
    
    while ((match = activityPattern.exec(activities)) !== null) {
      const activity = match[1];
      // Only include activities that contain letters and underscores (filter out heavily escaped JSON)
      if (/^[a-z_]+$/.test(activity) && activity.length > 2) {
        matches.push(activity);
      }
    }
    
    console.log('Regex extracted activities:', matches);
    
    // Step 2: Remove duplicates and format
    const uniqueActivities = [...new Set(matches)];
    
    const formattedActivities = uniqueActivities.map(activity => {
      return activity
        .toLowerCase()
        .replace(/[_-]/g, ' ') // Replace underscores with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });
    
    console.log('Final formatted activities:', formattedActivities);
    
    if (formattedActivities.length > 0) {
      return formattedActivities.join(', ');
    }
    
    // Fallback: Try to extract from the heavily escaped part
    console.log('Trying fallback approach');
    
    // Look for patterns like \\\"activity_name\\\"
    const fallbackPattern = /\\+"([a-z_]+)\\+"/g;
    const fallbackMatches = [];
    let fallbackMatch;
    
    while ((fallbackMatch = fallbackPattern.exec(activities)) !== null) {
      const activity = fallbackMatch[1];
      if (activity.length > 2) {
        fallbackMatches.push(activity);
      }
    }
    
    console.log('Fallback extracted activities:', fallbackMatches);
    
    if (fallbackMatches.length > 0) {
      const uniqueFallback = [...new Set(fallbackMatches)];
      const formattedFallback = uniqueFallback.map(activity => {
        return activity
          .toLowerCase()
          .replace(/[_-]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
      
      return formattedFallback.join(', ');
    }
    
    // Final attempt: Extract any word-like patterns
    const wordPattern = /\b([a-z_]{3,})\b/gi;
    const words = [];
    let wordMatch;
    
    while ((wordMatch = wordPattern.exec(activities)) !== null) {
      const word = wordMatch[1].toLowerCase();
      if (!word.includes('cooperative') && !word.includes('activities') && word.length > 3) {
        words.push(word);
      }
    }
    
    if (words.length > 0) {
      const uniqueWords = [...new Set(words)];
      const formattedWords = uniqueWords.map(word => {
        return word
          .replace(/[_-]/g, ' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      });
      
      return formattedWords.join(', ');
    }
    
    return 'Unable to parse activities';
    
  } catch (error) {
    console.error('Error parsing activities:', error);
    return 'Unable to parse activities';
  }
};

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Check if the path is already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Ensure the path starts with a slash
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Return the full URL
  return `${IMAGE_BASE_URL}${cleanPath}`;
  console.log('Constructed image URL:', `${IMAGE_BASE_URL}${cleanPath}`);
};

const RightDrawer = ({ isOpen, onClose, selectedFarmer, onFarmSelect, onFarmsLoaded }) => {
  const [farmerDetails, setFarmerDetails] = useState(null);
  const [farms, setFarms] = useState([]);
  const [isLoadingFarmer, setIsLoadingFarmer] = useState(false);
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [farmerError, setFarmerError] = useState(null);
  const [farmsError, setFarmsError] = useState(null);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [newImages, setNewImages] = useState({
    farmer_picture: null,
    id_document_picture: null
  });
  
  const fetchedFarmerIdRef = useRef(null);
  const [farmerImageError, setFarmerImageError] = useState(false);
  const [idDocumentImageError, setIdDocumentImageError] = useState(false);

  const [classifiedImages, setClassifiedImages] = useState(null);
  const [showSmartLoader, setShowSmartLoader] = useState(false);
  
  // Fetch farmer details when selectedFarmer changes
  useEffect(() => {
    const fetchFarmerDetails = async () => {
      if (!isOpen || !selectedFarmer || !selectedFarmer.farmer_id) {
        setFarmerDetails(null);
        return;
      }

      // If we already have the farmer data from search results, check if it's complete
      if (selectedFarmer.first_name && selectedFarmer.last_name) {
        console.log('Using farmer data from search selection');
        setFarmerDetails(selectedFarmer);
        fetchedFarmerIdRef.current = selectedFarmer.farmer_id;
        return;
      }

      // Prevent duplicate fetches for the same farmer
      if (fetchedFarmerIdRef.current === selectedFarmer.farmer_id) return;

      setIsLoadingFarmer(true);
      setFarmerError(null);

      try {
        console.log('Fetching detailed farmer information for ID:', selectedFarmer.farmer_id);
        const farmer = await getFarmerById(selectedFarmer.farmer_id);
        setFarmerDetails(farmer);
        fetchedFarmerIdRef.current = selectedFarmer.farmer_id;
      } catch (err) {
        console.error('Error fetching farmer details:', err);
        setFarmerError('Failed to load farmer details');
        setFarmerDetails(null);
      } finally {
        setIsLoadingFarmer(false);
      }
    };

    fetchFarmerDetails();
    
    // Reset image error states when selected farmer changes
    setFarmerImageError(false);
    setIdDocumentImageError(false);
  }, [selectedFarmer?.farmer_id, isOpen]);

  // Fetch farms when farmer details are loaded
  useEffect(() => {
    const fetchFarms = async () => {
      if (!farmerDetails || !farmerDetails.farmer_id) {
        setFarms([]);
        return;
      }

      setIsLoadingFarms(true);
      setFarmsError(null);

      try {
        console.log('Fetching farms for farmer ID:', farmerDetails.farmer_id);
        const farmsData = await getFarmsByFarmerId(farmerDetails.farmer_id);
        setFarms(farmsData);
        
        // Pass farms data up to parent component for map display
        if (onFarmsLoaded && typeof onFarmsLoaded === 'function') {
          onFarmsLoaded(farmsData);
        }
      } catch (err) {
        console.error('Error fetching farms:', err);
        setFarmsError('Failed to load farms data');
        setFarms([]);
        if (onFarmsLoaded && typeof onFarmsLoaded === 'function') {
          onFarmsLoaded([]);
        }
      } finally {
        setIsLoadingFarms(false);
      }
    };

    fetchFarms();
  }, [farmerDetails?.farmer_id, onFarmsLoaded]);

  // Trigger smart image loading when farmer details are available
useEffect(() => {
  if (farmerDetails && farmerDetails.farmer_picture && farmerDetails.id_document_picture) {
    const profileUrl = getImageUrl(farmerDetails.farmer_picture);
    const documentUrl = getImageUrl(farmerDetails.id_document_picture);
    
    // Only show smart loader if both images are available
    if (profileUrl && documentUrl) {
      setShowSmartLoader(true);
      setClassifiedImages(null);
    }
  } else {
    setShowSmartLoader(false);
  }
}, [farmerDetails]);

  // Handle refresh of farmer data
  const handleRefreshFarmer = async () => {
    if (!selectedFarmer?.farmer_id) return;
    
    // Clear cache and refetch
    fetchedFarmerIdRef.current = null;
    setFarmerDetails(null);
    setFarms([]);
    
    // Trigger refetch by updating the effect dependency
    const farmer = { ...selectedFarmer };
    delete farmer.first_name; // Remove cached data to force API call
    // This will trigger the useEffect to fetch fresh data
  };

  const handleImagesClassified = useCallback((result) => {
    console.log('Images classified:', result);
    setClassifiedImages(result);
    setShowSmartLoader(false);
  }, []);

  // Track if form data has been initialized to prevent re-renders
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Initialize edit form data when entering edit mode (only once)
  useEffect(() => {
    if (farmerDetails && isEditMode && !isFormInitialized) {
      const initialData = {
        first_name: farmerDetails.first_name || '',
        last_name: farmerDetails.last_name || '',
        gender: farmerDetails.gender || '',
        date_of_birth: farmerDetails.date_of_birth ? farmerDetails.date_of_birth.split('T')[0] : '',
        phone_number: farmerDetails.phone_number || '',
        alternate_phone_number: farmerDetails.alternate_phone_number || '',
        street_address: farmerDetails.street_address || '',
        lga: farmerDetails.lga || '',
        education: farmerDetails.education || '',
        id_type: farmerDetails.id_type || '',
        id_number: farmerDetails.id_number || '',
        agricultural_training: farmerDetails.agricultural_training ?? false,
        training_provider: farmerDetails.training_provider || '',
        certificate_issued: farmerDetails.certificate_issued ?? false,
        received_financing: farmerDetails.received_financing ?? false,
        finance_provider: farmerDetails.finance_provider || '',
        finance_amount: farmerDetails.finance_amount || '',
        interest_rate: farmerDetails.interest_rate || '',
        financing_duration_years: farmerDetails.financing_duration_years || '',
        financing_duration_months: farmerDetails.financing_duration_months || '',
        remarks: farmerDetails.remarks || '',
        // Cooperative data
        member_of_cooperative: farmerDetails.member_of_cooperative ?? false,
        cooperative_name: farmerDetails.cooperative_name || '',
        cooperative_activities: farmerDetails.cooperative_activities || '',
        marketing_channel: farmerDetails.marketing_channel || '',
        offtaker_name: farmerDetails.offtaker_name || ''
      };
      
      setEditFormData(initialData);
      setEditErrors({});
      setIsFormInitialized(true);
    }
  }, [farmerDetails, isEditMode, isFormInitialized]);

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!editFormData.first_name?.trim()) errors.first_name = 'First name is required';
    if (!editFormData.last_name?.trim()) errors.last_name = 'Last name is required';
    if (!editFormData.gender) errors.gender = 'Gender is required';
    if (!editFormData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!editFormData.phone_number?.trim()) errors.phone_number = 'Phone number is required';
    if (editFormData.phone_number && !/^[+\-\d\s]+$/.test(editFormData.phone_number)) {
      errors.phone_number = 'Phone number can only contain digits, spaces, + and -';
    }
    if (!editFormData.lga) errors.lga = 'LGA is required';
    if (!editFormData.id_type) errors.id_type = 'ID type is required';
    if (!editFormData.id_number?.trim()) errors.id_number = 'ID number is required';
    
    // Date validation
    if (editFormData.date_of_birth) {
      const birthDate = new Date(editFormData.date_of_birth);
      const today = new Date();
      if (birthDate >= today) {
        errors.date_of_birth = 'Date of birth must be in the past';
      }
    }
    
    // Lease months validation
    if (editFormData.financing_duration_months && 
        (isNaN(editFormData.financing_duration_months) || 
         editFormData.financing_duration_months > 12 || 
         editFormData.financing_duration_months < 0)) {
      errors.financing_duration_months = 'Financing duration months must be between 0 and 12';
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Stable value change handler
  const handleValueChange = useCallback((field, value) => {
    // Handle file inputs
    if (field === 'farmer_picture' || field === 'id_document_picture') {
      setNewImages(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error for this field
    setEditErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Enter edit mode
  const handleEditMode = () => {
    setIsEditMode(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData({});
    setEditErrors({});
    setIsFormInitialized(false);
    setNewImages({
      farmer_picture: null,
      id_document_picture: null
    });
  };

  // Save farmer updates
  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare farmer data (exclude cooperative data)
      const { 
        member_of_cooperative, 
        cooperative_name, 
        cooperative_activities, 
        marketing_channel, 
        offtaker_name, 
        ...farmerUpdateData 
      } = editFormData;

      // Update farmer details
      await farmerService.updateFarmer(
        farmerDetails.farmer_id, 
        farmerUpdateData, 
        newImages.farmer_picture, 
        newImages.id_document_picture
      );

      // Update cooperative information if provided
      if (member_of_cooperative !== undefined) {
        const affiliationData = {
          farmer_id: farmerDetails.farmer_id,
          member_of_cooperative,
          name: cooperative_name,
          activities: cooperative_activities ? cooperative_activities.split(',').map(a => a.trim()) : [],
          marketing_channel,
          offtaker_name
        };
        
        await farmerService.updateFarmAffiliation(affiliationData);
      }

      // Clear cache to ensure fresh data
      clearCache();
      
      // Refetch farmer details
      fetchedFarmerIdRef.current = null;
      const updatedFarmer = await getFarmerById(farmerDetails.farmer_id);
      setFarmerDetails(updatedFarmer);
      
      // Exit edit mode
      setIsEditMode(false);
      setEditFormData({});
      setEditErrors({});
      setIsFormInitialized(false);
      
      console.log('Farmer updated successfully');
    } catch (error) {
      console.error('Error updating farmer:', error);
      setEditErrors({ general: 'Failed to update farmer. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Cooperative activities input component - completely stable
  const CooperativeActivitiesInput = React.memo(() => {
    const currentActivities = editFormData.cooperative_activities ? editFormData.cooperative_activities.split(',').map(a => a.trim()).filter(Boolean) : [];
    
    const handleActivityChange = useCallback((activityValue, isChecked) => {
      setEditFormData(prev => {
        const current = prev.cooperative_activities ? prev.cooperative_activities.split(',').map(a => a.trim()).filter(Boolean) : [];
        
        let newActivities;
        if (isChecked) {
          newActivities = [...current, activityValue];
        } else {
          newActivities = current.filter(a => a !== activityValue);
        }
        
        return {
          ...prev,
          cooperative_activities: newActivities.join(',')
        };
      });
    }, []); // No dependencies
    
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cooperative Activities
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COOPERATIVE_ACTIVITIES.map(activity => (
            <label key={activity.value} className="flex items-center">
              <input
                type="checkbox"
                checked={currentActivities.includes(activity.value)}
                onChange={(e) => handleActivityChange(activity.value, e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">{activity.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  });


  // Don't render anything if drawer is not open or no farmer is selected
  if (!isOpen || !selectedFarmer) {
    return null;
  }

  // Show loading state while fetching farmer details
  if (isLoadingFarmer || (!farmerDetails && !farmerError)) {
    return (
      <div 
        className={`bg-white w-80 shadow-lg h-full border-l transition-all duration-300 overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-20`}
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0 }}
      >
        <div className="p-4 flex justify-between items-center border-b bg-kitovu-purple text-white">
          <h2 className="text-lg font-medium">Farmer Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-kitovu-purple animate-spin" />
          <p className="mt-4 text-gray-600">Loading farmer details...</p>
        </div>
      </div>
    );
  }

  // Show error state if farmer fetch failed
  if (farmerError && !farmerDetails) {
    return (
      <div 
        className={`bg-white w-80 shadow-lg h-full border-l transition-all duration-300 overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-20`}
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0 }}
      >
        <div className="p-4 flex justify-between items-center border-b bg-kitovu-purple text-white">
          <h2 className="text-lg font-medium">Farmer Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <div className="text-red-500 text-center">
            <p className="font-medium">Error Loading Farmer</p>
            <p className="text-sm mt-2">{farmerError}</p>
            <button
              onClick={handleRefreshFarmer}
              className="mt-4 px-4 py-2 bg-kitovu-purple text-white rounded-md hover:bg-purple-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format date of birth if available
  const formattedDob = formatDate(farmerDetails.date_of_birth);

  // Helper function to display address
  const getFullAddress = () => {
    const parts = [
      farmerDetails.street_address,
      farmerDetails.city,
      farmerDetails.lga,
      farmerDetails.state,
      'Nigeria'
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  // Handle farm selection with memoization
  const handleFarmSelect = (farm) => {
    if (onFarmSelect && typeof onFarmSelect === 'function') {
      onFarmSelect(farm);
    }
  };
  
  // Handle image loading error for farmer picture
  const handleFarmerImageError = (e) => {
    console.error('Error loading farmer image:', e.target.src);
    setFarmerImageError(true);
  };
  
  // Handle image loading error for ID document picture
  const handleIdDocumentImageError = (e) => {
    console.error('Error loading ID document image:', e.target.src);
    setIdDocumentImageError(true);
  };
  
  // Use classified images if available, otherwise use original logic
  const farmerImageSrc = classifiedImages 
    ? classifiedImages.profileImage
    : (!farmerImageError && farmerDetails.farmer_picture 
        ? getImageUrl(farmerDetails.farmer_picture) 
        : defaultUserImage);
        
  const idDocumentImageSrc = classifiedImages 
    ? classifiedImages.documentImage
    : (!idDocumentImageError && farmerDetails.id_document_picture 
        ? getImageUrl(farmerDetails.id_document_picture) 
        : defaultUserImage);

  return (
    <div 
      className={`bg-white w-80 shadow-lg h-full border-l transition-all duration-300 overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-20`}
      style={{ position: 'absolute', top: 0, bottom: 0, right: 0 }}
    >
      {/* Drawer Header */}
      <div className="p-4 flex justify-between items-center border-b bg-kitovu-purple text-white">
        <h2 className="text-lg font-medium">
          {isEditMode ? 'Edit Farmer Details' : 'Farmer Details'}
        </h2>
        <div className="flex items-center space-x-2">
          {!isEditMode ? (
            <button
              onClick={handleEditMode}
              className="text-white hover:text-gray-200"
              title="Edit farmer details"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                disabled={isUpdating}
                className="text-white hover:text-gray-200 disabled:opacity-50"
                title="Save changes"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="text-white hover:text-gray-200 disabled:opacity-50"
                title="Cancel editing"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Farmer Details */}
      <div className="p-4">
        
        {/* Show general error if any */}
        {editErrors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{editErrors.general}</p>
          </div>
        )}

        {/* Details List */}
        <div className="space-y-4">

        {/* Profile Section - Always Read-only */}
        {!isEditMode && (
          <>
            {/* Smart Image Loader or Regular Images */}
            {showSmartLoader ? (
              <SmartImageLoader
                profileImageUrl={getImageUrl(farmerDetails.farmer_picture)}
                documentImageUrl={getImageUrl(farmerDetails.id_document_picture)}
                farmerName={`${farmerDetails.first_name} ${farmerDetails.last_name}`}
                onImagesClassified={handleImagesClassified}
              />
            ) : (
              <>
                {/* Profile Image and Name */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-kitovu-purple">
                    <img 
                      src={farmerImageSrc}
                      alt={`${farmerDetails.first_name} ${farmerDetails.last_name}`}
                      className="w-full h-full object-cover"
                      onError={handleFarmerImageError}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800">
                    {farmerDetails.first_name} {farmerDetails.last_name}
                  </h3>
                  <span className="text-sm text-gray-500 mt-1">
                    Farmer ID: {farmerDetails.farmer_id}
                  </span>
                </div>
              </>
            )}
          </>
        )}

          {/* Basic Information Section */}
          {isEditMode ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <StableFormInput 
                    field="first_name"
                    label="First Name"
                    required={true}
                    initialValue={editFormData.first_name || ''}
                    error={editErrors.first_name}
                    onValueChange={handleValueChange}
                  />
                  <StableFormInput 
                    field="last_name"
                    label="Last Name"
                    required={true}
                    initialValue={editFormData.last_name || ''}
                    error={editErrors.last_name}
                    onValueChange={handleValueChange}
                  />
                </div>
                <StableFormInput 
                  field="gender"
                  label="Gender"
                  type="select"
                  options={GENDER_OPTIONS}
                  required={true}
                  initialValue={editFormData.gender || ''}
                  error={editErrors.gender}
                  onValueChange={handleValueChange}
                />
                <StableFormInput 
                  field="date_of_birth"
                  label="Date of Birth"
                  type="date"
                  required={true}
                  initialValue={editFormData.date_of_birth || ''}
                  error={editErrors.date_of_birth}
                  onValueChange={handleValueChange}
                />
                <StableFormInput 
                  field="phone_number"
                  label="Phone Number"
                  required={true}
                  initialValue={editFormData.phone_number || ''}
                  error={editErrors.phone_number}
                  onValueChange={handleValueChange}
                />
                <StableFormInput 
                  field="alternate_phone_number"
                  label="Alternate Phone Number"
                  initialValue={editFormData.alternate_phone_number || ''}
                  error={editErrors.alternate_phone_number}
                  onValueChange={handleValueChange}
                />
                <StableFormInput 
                  field="street_address"
                  label="Street Address"
                  initialValue={editFormData.street_address || ''}
                  error={editErrors.street_address}
                  onValueChange={handleValueChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value="Abia"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <StableFormInput 
                  field="lga"
                  label="LGA"
                  type="select"
                  options={ABIA_LGA_OPTIONS}
                  required={true}
                  initialValue={editFormData.lga || ''}
                  error={editErrors.lga}
                  onValueChange={handleValueChange}
                />
                
                {/* Image uploads */}
                <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-700">Update Images (Optional)</h4>
                  <StableFormInput 
                    field="farmer_picture"
                    label="Farmer Picture"
                    type="file"
                    initialValue={''}
                    error={editErrors.farmer_picture}
                    onValueChange={handleValueChange}
                  />
                  <StableFormInput 
                    field="id_document_picture"
                    label="ID Document Picture"
                    type="file"
                    initialValue={''}
                    error={editErrors.id_document_picture}
                    onValueChange={handleValueChange}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Gender */}
              <div className="flex items-start">
                <User className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-gray-800">{farmerDetails.gender || 'Not specified'}</p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-gray-800">{formatDate(farmerDetails.date_of_birth)}</p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-gray-800">{farmerDetails.phone_number || 'Not specified'}</p>
                  {farmerDetails.alternate_phone_number && (
                    <p className="text-gray-600 text-sm">Alt: {farmerDetails.alternate_phone_number}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-gray-800">{getFullAddress()}</p>
                </div>
              </div>
            </>
          )}
          
          

          {/* ID Information Section */}
          {isEditMode ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">ID Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <StableFormInput 
                  field="id_type"
                  label="ID Type"
                  type="select"
                  options={ID_TYPE_OPTIONS}
                  required={true}
                  initialValue={editFormData.id_type || ''}
                  error={editErrors.id_type}
                  onValueChange={handleValueChange}
                />
                <StableFormInput 
                  field="id_number"
                  label="ID Number"
                  required={true}
                  initialValue={editFormData.id_number || ''}
                  error={editErrors.id_number}
                  onValueChange={handleValueChange}
                />
              </div>
            </div>
          ) : (
            <>
              {/* ID Information */}
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">ID Information</p>
                  <p className="text-gray-800">
                    {farmerDetails.id_type ? 
                      `${farmerDetails.id_type.replace(/_/g, ' ')} - ${farmerDetails.id_number}` : 
                      'Not specified'}
                  </p>
                </div>
              </div>

              {/* ID Document Picture - only show if not using smart loader */}
              {!showSmartLoader && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">ID Document</p>
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={idDocumentImageSrc}
                      alt="ID Document" 
                      className="w-full h-auto"
                      onError={handleIdDocumentImageError}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          

          {/* Created By */}
          <div className="flex items-start mt-4 pt-4 border-t">
            <User2 className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Created By</p>
              <p className="text-gray-800">{farmerDetails.created_by || 'Not specified'}</p>
              <p className="text-xs text-gray-500">
                {formatDate(farmerDetails.created_at)}
              </p>
            </div>
          </div>
          
          {/* Farms Section */}
          <div className="flex items-start mt-4 pt-4 border-t">
            <Tractor className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div className="w-full">
              <p className="text-sm font-medium text-gray-500 mb-2">Farm(s)</p>
              
              {isLoadingFarms ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-5 w-5 text-kitovu-purple animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Loading farms...</span>
                </div>
              ) : farmsError ? (
                <div className="text-sm text-red-500 py-2">
                  {farmsError}
                  <button
                    onClick={() => {
                      setFarms([]);
                      setFarmsError(null);
                      // Trigger refetch by clearing and setting farmer details
                      const currentFarmer = farmerDetails;
                      setFarmerDetails(null);
                      setTimeout(() => setFarmerDetails(currentFarmer), 100);
                    }}
                    className="block mt-2 text-xs text-kitovu-purple hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : farms.length === 0 ? (
                <p className="text-sm text-gray-500">No farms registered</p>
              ) : (
                <div className="space-y-2">
                  {farms.map(farm => (
                    <div 
                      key={farm.id}
                      onClick={() => handleFarmSelect(farm)}
                      className="inline-block bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 mr-2 mb-2 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-kitovu-purple">
                          Farm #{farm.farm_id}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        <span>{farm.crop_type || farm.livestock_type || 'Unknown'}</span>
                        <span className="mx-1">•</span>
                        <span>{farm.calculated_area} acres</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Education & Training Section */}
          {isEditMode ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Education & Training</h3>
              <div className="grid grid-cols-1 gap-4">
                <StableFormInput 
                  field="education"
                  label="Education Level"
                  type="select"
                  options={EDUCATION_OPTIONS}
                  initialValue={editFormData.education || ''}
                  error={editErrors.education}
                  onValueChange={handleValueChange}
                />
                <StableFormInput 
                  field="agricultural_training"
                  label="Agricultural Training"
                  type="boolean"
                  initialValue={editFormData.agricultural_training}
                  error={editErrors.agricultural_training}
                  onValueChange={handleValueChange}
                />
                {editFormData.agricultural_training && (
                  <>
                    <StableFormInput 
                      field="training_provider"
                      label="Training Provider"
                      initialValue={editFormData.training_provider || ''}
                      error={editErrors.training_provider}
                      onValueChange={handleValueChange}
                    />
                    <StableFormInput 
                      field="certificate_issued"
                      label="Certificate Issued"
                      type="boolean"
                      initialValue={editFormData.certificate_issued}
                      error={editErrors.certificate_issued}
                      onValueChange={handleValueChange}
                    />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start mt-4 pt-4 border-t">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="w-full">
                <p className="text-sm font-medium text-gray-500 mb-2">Education & Training</p>
                
                <div className="space-y-2">
                  {/* Education */}
                  {farmerDetails.education && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Education Level</p>
                      <p className="text-gray-800">{farmerDetails.education}</p>
                    </div>
                  )}
                  
                  {/* Agricultural Training */}
                  <div>
                    <p className="text-sm font-medium text-gray-600">Agricultural Training</p>
                    <p className="text-gray-800">
                      {farmerDetails.agricultural_training === true 
                        ? 'Yes' 
                        : farmerDetails.agricultural_training === false 
                          ? 'No' 
                          : 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Training Provider (if has training) */}
                  {farmerDetails.agricultural_training === true && farmerDetails.training_provider && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Training Provider</p>
                      <p className="text-gray-800">{farmerDetails.training_provider}</p>
                    </div>
                  )}
                  
                  {/* Certificate Issued */}
                  {farmerDetails.agricultural_training === true && farmerDetails.certificate_issued !== null && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificate Issued</p>
                      <p className="text-gray-800">
                        {farmerDetails.certificate_issued ? 'Yes' : 'No'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cooperative Affiliations Section */}
          {isEditMode ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Cooperative Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <StableFormInput 
                  field="member_of_cooperative"
                  label="Member of Cooperative"
                  type="boolean"
                  initialValue={editFormData.member_of_cooperative}
                  error={editErrors.member_of_cooperative}
                  onValueChange={handleValueChange}
                />
                {editFormData.member_of_cooperative && (
                  <>
                    <StableFormInput 
                      field="cooperative_name"
                      label="Cooperative Name"
                      initialValue={editFormData.cooperative_name || ''}
                      error={editErrors.cooperative_name}
                      onValueChange={handleValueChange}
                    />
                    <CooperativeActivitiesInput />
                    <StableFormInput 
                      field="marketing_channel"
                      label="Marketing Channel"
                      type="select"
                      options={MARKETING_CHANNEL_OPTIONS}
                      initialValue={editFormData.marketing_channel || ''}
                      error={editErrors.marketing_channel}
                      onValueChange={handleValueChange}
                    />
                    {editFormData.marketing_channel === 'offtaker' && (
                      <StableFormInput 
                        field="offtaker_name"
                        label="Offtaker Name"
                        initialValue={editFormData.offtaker_name || ''}
                        error={editErrors.offtaker_name}
                        onValueChange={handleValueChange}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start mt-4 pt-4 border-t">
              <Users className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
              <div className="w-full">
                <p className="text-sm font-medium text-gray-500 mb-2">Farmer Affiliations</p>
                
                <div className="space-y-2">
                  {/* Cooperative Membership */}
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cooperative Member</p>
                    <p className="text-gray-800">
                      {farmerDetails.member_of_cooperative === true 
                        ? 'Yes' 
                        : farmerDetails.member_of_cooperative === false 
                          ? 'No' 
                          : 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Show cooperative details only if member */}
                  {farmerDetails.member_of_cooperative === true && (
                    <>
                      {/* Cooperative Name */}
                      {farmerDetails.cooperative_name && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Cooperative Name</p>
                          <p className="text-gray-800">{farmerDetails.cooperative_name}</p>
                        </div>
                      )}
                      
                      {/* Cooperative Activities */}
                      {farmerDetails.cooperative_activities && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Activities</p>
                          <p className="text-gray-800">
                            {formatCooperativeActivities(farmerDetails.cooperative_activities)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Financing Section */}
          {isEditMode ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Financing Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <StableFormInput 
                  field="received_financing"
                  label="Received Financing"
                  type="boolean"
                  initialValue={editFormData.received_financing}
                  error={editErrors.received_financing}
                  onValueChange={handleValueChange}
                />
                {editFormData.received_financing && (
                  <>
                    <StableFormInput 
                      field="finance_provider"
                      label="Finance Provider"
                      initialValue={editFormData.finance_provider || ''}
                      error={editErrors.finance_provider}
                      onValueChange={handleValueChange}
                    />
                    <StableFormInput 
                      field="finance_amount"
                      label="Finance Amount"
                      type="number"
                      initialValue={editFormData.finance_amount || ''}
                      error={editErrors.finance_amount}
                      onValueChange={handleValueChange}
                    />
                    <StableFormInput 
                      field="interest_rate"
                      label="Interest Rate (%)"
                      type="number"
                      initialValue={editFormData.interest_rate || ''}
                      error={editErrors.interest_rate}
                      onValueChange={handleValueChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <StableFormInput 
                        field="financing_duration_years"
                        label="Duration (Years)"
                        type="number"
                        initialValue={editFormData.financing_duration_years || ''}
                        error={editErrors.financing_duration_years}
                        onValueChange={handleValueChange}
                      />
                      <StableFormInput 
                        field="financing_duration_months"
                        label="Duration (Months)"
                        type="number"
                        initialValue={editFormData.financing_duration_months || ''}
                        error={editErrors.financing_duration_months}
                        onValueChange={handleValueChange}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start mt-4 pt-4 border-t">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="w-full">
                <p className="text-sm font-medium text-gray-500 mb-2">Financing Information</p>
                
                <div className="space-y-2">
                  {/* Received Financing */}
                  <div>
                    <p className="text-sm font-medium text-gray-600">Received Financing</p>
                    <p className="text-gray-800">
                      {farmerDetails.received_financing === true 
                        ? 'Yes' 
                        : farmerDetails.received_financing === false 
                          ? 'No' 
                          : 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Show financing details only if received financing */}
                  {farmerDetails.received_financing === true && (
                    <>
                      {/* Finance Provider */}
                      {farmerDetails.finance_provider && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Finance Provider</p>
                          <p className="text-gray-800">{farmerDetails.finance_provider}</p>
                        </div>
                      )}
                      
                      {/* Finance Amount */}
                      {farmerDetails.finance_amount !== null && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Finance Amount</p>
                          <p className="text-gray-800">₦{farmerDetails.finance_amount.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {/* Interest Rate */}
                      {farmerDetails.interest_rate !== null && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Interest Rate</p>
                          <p className="text-gray-800">{farmerDetails.interest_rate}%</p>
                        </div>
                      )}
                      
                      {/* Financing Duration */}
                      {(farmerDetails.financing_duration_years !== null || farmerDetails.financing_duration_months !== null) && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Financing Duration</p>
                          <p className="text-gray-800">
                            {(farmerDetails.financing_duration_years > 0 ? `${farmerDetails.financing_duration_years} year${farmerDetails.financing_duration_years !== 1 ? 's' : ''}` : '')} 
                            {(farmerDetails.financing_duration_years > 0 && farmerDetails.financing_duration_months > 0) ? ' ' : ''}
                            {(farmerDetails.financing_duration_months > 0 ? `${farmerDetails.financing_duration_months} month${farmerDetails.financing_duration_months !== 1 ? 's' : ''}` : '')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Remarks Section */}
          {isEditMode ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Remarks</h3>
              <StableFormInput 
                field="remarks"
                label="Remarks"
                type="textarea"
                initialValue={editFormData.remarks || ''}
                error={editErrors.remarks}
                onValueChange={handleValueChange}
              />
            </div>
          ) : (
            <div className="flex items-start mt-4 pt-4 border-t">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4.707 4.707z" />
              </svg>
              <div className="w-full">
                <p className="text-sm font-medium text-gray-500 mb-2">Remarks</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-800 text-sm">
                    {farmerDetails.remarks || 'No remarks available'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Save/Cancel Buttons at Bottom for User Convenience - Only in Edit Mode */}
          {isEditMode && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kitovu-purple disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-kitovu-purple text-white border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kitovu-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Non-Editable Sections - Always Visible */}
          {!isEditMode && (
            <>
              {/* Created By */}
              <div className="flex items-start mt-4 pt-4 border-t">
                <User2 className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Created By</p>
                  <p className="text-gray-800">{farmerDetails.created_by || 'Not specified'}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(farmerDetails.created_at)}
                  </p>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default RightDrawer;