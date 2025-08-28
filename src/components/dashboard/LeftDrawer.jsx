// src/components/dashboard/LeftDrawer.jsx
import React from 'react';
import { X, Layers, Map, BarChart, Search, LandPlot } from 'lucide-react';
import { Button } from '../ui/button';
import { BASEMAP_OPTIONS, LAYER_OPTIONS } from '../../config/mapSettings';
import FarmerSearch from './FarmerSearch';

// Farm type options for dropdown
const FARM_TYPES = [
  { id: 'crop_farming', name: 'Crop Farming' },
  { id: 'livestock_farming', name: 'Livestock Farming' },
  { id: 'mixed_farming', name: 'Mixed Farming' }
];

const LeftDrawer = ({ 
  isOpen, 
  onClose,
  selectedBasemap,
  onBasemapChange,
  activeLayers,
  onLayerToggle,
  onDistributionLayerSelect,
  onSelectFarmer,
  // Farm layer props
  onFarmLayerSelect,
  activeFarmLayer,
  farmTypeFilter,
  onFarmTypeFilterChange = () => {},
  cropTypeFilter,
  onCropTypeFilterChange = () => {},
  livestockTypeFilter,
  onLivestockTypeFilterChange = () => {},
  communityFilter,
  onCommunityFilterChange = () => {},
  cropOptions = [],
  livestockOptions = [],
  communityOptions = [],
  // New filter props
  filterState = {
    state: 'abia',
    lga: '',
    city: '',
    farm_type: '',
    crop_type: ''
  },
  onFilterChange = () => {},
  lgaOptions = [],
  cityOptions = [],
  filterCropOptions = [],
  onApplyFilter = () => {},
  onClearFilter = () => {},
  isLoadingLgas = false,
  isLoadingCities = false,
  isLoadingCrops = false
}) => {
  // Filter layers by category
  const adminBoundaries = LAYER_OPTIONS.filter(layer => layer.category === 'admin');
  const distributionLayers = LAYER_OPTIONS.filter(layer => layer.category === 'distribution');

  // Handle selection of a distribution layer (checkbox style)
  const handleDistributionLayerChange = (layerId) => {
    // Check if any layer is currently active
    const isAnyLayerActive = ['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA']
      .some(id => activeLayers[id] && id !== layerId);
      
    // If this layer is already active and no other distribution layers are active,
    // we can simply toggle it off
    if (activeLayers[layerId] && !isAnyLayerActive) {
      onLayerToggle(layerId);
    } 
    // If this layer is already active and other layers are active,
    // we need to deselect all layers
    else if (activeLayers[layerId] && isAnyLayerActive) {
      onDistributionLayerSelect(null); // Pass null to indicate deselect all
    }
    // If this layer is not active, activate it and deactivate others
    else {
      onDistributionLayerSelect(layerId);
    }
  };

  // Handle farm layer selection
  const handleFarmLayerChange = (layerId) => {
    onFarmLayerSelect(layerId);
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
      
      {/* Farmer Search Section */}
      <FarmerSearch onSelectFarmer={onSelectFarmer} />

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
          <h3 className="text-md font-medium">Analytics</h3>
        </div>
        
        <div className="space-y-3">
          {distributionLayers.map(layer => (
            <div key={layer.id} className="flex items-start">
              <input
                type="checkbox"
                id={`layer-${layer.id}`}
                checked={activeLayers[layer.id] || false}
                onChange={() => handleDistributionLayerChange(layer.id)}
                className="mt-1 h-4 w-4 rounded border-gray-400 text-kitovu-purple focus:ring-kitovu-purple"
              />
              <label htmlFor={`layer-${layer.id}`} className="ml-2 block text-sm">
                <span className="font-medium">{layer.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Farms Section - HIDDEN for new filter implementation
      <div className="p-4 border-b">
        <div className="flex items-center mb-3">
          <LandPlot className="h-5 w-5 text-kitovu-purple mr-2" />
          <h3 className="text-md font-medium">Farms</h3>
        </div>
        
        <div className="space-y-3">
          All existing farm layer options 
        </div>
      </div>
      */}

      {/* Farm Filters Section */}
      <div className="p-4 border-b">
        <div className="flex items-center mb-3">
          <BarChart className="h-5 w-5 text-kitovu-purple mr-2" />
          <h3 className="text-md font-medium">Farm Filters</h3>
        </div>
        
        <div className="space-y-4">
          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select 
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
              value={filterState.state}
              disabled
            >
              <option value="Abia">Abia</option>
            </select>
          </div>
          
          {/* LGA Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
            <select 
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
              value={filterState.lga}
              onChange={(e) => onFilterChange({ ...filterState, lga: e.target.value, city: '' })}
              disabled={isLoadingLgas}
            >
              <option value="">Select LGA</option>
              {lgaOptions.map(lga => (
                <option key={lga.value} value={lga.value}>
                  {lga.label}
                </option>
              ))}
            </select>
            {isLoadingLgas && <div className="text-xs text-gray-500 mt-1">Loading LGAs...</div>}
          </div>
          
          {/* Community Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Community (City)</label>
            <select 
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
              value={filterState.city}
              onChange={(e) => onFilterChange({ ...filterState, city: e.target.value })}
              disabled={isLoadingCities || !filterState.lga}
            >
              <option value="">Select Community</option>
              {cityOptions.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            {isLoadingCities && <div className="text-xs text-gray-500 mt-1">Loading Cities...</div>}
          </div>
          
          {/* Farm Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Type</label>
            <select 
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
              value={filterState.farm_type}
              onChange={(e) => onFilterChange({ ...filterState, farm_type: e.target.value })}
            >
              <option value="">Select Farm Type</option>
              <option value="crop_farming">Crop Farming</option>
              <option value="livestock_farming">Livestock Farming</option>
              <option value="both">Both</option>
            </select>
          </div>
          
          {/* Crop Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <select 
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
              value={filterState.crop_type}
              onChange={(e) => onFilterChange({ ...filterState, crop_type: e.target.value })}
              disabled={isLoadingCrops}
            >
              <option value="">Select Crop Type</option>
              {filterCropOptions.map(crop => (
                <option key={crop.value} value={crop.value}>
                  {crop.label}
                </option>
              ))}
            </select>
            {isLoadingCrops && <div className="text-xs text-gray-500 mt-1">Loading Crops...</div>}
          </div>
          
          {/* Filter and Clear Buttons */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={onApplyFilter}
              className="flex-1 bg-kitovu-purple text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-kitovu-purple focus:ring-offset-2"
            >
              Filter
            </button>
            <button
              onClick={onClearFilter}
              className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear
            </button>
          </div>
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