import React from 'react';
import { X, MapPin, Ruler, Sprout, User, DollarSign, Calendar } from 'lucide-react';

/**
 * Farm details drawer component - similar to RightDrawer but for farm details
 */
const FarmDetailsDrawer = ({ isOpen, onClose, selectedFarm, onAdvisoryClick={handleAdvisoryClick} }) => {
  if (!isOpen || !selectedFarm) return null;

const handleProvideAdvisoryClick = (e) => {
  e.stopPropagation(); // prevent popup close
  console.log('Provide Advisory clicked for farm:', selectedFarm?.id);

  if (onAdvisoryClick && typeof onAdvisoryClick === "function") {
    onAdvisoryClick(selectedFarm);
  } else {
    console.warn("onAdvisoryClick not provided");
  }
};

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
            ID: {selectedFarm.farm_id || selectedFarm.id}
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
        className="overflow-y-auto"
        style={{ 
          height: 'calc(100% - 80px)',
          pointerEvents: 'auto'
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          {/* Farm Overview */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center mb-3">
              <Sprout className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Farm Overview</h3>
            </div>
            
            <div className="space-y-3">
              {/* Area */}
              {selectedFarm.calculated_area && (
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Area:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {selectedFarm.calculated_area} acres
                  </span>
                </div>
              )}

              {/* Farm Type */}
              {selectedFarm.farm_type && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Farm Type:</span>
                  <span className="ml-2 font-medium text-gray-800 capitalize">
                    {selectedFarm.farm_type.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              {/* Ownership */}
              {selectedFarm.ownership_status && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Ownership:</span>
                  <span className="ml-2 font-medium text-gray-800 capitalize">
                    {selectedFarm.ownership_status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Crop Information */}
          {selectedFarm.crop_type && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center mb-3">
                <Sprout className="h-6 w-6 text-amber-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Crop Information</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">Crop Type:</span>
                  <span className="ml-2 font-medium text-gray-800 capitalize">
                    {selectedFarm.crop_type}
                  </span>
                </div>
                
                {selectedFarm.crop_yield && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Crop Yield:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {selectedFarm.crop_yield}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Livestock Information */}
          {selectedFarm.livestock_type && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center mb-3">
                <User className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Livestock Information</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">Livestock Type:</span>
                  <span className="ml-2 font-medium text-gray-800 capitalize">
                    {selectedFarm.livestock_type}
                  </span>
                </div>
                
                {selectedFarm.number_of_animals && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Number of Animals:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {selectedFarm.number_of_animals}
                    </span>
                  </div>
                )}
                
                {selectedFarm.livestock_yield && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Livestock Yield:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {selectedFarm.livestock_yield}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Financial Information */}
          {(selectedFarm.crop_yield || selectedFarm.livestock_yield) && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center mb-3">
                <DollarSign className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Yield Summary</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedFarm.crop_yield && (
                  <div className="bg-green-100 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-800">
                      {selectedFarm.crop_yield}
                    </div>
                    <div className="text-xs text-green-600">Crop Yield</div>
                  </div>
                )}
                
                {selectedFarm.livestock_yield && (
                  <div className="bg-blue-100 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-800">
                      {selectedFarm.livestock_yield}
                    </div>
                    <div className="text-xs text-blue-600">Livestock Yield</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distance Information */}
          {selectedFarm.distance_to_farm_km && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Distance to Farm:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {selectedFarm.distance_to_farm_km} km
                </span>
              </div>
            </div>
          )}

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
    </div>
  );
};

export default FarmDetailsDrawer;