// src/components/dashboard/FarmDetailsDrawer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Ruler, Sprout, User, DollarSign, Calendar, Home, Layers, Navigation, Edit3, Save, XCircle, Loader2 } from 'lucide-react';
import { getFarmerById } from '../../services/api/farmerQuery.service';
import farmService from '../../services/api/farms.service';
import StableFormInput from './StableFormInput';
import {
  FARM_TYPE_OPTIONS,
  OWNERSHIP_STATUS_OPTIONS,
  LIVESTOCK_TYPES,
  CROP_TYPES
} from '../../constants/farmerFormConstants';

// Utility: format nicely (remove underscores, capitalize words)
const formatText = (text) => {
  if (!text) return null;
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Utility: build address in order
const buildFullAddress = (farmerDetails) => {
  const parts = [
    farmerDetails?.street_address,
    farmerDetails?.city,
    farmerDetails?.lga,
    farmerDetails?.state,
    "Nigeria" // always hardcoded
  ]
    .filter(Boolean) // remove null/undefined/empty
    .map(formatText);

  return parts.join(', ');
};

/**
 * Farm details drawer component - displays comprehensive farm information
 * Maps API response fields properly and fetches farmer details
 */
const FarmDetailsDrawer = ({ isOpen, onClose, selectedFarm, onAdvisoryClick, onFarmUpdate }) => {
  const [farmerDetails, setFarmerDetails] = useState(null);
  const [isLoadingFarmer, setIsLoadingFarmer] = useState(false);
  const [farmerError, setFarmerError] = useState(null);
  
  // Local farm data state to handle updates
  const [currentFarmData, setCurrentFarmData] = useState(null);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Update local farm data when selectedFarm changes
  useEffect(() => {
    if (selectedFarm) {
      setCurrentFarmData(selectedFarm);
    }
  }, [selectedFarm]);

  // Fetch farmer details when selectedFarm changes
  useEffect(() => {
    const fetchFarmerDetails = async () => {
      if (!selectedFarm?.farmer_id) {
        setFarmerDetails(null);
        return;
      }

      setIsLoadingFarmer(true);
      setFarmerError(null);

      try {
        console.log('Fetching farmer details for ID:', selectedFarm.farmer_id);
        const farmer = await getFarmerById(selectedFarm.farmer_id);
        console.log('Farmer details received:', farmer);
        setFarmerDetails(farmer);
      } catch (error) {
        console.error('Error fetching farmer details:', error);
        setFarmerError('Failed to load farmer details');
      } finally {
        setIsLoadingFarmer(false);
      }
    };

    if (isOpen && selectedFarm) {
      fetchFarmerDetails();
    }
  }, [isOpen, selectedFarm?.farmer_id]);

  // Initialize edit form data when farm details are loaded or edit mode is toggled
  useEffect(() => {
    if (currentFarmData && isEditMode) {
      setEditFormData({
        farm_type: currentFarmData.farm_type || '',
        ownership_status: currentFarmData.ownership_status || '',
        lease_years: currentFarmData.lease_years || '',
        lease_months: currentFarmData.lease_months || '',
        crop_type: currentFarmData.crop_type || '',
        livestock_type: currentFarmData.livestock_type || '',
        number_of_animals: currentFarmData.number_of_animals || '',
        distance_to_farm_km: currentFarmData.distance_to_farm_km || '',
        crop_yield: currentFarmData.crop_yield || '',
        livestock_yield: currentFarmData.livestock_yield || '',
        // Note: geom is excluded as per requirements (farm polygon not editable)
      });
      setEditErrors({});
    }
  }, [currentFarmData, isEditMode]);

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!editFormData.farm_type?.trim()) errors.farm_type = 'Farm type is required';
    if (!editFormData.ownership_status) errors.ownership_status = 'Ownership status is required';
    
    // Lease validation
    if (editFormData.ownership_status === 'leased') {
      if (editFormData.lease_months && 
          (isNaN(editFormData.lease_months) || 
           editFormData.lease_months > 12 || 
           editFormData.lease_months < 0)) {
        errors.lease_months = 'Lease months must be between 0 and 12';
      }
    }
    
    // Farm type specific validation
    if (editFormData.farm_type === 'crop_farming' && !editFormData.crop_type) {
      errors.crop_type = 'Crop type is required for crop farming';
    }
    
    if ((editFormData.farm_type === 'livestock_farming' || editFormData.farm_type === 'mixed_farming') 
        && !editFormData.livestock_type) {
      errors.livestock_type = 'Livestock type is required';
    }
    
    // Number validation
    const numericFields = ['lease_years', 'lease_months', 'number_of_animals', 'distance_to_farm_km', 'crop_yield', 'livestock_yield'];
    numericFields.forEach(field => {
      if (editFormData[field] && isNaN(editFormData[field])) {
        errors[field] = `${field.replace(/_/g, ' ')} must be a valid number`;
      }
    });
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes - stable handler for StableFormInput
  const handleValueChange = useCallback((field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
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
  };

  // Save farm updates
  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare farm data (keep existing geom)
      const farmUpdateData = {
        ...editFormData,
        geom: currentFarmData.geom // Keep existing polygon
      };

      // Update farm details
      const updatedFarm = await farmService.updateFarm(currentFarmData.id, farmUpdateData);
      
      console.log('Farm updated successfully', updatedFarm);
      
      // Exit edit mode first
      setIsEditMode(false);
      setEditFormData({});
      setEditErrors({});
      
      // Fetch the updated farm data to show immediate changes
      try {
        const refreshedFarm = await farmService.getFarmById(currentFarmData.id);
        
        // Update local state immediately
        setCurrentFarmData(refreshedFarm);
        
        // Notify parent component if callback is provided
        if (onFarmUpdate && typeof onFarmUpdate === 'function') {
          onFarmUpdate(refreshedFarm);
        }
        
        console.log('Farm data refreshed successfully');
        
      } catch (refreshError) {
        console.warn('Could not refresh farm data:', refreshError);
        // Fallback: update local state with the form data changes
        setCurrentFarmData(prev => ({
          ...prev,
          ...editFormData
        }));
      }
      
      // Don't close the drawer - let user see the updated data
      // They can manually close if they want
      
    } catch (error) {
      console.error('Error updating farm:', error);
      setEditErrors({ general: 'Failed to update farm. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };


  if (!isOpen || !selectedFarm) return null;
  
  // Use currentFarmData for display, fallback to selectedFarm if not yet set
  const displayFarm = currentFarmData || selectedFarm;

  const handleProvideAdvisoryClick = (e) => {
    e.stopPropagation();
    console.log('Provide Advisory clicked for farm:', selectedFarm?.id);

    if (onAdvisoryClick && typeof onAdvisoryClick === "function") {
      onAdvisoryClick(selectedFarm);
    } else {
      console.warn("onAdvisoryClick not provided");
    }
  };
  

  // Helper function to format numbers
  const formatNumber = (value, decimals = 2) => {
    if (!value && value !== 0) return 'N/A';
    const num = parseFloat(value);
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  // Helper function to capitalize and format text
  const formatText = (text) => {
    if (!text) return 'N/A';
    return text.toString().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Helper function to format farmer name
  const getFarmerName = () => {
    if (isLoadingFarmer) return 'Loading...';
    if (farmerError || !farmerDetails) return 'Unable to load farmer name';
    
    const firstName = farmerDetails.first_name || '';
    const lastName = farmerDetails.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Name not available';
  };

  // Helper function to format full address
  const getFullAddress = () => {
    if (!farmerDetails) return [];
    
    const addressParts = [];
    
    // Add city if available
    if (farmerDetails.city) {
      addressParts.push(farmerDetails.city);
    }
    
    // Add LGA if available
    if (farmerDetails.lga) {
      addressParts.push(farmerDetails.lga);
    }
    
    // Add state if available
    if (farmerDetails.state) {
      addressParts.push(farmerDetails.state);
    }
    
    // Always add Nigeria at the end
    addressParts.push('Nigeria');
    
    return addressParts;
  };

  // Debug: Log the selectedFarm data
  console.log('FarmDetailsDrawer - selectedFarm data:', selectedFarm);
  console.log('FarmDetailsDrawer - data keys:', Object.keys(selectedFarm || {}));
  
  // Show loading state
  if (selectedFarm?.isLoading) {
    return (
      <div 
        className="bg-white shadow-lg h-full border-l transition-all duration-300 flex items-center justify-center"
        style={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          right: 0, 
          width: '400px',
          zIndex: 1001,
          pointerEvents: 'auto'
        }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm details...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white shadow-lg h-full border-l transition-all duration-300"
      style={{ 
        position: 'absolute', 
        top: 0, 
        bottom: 0, 
        right: 0, 
        width: '400px',
        zIndex: 1001,
        pointerEvents: 'auto'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drawer Header */}
      <div 
        className="p-4 flex justify-between items-center border-b bg-gradient-to-r from-green-500 to-emerald-600 text-white sticky top-0"
        style={{ zIndex: 1002 }}
      >
        <div>
          <h2 className="text-lg font-medium">
            {isEditMode ? 'Edit Farm Details' : 'Farm Details'}
          </h2>
          <p className="text-sm opacity-90">
            Farm #{displayFarm.farm_id || 'N/A'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditMode ? (
            <button
              onClick={handleEditMode}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded hover:bg-white hover:bg-opacity-20"
              title="Edit farm details"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                disabled={isUpdating}
                className="text-white hover:text-gray-200 disabled:opacity-50 transition-colors p-2 rounded hover:bg-white hover:bg-opacity-20"
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
                className="text-white hover:text-gray-200 disabled:opacity-50 transition-colors p-2 rounded hover:bg-white hover:bg-opacity-20"
                title="Cancel editing"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 rounded hover:bg-white hover:bg-opacity-20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Farm Content */}
      <div 
        className="overflow-y-auto p-4"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        
        {/* Show general error if any */}
        {editErrors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{editErrors.general}</p>
          </div>
        )}
        {/* Edit Mode Form */}
        {isEditMode ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-green-600 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <StableFormInput 
                  field="farm_type"
                  label="Farm Type"
                  type="select"
                  options={FARM_TYPE_OPTIONS}
                  required={true}
                  initialValue={editFormData.farm_type || ''}
                  error={editErrors.farm_type}
                  onValueChange={handleValueChange}
                />
                
                {/* Crop Type - only show for crop or mixed farming */}
                {(editFormData.farm_type === 'crop_farming' || editFormData.farm_type === 'mixed_farming') && (
                  <StableFormInput 
                    field="crop_type"
                    label="Crop Type"
                    type="select"
                    options={CROP_TYPES}
                    required={editFormData.farm_type === 'crop_farming'}
                    initialValue={editFormData.crop_type || ''}
                    error={editErrors.crop_type}
                    onValueChange={handleValueChange}
                  />
                )}
                
                {/* Livestock Type - only show for livestock or mixed farming */}
                {(editFormData.farm_type === 'livestock_farming' || editFormData.farm_type === 'mixed_farming') && (
                  <>
                    <StableFormInput 
                      field="livestock_type"
                      label="Livestock Type"
                      type="select"
                      options={LIVESTOCK_TYPES}
                      required={editFormData.farm_type === 'livestock_farming'}
                      initialValue={editFormData.livestock_type || ''}
                      error={editErrors.livestock_type}
                      onValueChange={handleValueChange}
                    />
                    <StableFormInput 
                      field="number_of_animals"
                      label="Number of Animals"
                      type="number"
                      initialValue={editFormData.number_of_animals || ''}
                      error={editErrors.number_of_animals}
                      onValueChange={handleValueChange}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Ownership Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Home className="h-5 w-5 text-blue-600 mr-2" />
                Ownership Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <StableFormInput 
                  field="ownership_status"
                  label="Ownership Status"
                  type="select"
                  options={OWNERSHIP_STATUS_OPTIONS}
                  required={true}
                  initialValue={editFormData.ownership_status || ''}
                  error={editErrors.ownership_status}
                  onValueChange={handleValueChange}
                />
                
                {/* Lease Information - only show if leased */}
                {editFormData.ownership_status === 'leased' && (
                  <div className="grid grid-cols-2 gap-4">
                    <StableFormInput 
                      field="lease_years"
                      label="Lease Years"
                      type="number"
                      initialValue={editFormData.lease_years || ''}
                      error={editErrors.lease_years}
                      onValueChange={handleValueChange}
                    />
                    <StableFormInput 
                      field="lease_months"
                      label="Lease Months"
                      type="number"
                      initialValue={editFormData.lease_months || ''}
                      error={editErrors.lease_months}
                      onValueChange={handleValueChange}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Yield Information */}
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Layers className="h-5 w-5 text-emerald-600 mr-2" />
                Yield & Location
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <StableFormInput 
                  field="distance_to_farm_km"
                  label="Distance to Farm (km)"
                  type="number"
                  initialValue={editFormData.distance_to_farm_km || ''}
                  error={editErrors.distance_to_farm_km}
                  onValueChange={handleValueChange}
                />
                
                {/* Show crop yield input for crop or mixed farming */}
                {(editFormData.farm_type === 'crop_farming' || editFormData.farm_type === 'mixed_farming') && (
                  <StableFormInput 
                    field="crop_yield"
                    label="Yield (bags)"
                    type="number"
                    initialValue={editFormData.crop_yield || ''}
                    error={editErrors.crop_yield}
                    onValueChange={handleValueChange}
                  />
                )}
                
                {/* Show livestock yield input for livestock or mixed farming */}
                {(editFormData.farm_type === 'livestock_farming' || editFormData.farm_type === 'mixed_farming') && (
                  <StableFormInput 
                    field="livestock_yield"
                    label="Livestock Yield (units)"
                    type="number"
                    initialValue={editFormData.livestock_yield || ''}
                    error={editErrors.livestock_yield}
                    onValueChange={handleValueChange}
                  />
                )}
              </div>
            </div>


            {/* Save/Cancel Buttons at Bottom for User Convenience */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-green-600 text-white border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
          </div>
        ) : (
          <div>
            {/* View Mode - Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <MapPin className="h-5 w-5 text-green-600 mr-2" />
                Basic Information
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-3">
                  {/* UPDATED: Farmer Name instead of Farmer ID */}
                  {displayFarm.farmer_id && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Farmer:</span>
                      <span className={`font-medium ${isLoadingFarmer ? 'text-gray-500' : 'text-gray-800'}`}>
                        {getFarmerName()}
                      </span>
                      {isLoadingFarmer && (
                        <div className="ml-2 w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  )}
                  
                  {/* Farm Type */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Farm Type:</span>
                    <span className="font-medium text-gray-800">
                      {formatText(displayFarm.farm_type)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode - Ownership Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Home className="h-5 w-5 text-blue-600 mr-2" />
                Ownership Details
              </h3>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ownership Status:</span>
                    <span className="font-medium text-blue-800">
                      {formatText(displayFarm.ownership_status)}
                    </span>
                  </div>
                  
                  {/* Lease Information - only show if leased */}
                  {displayFarm.ownership_status === 'leased' && (
                    <>
                      {displayFarm.lease_years && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Lease Years:</span>
                          <span className="font-medium text-blue-800">
                            {displayFarm.lease_years} years
                          </span>
                        </div>
                      )}
                      
                      {displayFarm.lease_months && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Lease Months:</span>
                          <span className="font-medium text-blue-800">
                            {displayFarm.lease_months} months
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Only - Additional Information */}
        {!isEditMode && (
          <div>
            {/* Farm Size & Area */}
            {displayFarm.calculated_area && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Ruler className="h-5 w-5 text-purple-600 mr-2" />
              Farm Size
            </h3>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {formatNumber(displayFarm.calculated_area)} hectares
                </div>
                <div className="text-sm text-purple-600 mt-1">Calculated Area</div>
              </div>
              
              {/* Additional Area field if different */}
              {displayFarm.area && displayFarm.area !== displayFarm.calculated_area && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-purple-200">
                  <span className="text-sm text-gray-600">Recorded Area:</span>
                  <span className="font-medium text-purple-800">
                    {formatNumber(displayFarm.area)} ha
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UPDATED: Location Information with Address */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Navigation className="h-5 w-5 text-orange-600 mr-2" />
            Location Details
          </h3>
          
          <div className="bg-orange-50 rounded-lg p-4">
        <div className="space-y-2">
          {/* Address */}
          {farmerDetails && (
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Address:</div>
              <div className="font-medium text-orange-800 text-sm">
                📍 {buildFullAddress(farmerDetails)}
              </div>
            </div>
          )}

          {/* Distance Information */}
          {displayFarm.distance_to_farm_km && (
            <div className="flex justify-between items-center border-t border-orange-200 pt-2">
              <span className="text-sm text-gray-600">Distance to Farm:</span>
              <span className="font-medium text-orange-800">
                {formatNumber(displayFarm.distance_to_farm_km)} km
              </span>
            </div>
          )}
        </div>
      </div>

        </div>

        {/* Crop Information - Only show if crop_type exists */}
        {displayFarm.crop_type && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Sprout className="h-5 w-5 text-green-600 mr-2" />
              Crop Information
            </h3>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Crop Type:</span>
                  <span className="font-medium text-green-800">
                    {formatText(displayFarm.crop_type)}
                  </span>
                </div>
                
                {displayFarm.crop_variety && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Variety:</span>
                    <span className="font-medium text-green-800">
                      {displayFarm.crop_variety}
                    </span>
                  </div>
                )}
                
                {displayFarm.planting_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Planting Date:</span>
                    <span className="font-medium text-green-800">
                      {formatDate(displayFarm.planting_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Livestock Information - Only show if livestock_type exists */}
        {displayFarm.livestock_type && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <User className="h-5 w-5 text-amber-600 mr-2" />
              Livestock Information
            </h3>
            
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Livestock Type:</span>
                  <span className="font-medium text-amber-800">
                    {formatText(displayFarm.livestock_type)}
                  </span>
                </div>
                
                {displayFarm.number_of_animals && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Number of Animals:</span>
                    <span className="font-medium text-amber-800">
                      {displayFarm.number_of_animals}
                    </span>
                  </div>
                )}
                
                {displayFarm.livestock_count && displayFarm.livestock_count !== displayFarm.number_of_animals && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Livestock Count:</span>
                    <span className="font-medium text-amber-800">
                      {displayFarm.livestock_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Yield Information - Show if either yield exists */}
        {(displayFarm.crop_yield || displayFarm.livestock_yield) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Layers className="h-5 w-5 text-emerald-600 mr-2" />
              Yield Information
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {displayFarm.crop_yield && (
                <div className="bg-emerald-100 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-emerald-800">
                    {Math.round(displayFarm.crop_yield)} bags
                  </div>
                  <div className="text-xs text-emerald-600">Yield</div>
                </div>
              )}
              
              {displayFarm.livestock_yield && (
                <div className="bg-blue-100 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-800">
                    {formatNumber(displayFarm.livestock_yield)} units
                  </div>
                  <div className="text-xs text-blue-600">Livestock Yield</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Information - Show if available */}
        {(displayFarm.investment_amount || displayFarm.expected_income) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Financial Information
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {displayFarm.investment_amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Investment:</span>
                    <span className="font-medium text-gray-800">
                      ₦{parseFloat(displayFarm.investment_amount).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {displayFarm.expected_income && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expected Income:</span>
                    <span className="font-medium text-gray-800">
                      ₦{parseFloat(displayFarm.expected_income).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          </div>
        )}

        {/* Advisory Button - Always Visible */}
        {onAdvisoryClick && (
          <div className="mt-6">
            <button
              onClick={handleProvideAdvisoryClick}
              className="w-full bg-kitovu-purple hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <Sprout className="h-5 w-5 mr-2" />
              Provide Advisory for this Farm
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default FarmDetailsDrawer;