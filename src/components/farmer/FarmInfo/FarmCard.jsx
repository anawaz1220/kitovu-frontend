// src/components/farmer/FarmInfo/FarmCard.jsx
import React from 'react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';
import { CROP_TYPES, LIVESTOCK_TYPES } from './constants';

const FarmCard = ({ farm, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: farm.color || '#7A2F99' }}
          >
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {farm.farmType === 'both' 
                ? 'Mixed Farm'
                : `${farm.farmType === 'crop' ? 'Crop' : 'Livestock'} Farm`}
            </h3>
            <p className="text-sm text-gray-500">
              {farm.area} hectares • {farm.ownershipType}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(farm)}
            className="p-1 text-gray-400 hover:text-kitovu-purple"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(farm)}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {(farm.farmType === 'crop' || farm.farmType === 'both') && (
          <div>
            <span className="text-gray-500">Crop:</span>{' '}
            <span className="font-medium">
              {CROP_TYPES.find(c => c.id === farm.cropType)?.label || 'N/A'}
            </span>
          </div>
        )}
        
        {(farm.farmType === 'livestock' || farm.farmType === 'both') && (
          <div>
            <span className="text-gray-500">Livestock:</span>{' '}
            <span className="font-medium">
              {LIVESTOCK_TYPES.find(l => l.id === farm.livestockType)?.label || 'N/A'}
              {farm.livestockCount ? ` (${farm.livestockCount})` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmCard;