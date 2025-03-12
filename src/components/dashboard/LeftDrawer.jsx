// src/components/dashboard/LeftDrawer.jsx
import React from 'react';
import { X, Layers, Map } from 'lucide-react';
import { Button } from '../ui/button';

const LeftDrawer = ({ 
  isOpen, 
  onClose,
  selectedBasemap,
  onBasemapChange,
  activeLayers,
  onLayerToggle
}) => {
  const basemaps = [
    { id: 'streets', name: 'Streets' },
    { id: 'satellite', name: 'Satellite' },
    { id: 'dark', name: 'Dark Mode' }
  ];

  const layers = [
    { id: 'farmers', name: 'Farmers Distribution', description: 'Shows the distribution of farmers by region' },
    { id: 'cropDistribution', name: 'Crop Distribution', description: 'Displays crop types and areas by region' }
  ];

  return (
    <div 
        className={`bg-white w-64 shadow-lg h-full border-r transition-all duration-300 overflow-y-auto
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 1000 }}
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

      {/* Layers Section */}
      <div className="p-4 border-b">
        <div className="flex items-center mb-3">
          <Layers className="h-5 w-5 text-kitovu-purple mr-2" />
          <h3 className="text-md font-medium">Layers</h3>
        </div>
        
        <div className="space-y-3">
          {layers.map(layer => (
            <div key={layer.id} className="flex items-start">
              <input
                type="checkbox"
                id={`layer-${layer.id}`}
                checked={activeLayers[layer.id] || false}
                onChange={() => onLayerToggle(layer.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-kitovu-purple focus:ring-kitovu-purple"
              />
              <label htmlFor={`layer-${layer.id}`} className="ml-2 block text-sm">
                <span className="font-medium">{layer.name}</span>
                <p className="text-xs text-gray-500">{layer.description}</p>
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
          {basemaps.map(basemap => (
            <div key={basemap.id} className="flex items-center">
              <input
                type="radio"
                id={`basemap-${basemap.id}`}
                name="basemap"
                checked={selectedBasemap === basemap.id}
                onChange={() => onBasemapChange(basemap.id)}
                className="h-4 w-4 border-gray-300 text-kitovu-purple focus:ring-kitovu-purple"
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