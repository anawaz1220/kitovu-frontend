// src/components/farmer/FarmInfo/components/FarmList/index.jsx
import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { calculateArea } from '../../utils/geometryUtils';
import { Button } from '../../../../ui/button';
import useFarmStore from '../../../../../stores/useFarmStore';

const FarmList = () => {
  const { 
    farms, 
    deleteFarm, 
    setEditingFarm,
    hasOverlap
  } = useFarmStore();

  if (!farms?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No farms added yet. Draw a farm on the map to begin.
      </div>
    );
  }

  const getAreaDisplay = (farm) => {
    if (!farm.geometry?.coordinates) {
      return farm.area ? `${Number(farm.area).toFixed(1)} Ha` : '0.0 Ha';
    }
    
    const calculated = calculateArea(farm.geometry.coordinates);
    return `${Number(calculated).toFixed(1)} Ha`;
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Added Farms</h3>
      <div className="space-y-4">
        {farms.map((farm, index) => (
          <div
            key={farm.id || index}
            className={`p-4 bg-gray-50 rounded-lg border ${
              farm.hasOverlap 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Farm {index + 1}</span>
                  {farm.hasOverlap && (
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                      Overlapping
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 block mt-1">
                  {getAreaDisplay(farm)}
                </span>
              </div>
              <div className="flex gap-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setEditingFarm(index)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => deleteFarm(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Type: {farm.farm_type}</p>
              {farm.crop_type && <p>Crop: {farm.crop_type}</p>}
              {farm.livestock_type && <p>Livestock: {farm.livestock_type}</p>}
              {farm.livestock_type && farm.number_of_animals && (
                <p>Animals: {farm.number_of_animals}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmList;