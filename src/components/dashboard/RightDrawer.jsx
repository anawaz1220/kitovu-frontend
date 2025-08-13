// src/components/dashboard/RightDrawer.jsx
import React, { useEffect, useState, useRef } from 'react';
import { X, User, Phone, MapPin, Calendar, CreditCard, User2, Tractor, Loader2, Users, RefreshCw } from 'lucide-react';
import defaultUserImage from '../../assets/images/default-user.svg';
import { getFarmerById, getFarmsByFarmerId } from '../../services/api/farmerQuery.service';

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
  const [farmerDetails, setFarmerDetails] = useState(null);
  const [farms, setFarms] = useState([]);
  const [isLoadingFarmer, setIsLoadingFarmer] = useState(false);
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [farmerError, setFarmerError] = useState(null);
  const [farmsError, setFarmsError] = useState(null);
  
  const fetchedFarmerIdRef = useRef(null);
  const [farmerImageError, setFarmerImageError] = useState(false);
  const [idDocumentImageError, setIdDocumentImageError] = useState(false);
  
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
  
  // For the profile picture, use the farmer picture field
  const farmerImageSrc = !farmerImageError && farmerDetails.farmer_picture 
    ? getImageUrl(farmerDetails.farmer_picture) 
    : defaultUserImage;
    
  // For the ID document, use the ID document picture field
  const idDocumentImageSrc = !idDocumentImageError && farmerDetails.id_document_picture 
    ? getImageUrl(farmerDetails.id_document_picture) 
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
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefreshFarmer}
            className="text-white hover:text-gray-200"
            title="Refresh farmer data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
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

        {/* Details List */}
        <div className="space-y-4">
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
              <p className="text-gray-800">{formattedDob}</p>
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

          {/* Education & Training Section */}
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
          
          {/* Financing Section */}
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
          
          {/* Marketing Section */}
          <div className="flex items-start mt-4 pt-4 border-t">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kitovu-purple mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <div className="w-full">
              <p className="text-sm font-medium text-gray-500 mb-2">Marketing Information</p>
              
              <div className="space-y-2">
                {/* Marketing Channel */}
                {farmerDetails.marketing_channel && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Marketing Channel</p>
                    <p className="text-gray-800">{farmerDetails.marketing_channel}</p>
                  </div>
                )}
                
                {/* Offtaker Name */}
                {farmerDetails.offtaker_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Offtaker</p>
                    <p className="text-gray-800">{farmerDetails.offtaker_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Remarks Section */}
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

        </div>
      </div>
    </div>
  );
};

export default RightDrawer;