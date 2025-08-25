import React, { useState, useEffect } from 'react';
import { Popup } from 'react-leaflet';
import { Loader2, MapPin, Ruler, Calendar, User, Sprout, DollarSign } from 'lucide-react';
import farmService from '../../services/api/farms.service';

/**
 * Farm popup component that fetches fresh farm data via API
 * @param {Object} props - Component props
 * @param {Object} props.farm - Basic farm object with farm_id
 * @param {Function} props.onAdvisoryClick - Function to call when advisory button is clicked
 */
const FarmPopupWithAPI = ({ farm, onAdvisoryClick }) => {
  const [farmData, setFarmData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch farm details when component mounts
  useEffect(() => {
    const fetchFarmData = async () => {
      if (!farm?.farm_id && !farm?.id) {
        setError('No farm ID available');
        return;
      }

      const farmId = farm.farm_id || farm.id;
      setIsLoading(true);
      setError(null);

      try {
        console.log(`FarmPopupWithAPI: Fetching data for farm ${farmId}`);
        const freshData = await farmService.getFarmById(farmId);
        console.log('FarmPopupWithAPI: Data received:', freshData);
        setFarmData(freshData);
      } catch (err) {
        console.error('FarmPopupWithAPI: Error fetching farm data:', err);
        setError('Failed to load farm details');
        // Use basic farm data as fallback
        setFarmData(farm);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmData();
  }, [farm?.farm_id, farm?.id]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-kitovu-purple mr-2" />
          <span className="text-sm">Loading farm details...</span>
        </div>
      );
    }

    if (error && !farmData) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      );
    }

    const data = farmData || farm;
    
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-md" style={{ minWidth: "280px", maxWidth: "320px" }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3">
          <div className="flex items-center">
            <Sprout size={20} className="mr-2" />
            <div>
              <h3 className="font-semibold text-sm">Farm Details</h3>
              <p className="text-xs opacity-90">ID: {data.farm_id || data.id}</p>
            </div>
          </div>
        </div>

        {/* Farm Information */}
        <div className="p-3 space-y-2">
          {/* Area */}
          {data.calculated_area && (
            <div className="flex items-center text-sm">
              <Ruler size={14} className="text-gray-500 mr-2" />
              <span className="text-gray-600">Area:</span>
              <span className="ml-1 font-medium">{data.calculated_area} acres</span>
            </div>
          )}

          {/* Farm Type */}
          {data.farm_type && (
            <div className="flex items-center text-sm">
              <MapPin size={14} className="text-gray-500 mr-2" />
              <span className="text-gray-600">Type:</span>
              <span className="ml-1 font-medium capitalize">
                {data.farm_type.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Crop Type */}
          {data.crop_type && (
            <div className="flex items-center text-sm">
              <Sprout size={14} className="text-green-500 mr-2" />
              <span className="text-gray-600">Crop:</span>
              <span className="ml-1 font-medium capitalize">{data.crop_type}</span>
            </div>
          )}

          {/* Livestock Type */}
          {data.livestock_type && (
            <div className="flex items-center text-sm">
              <User size={14} className="text-amber-500 mr-2" />
              <span className="text-gray-600">Livestock:</span>
              <span className="ml-1 font-medium capitalize">{data.livestock_type}</span>
            </div>
          )}

          {/* Ownership Status */}
          {data.ownership_status && (
            <div className="flex items-center text-sm">
              <Calendar size={14} className="text-blue-500 mr-2" />
              <span className="text-gray-600">Ownership:</span>
              <span className="ml-1 font-medium capitalize">
                {data.ownership_status.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Yields */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {data.crop_yield && (
              <div className="bg-green-50 p-2 rounded">
                <div className="flex items-center">
                  <Sprout size={12} className="text-green-500 mr-1" />
                  <span className="text-xs text-gray-600">Crop Yield</span>
                </div>
                <p className="text-sm font-medium text-green-700">{data.crop_yield}</p>
              </div>
            )}

            {data.livestock_yield && (
              <div className="bg-amber-50 p-2 rounded">
                <div className="flex items-center">
                  <DollarSign size={12} className="text-amber-500 mr-1" />
                  <span className="text-xs text-gray-600">Livestock Yield</span>
                </div>
                <p className="text-sm font-medium text-amber-700">{data.livestock_yield}</p>
              </div>
            )}
          </div>

          {/* Distance */}
          {data.distance_to_farm_km && (
            <div className="flex items-center text-sm mt-2">
              <MapPin size={14} className="text-gray-500 mr-2" />
              <span className="text-gray-600">Distance:</span>
              <span className="ml-1 font-medium">{data.distance_to_farm_km} km</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {onAdvisoryClick && (
          <div className="border-t bg-gray-50 p-2">
            <button
              onClick={() => onAdvisoryClick(data)}
              className="w-full bg-kitovu-purple hover:bg-purple-600 text-white py-1 px-3 rounded text-xs font-medium transition-colors"
            >
              Provide Advisory
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Popup maxWidth={320} minWidth={280}>
      {renderContent()}
    </Popup>
  );
};

export default FarmPopupWithAPI;