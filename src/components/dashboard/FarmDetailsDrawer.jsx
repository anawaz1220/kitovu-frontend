// src/components/dashboard/FarmDetailsDrawer.jsx
import React from 'react';
import { X, MapPin, Ruler, Sprout, User, DollarSign, Calendar, Home, Layers, Navigation } from 'lucide-react';

/**
 * Farm details drawer component - displays comprehensive farm information
 * Maps API response fields properly
 */
const FarmDetailsDrawer = ({ isOpen, onClose, selectedFarm, onAdvisoryClick }) => {
  if (!isOpen || !selectedFarm) return null;

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
          <h2 className="text-lg font-medium">Farm Details</h2>
          <p className="text-sm opacity-90">
            Farm #{selectedFarm.farm_id || 'N/A'}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors p-2 rounded hover:bg-white hover:bg-opacity-20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Farm Content */}
      <div 
        className="overflow-y-auto p-4"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <MapPin className="h-5 w-5 text-green-600 mr-2" />
            Basic Information
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-3">
              {/* Farm ID (Numeric) - Show prominently */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Farm ID:</span>
                <span className="font-bold text-lg text-green-600">
                  #{selectedFarm.farm_id || 'N/A'}
                </span>
              </div>
              
              {/* Farmer ID */}
              {selectedFarm.farmer_id && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Farmer ID:</span>
                  <span className="font-medium text-gray-800 text-xs">
                    {selectedFarm.farmer_id}
                  </span>
                </div>
              )}
              
              {/* Farm Type */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Farm Type:</span>
                <span className="font-medium text-gray-800">
                  {formatText(selectedFarm.farm_type)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership Information */}
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
                  {formatText(selectedFarm.ownership_status)}
                </span>
              </div>
              
              {/* Lease Information - only show if leased */}
              {selectedFarm.ownership_status === 'leased' && (
                <>
                  {selectedFarm.lease_years && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lease Years:</span>
                      <span className="font-medium text-blue-800">
                        {selectedFarm.lease_years} years
                      </span>
                    </div>
                  )}
                  
                  {selectedFarm.lease_months && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lease Months:</span>
                      <span className="font-medium text-blue-800">
                        {selectedFarm.lease_months} months
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Farm Size & Area */}
        {selectedFarm.calculated_area && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Ruler className="h-5 w-5 text-purple-600 mr-2" />
              Farm Size
            </h3>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {formatNumber(selectedFarm.calculated_area)} hectares
                </div>
                <div className="text-sm text-purple-600 mt-1">Calculated Area</div>
              </div>
              
              {/* Additional Area field if different */}
              {selectedFarm.area && selectedFarm.area !== selectedFarm.calculated_area && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-purple-200">
                  <span className="text-sm text-gray-600">Recorded Area:</span>
                  <span className="font-medium text-purple-800">
                    {formatNumber(selectedFarm.area)} ha
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Navigation className="h-5 w-5 text-orange-600 mr-2" />
            Location Details
          </h3>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="space-y-2">
              {/* Farm Coordinates */}
              {selectedFarm.farm_latitude && selectedFarm.farm_longitude && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Latitude:</span>
                    <span className="font-medium text-orange-800">
                      {formatNumber(selectedFarm.farm_latitude, 6)}°
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Longitude:</span>
                    <span className="font-medium text-orange-800">
                      {formatNumber(selectedFarm.farm_longitude, 6)}°
                    </span>
                  </div>
                </>
              )}
              
              {/* If no coordinates, show message */}
              {(!selectedFarm.farm_latitude || !selectedFarm.farm_longitude) && (
                <div className="text-center text-orange-600">
                  <p className="text-sm">Coordinates not available</p>
                  <p className="text-xs">Location determined by farm geometry</p>
                </div>
              )}
              
              {/* Legacy location fields */}
              {selectedFarm.state && (
                <div className="flex justify-between items-center border-t border-orange-200 pt-2 mt-2">
                  <span className="text-sm text-gray-600">State:</span>
                  <span className="font-medium text-orange-800">{selectedFarm.state}</span>
                </div>
              )}
              
              {selectedFarm.lga && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">LGA:</span>
                  <span className="font-medium text-orange-800">{selectedFarm.lga}</span>
                </div>
              )}
              
              {selectedFarm.community && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Community:</span>
                  <span className="font-medium text-orange-800">{selectedFarm.community}</span>
                </div>
              )}
              
              {/* Distance Information */}
              {selectedFarm.distance_to_farm_km && (
                <div className="flex justify-between items-center border-t border-orange-200 pt-2 mt-2">
                  <span className="text-sm text-gray-600">Distance to Farm:</span>
                  <span className="font-medium text-orange-800">
                    {formatNumber(selectedFarm.distance_to_farm_km)} km
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Crop Information - Only show if crop_type exists */}
        {selectedFarm.crop_type && (
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
                    {formatText(selectedFarm.crop_type)}
                  </span>
                </div>
                
                {selectedFarm.crop_variety && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Variety:</span>
                    <span className="font-medium text-green-800">
                      {selectedFarm.crop_variety}
                    </span>
                  </div>
                )}
                
                {selectedFarm.planting_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Planting Date:</span>
                    <span className="font-medium text-green-800">
                      {formatDate(selectedFarm.planting_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Livestock Information - Only show if livestock_type exists */}
        {selectedFarm.livestock_type && (
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
                    {formatText(selectedFarm.livestock_type)}
                  </span>
                </div>
                
                {selectedFarm.number_of_animals && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Number of Animals:</span>
                    <span className="font-medium text-amber-800">
                      {selectedFarm.number_of_animals}
                    </span>
                  </div>
                )}
                
                {selectedFarm.livestock_count && selectedFarm.livestock_count !== selectedFarm.number_of_animals && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Livestock Count:</span>
                    <span className="font-medium text-amber-800">
                      {selectedFarm.livestock_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Yield Information - Show if either yield exists */}
        {(selectedFarm.crop_yield || selectedFarm.livestock_yield) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Layers className="h-5 w-5 text-emerald-600 mr-2" />
              Yield Information
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {selectedFarm.crop_yield && (
                <div className="bg-emerald-100 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-emerald-800">
                    {formatNumber(selectedFarm.crop_yield)} tons/ha
                  </div>
                  <div className="text-xs text-emerald-600">Crop Yield</div>
                </div>
              )}
              
              {selectedFarm.livestock_yield && (
                <div className="bg-blue-100 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-800">
                    {formatNumber(selectedFarm.livestock_yield)} units
                  </div>
                  <div className="text-xs text-blue-600">Livestock Yield</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Information - Show if available */}
        {(selectedFarm.investment_amount || selectedFarm.expected_income) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Financial Information
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {selectedFarm.investment_amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Investment:</span>
                    <span className="font-medium text-gray-800">
                      ₦{parseFloat(selectedFarm.investment_amount).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {selectedFarm.expected_income && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expected Income:</span>
                    <span className="font-medium text-gray-800">
                      ₦{parseFloat(selectedFarm.expected_income).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Record Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
            Record Information
          </h3>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="space-y-2">
              {selectedFarm.created_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="font-medium text-indigo-800">
                    {formatDate(selectedFarm.created_at)}
                  </span>
                </div>
              )}
              
              {selectedFarm.updated_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="font-medium text-indigo-800">
                    {formatDate(selectedFarm.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advisory Button */}
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