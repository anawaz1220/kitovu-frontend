// src/components/dashboard/RightDrawer.jsx
import React, { useEffect, useState, useRef } from 'react';
import { X, User, Phone, MapPin, Calendar, CreditCard, User2, Tractor, Loader2, Users } from 'lucide-react';
import defaultUserImage from '../../assets/images/default-user.svg';
import { getFarmsByFarmerId } from '../../services/api/farmerQuery.service';

// Base URL for images - use your development server URL
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

// Format cooperative activities from snake_case to readable text
const formatCooperativeActivities = (activities) => {
  if (!activities) return 'None';
  
  // Handle both string and array formats
  if (typeof activities === 'string') {
    // If it's a single string value
    return activities
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } else if (Array.isArray(activities)) {
    // If it's an array of activities
    return activities.map(activity => 
      activity
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    ).join(', ');
  }
  
  return 'None';
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
};

const RightDrawer = ({ isOpen, onClose, selectedFarmer, onFarmSelect, onFarmsLoaded }) => {
  const [farms, setFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchedFarmerIdRef = useRef(null);
  const [farmerImageError, setFarmerImageError] = useState(false);
  const [idDocumentImageError, setIdDocumentImageError] = useState(false);
  
  // Fetch farms when a farmer is selected
  useEffect(() => {
    const fetchFarms = async () => {
      if (!isOpen || !selectedFarmer || !selectedFarmer.farmer_id) return;
      
      // Prevent duplicate fetches for the same farmer
      if (fetchedFarmerIdRef.current === selectedFarmer.farmer_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching farms for farmer ID:', selectedFarmer.farmer_id);
        const farmsData = await getFarmsByFarmerId(selectedFarmer.farmer_id);
        setFarms(farmsData);
        
        // Pass farms data up to parent component for map display
        if (onFarmsLoaded && typeof onFarmsLoaded === 'function') {
          onFarmsLoaded(farmsData);
        }
        
        // Remember this farmer ID so we don't fetch again
        fetchedFarmerIdRef.current = selectedFarmer.farmer_id;
      } catch (err) {
        console.error('Error fetching farms:', err);
        setError('Failed to load farms data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFarms();
    
    // Reset image error states when selected farmer changes
    setFarmerImageError(false);
    setIdDocumentImageError(false);
  }, [selectedFarmer?.farmer_id, isOpen, onFarmsLoaded]); // Only depend on farmer_id, not the entire farmer object

  // Don't render anything if drawer is not open or no farmer is selected
  if (!isOpen || !selectedFarmer) {
    return null;
  }
  
  // Format date of birth if available
  const formattedDob = formatDate(selectedFarmer.date_of_birth);

  // Helper function to display address
  const getFullAddress = () => {
    const parts = [
      selectedFarmer.street_address,
      selectedFarmer.city,
      selectedFarmer.lga,
      selectedFarmer.state,
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
  
  // IMPORTANT: We're swapping these variables based on your feedback
  // that the images are reversed in the API response
  
  // For the profile picture, use the ID document picture field
  const farmerImageSrc = !farmerImageError && selectedFarmer.id_document_picture 
    ? getImageUrl(selectedFarmer.id_document_picture) 
    : defaultUserImage;
    
  // For the ID document, use the farmer picture field
  const idDocumentImageSrc = !idDocumentImageError && selectedFarmer.farmer_picture 
    ? getImageUrl(selectedFarmer.farmer_picture) 
    : defaultUserImage;

  return (
    <div 
      className={`bg-white w-80 shadow-lg h-full border-l transition-all duration-300 overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-20`}
      style={{ position: 'absolute', top: 0, bottom: 0, right: 0 }}
    >
      {/* Drawer Header */}
      <div className="p-4 flex justify-between items-center border-b bg-kitovu-purple text-white">
        <h2 className="text-lg font-medium">Farmer Details</h2>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Farmer Details */}
      <div className="p-4">
        {/* Profile Image and Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-kitovu-purple">
            <img 
              src={farmerImageSrc}
              alt={`${selectedFarmer.first_name} ${selectedFarmer.last_name}`}
              className="w-full h-full object-cover"
              onError={handleFarmerImageError}
            />
          </div>
          <h3 className="text-xl font-bold text-center text-gray-800">
            {selectedFarmer.first_name} {selectedFarmer.last_name}
          </h3>
          <span className="text-sm text-gray-500 mt-1">
            Farmer ID: {selectedFarmer.farmer_id}
          </span>
        </div>

        {/* Details List */}
        <div className="space-y-4">
          {/* Gender */}
          <div className="flex items-start">
            <User className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-gray-800">{selectedFarmer.gender || 'Not specified'}</p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="text-gray-800">{formattedDob}</p>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="text-gray-800">{selectedFarmer.phone_number || 'Not specified'}</p>
              {selectedFarmer.alternate_phone_number && (
                <p className="text-gray-600 text-sm">Alt: {selectedFarmer.alternate_phone_number}</p>
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

          {/* ID Information */}
          <div className="flex items-start">
            <CreditCard className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">ID Information</p>
              <p className="text-gray-800">
                {selectedFarmer.id_type ? 
                  `${selectedFarmer.id_type.replace(/_/g, ' ')} - ${selectedFarmer.id_number}` : 
                  'Not specified'}
              </p>
            </div>
          </div>

          {/* ID Document Picture */}
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

          {/* Created By */}
          <div className="flex items-start mt-4 pt-4 border-t">
            <User2 className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Created By</p>
              <p className="text-gray-800">{selectedFarmer.created_by || 'Not specified'}</p>
              <p className="text-xs text-gray-500">
                {formatDate(selectedFarmer.created_at)}
              </p>
            </div>
          </div>
          
          {/* Farms Section */}
          <div className="flex items-start mt-4 pt-4 border-t">
            <Tractor className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div className="w-full">
              <p className="text-sm font-medium text-gray-500 mb-2">Farm(s)</p>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-5 w-5 text-kitovu-purple animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Loading farms...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-red-500 py-2">{error}</div>
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
          
          {/* Farmer Affiliations Section */}
          <div className="flex items-start mt-4 pt-4 border-t">
            <Users className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" />
            <div className="w-full">
              <p className="text-sm font-medium text-gray-500 mb-2">Farmer Affiliations</p>
              
              <div className="space-y-2">
                {/* Cooperative Membership */}
                <div>
                  <p className="text-sm font-medium text-gray-600">Cooperative Member</p>
                  <p className="text-gray-800">
                    {selectedFarmer.member_of_cooperative === true 
                      ? 'Yes' 
                      : selectedFarmer.member_of_cooperative === false 
                        ? 'No' 
                        : 'Not specified'}
                  </p>
                </div>
                
                {/* Show cooperative details only if member */}
                {selectedFarmer.member_of_cooperative === true && (
                  <>
                    {/* Cooperative Name */}
                    {selectedFarmer.cooperative_name && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cooperative Name</p>
                        <p className="text-gray-800">{selectedFarmer.cooperative_name}</p>
                      </div>
                    )}
                    
                    {/* Cooperative Activities */}
                    {selectedFarmer.cooperative_activities && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Activities</p>
                        <p className="text-gray-800">
                          {formatCooperativeActivities(selectedFarmer.cooperative_activities)}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightDrawer;