// src/components/dashboard/LeftDrawer.jsx
import React from 'react';
import { X, Layers, Map, BarChart } from 'lucide-react';
import { Button } from '../ui/button';
import { BASEMAP_OPTIONS, LAYER_OPTIONS } from '../../config/mapSettings';

const LeftDrawer = ({ 
  isOpen, 
  onClose,
  selectedBasemap,
  onBasemapChange,
  activeLayers,
  onLayerToggle,
  onDistributionLayerSelect
}) => {
  // Filter layers by category
  const adminBoundaries = LAYER_OPTIONS.filter(layer => layer.category === 'admin');
  const distributionLayers = LAYER_OPTIONS.filter(layer => layer.category === 'distribution');

  // Handle selection of a distribution layer (radio button)
  const handleDistributionLayerChange = (layerId) => {
    // If the layer is already active, deselect it
    if (activeLayers[layerId]) {
      // Just toggle this layer off without selecting any other
      onLayerToggle(layerId);
    } else {
      // Call parent handler that will toggle off all other distribution layers
      onDistributionLayerSelect(layerId);
    }
  };

  return (
    <div 
      className={`bg-white w-64 shadow-lg h-full border-r transition-all duration-300 overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-20`}
      style={{ position: 'absolute', top: 0, bottom: 0, left: 0 }}
    >
      {/* Drawer Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-medium text-kitovu-purple">Map Controls</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 sm:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Admin Boundaries Section */}
      <div className="p-4 border-b">
        <div className="flex items-center mb-3">
          <Layers className="h-5 w-5 text-kitovu-purple mr-2" />
          <h3 className="text-md font-medium">Admin Boundaries</h3>
        </div>
        
        <div className="space-y-3">
          {adminBoundaries.map(layer => (
            <div key={layer.id} className="flex items-start">
              <input
                type="checkbox"
                id={`layer-${layer.id}`}
                checked={activeLayers[layer.id] || false}
                onChange={() => onLayerToggle(layer.id)}
                className="mt-1 h-4 w-4 rounded border-gray-400 text-kitovu-purple focus:ring-kitovu-purple"
              />
              <label htmlFor={`layer-${layer.id}`} className="ml-2 block text-sm">
                <span className="font-medium">{layer.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Layers Section */}
      <div className="p-4 border-b">
        <div className="flex items-center mb-3">
          <BarChart className="h-5 w-5 text-kitovu-purple mr-2" />
          <h3 className="text-md font-medium">Distribution Layers</h3>
        </div>
        
        <div className="space-y-3">
          {distributionLayers.map(layer => (
            <div key={layer.id} className="flex items-start">
              <input
                type="radio"
                id={`layer-${layer.id}`}
                name="distributionLayer" // All share same name to make them a radio group
                checked={activeLayers[layer.id] || false}
                onChange={() => handleDistributionLayerChange(layer.id)}
                className="mt-1 h-4 w-4 rounded-full border-gray-400 text-kitovu-purple focus:ring-kitovu-purple"
              />
              <label htmlFor={`layer-${layer.id}`} className="ml-2 block text-sm">
                <span className="font-medium">{layer.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Basemaps Section */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <Map className="h-5 w-5 text-kitovu-purple mr-2" />
          <h3 className="text-md font-medium">Basemaps</h3>
        </div>
        
        <div className="space-y-2">
          {BASEMAP_OPTIONS.map(basemap => (
            <div key={basemap.id} className="flex items-center">
              <input
                type="radio"
                id={`basemap-${basemap.id}`}
                name="basemap"
                checked={selectedBasemap === basemap.id}
                onChange={() => onBasemapChange(basemap.id)}
                className="h-4 w-4 border-gray-400 text-kitovu-purple focus:ring-kitovu-purple"
              />
              <label htmlFor={`basemap-${basemap.id}`} className="ml-2 block text-sm font-medium">
                {basemap.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftDrawer;