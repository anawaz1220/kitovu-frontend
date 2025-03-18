// src/pages/Dashboard.jsx

import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { LeftDrawer } from '../components/dashboard';
import MapContainer from '../components/dashboard/MapContainer';
import RightDrawer from '../components/dashboard/RightDrawer';
import FarmsSummary from '../components/dashboard/FarmsSummary';
import FarmsLayer from '../components/dashboard/FarmsLayer';
import { getInitialActiveLayers } from '../config/mapSettings';
import farmService from '../services/api/farms.service';

/**
* Dashboard page component with map and control panel
* Manages state for map layers, basemap selection, and drawer visibility
*/
const Dashboard = () => {
  // State management
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [farmsSummaryOpen, setFarmsSummaryOpen] = useState(false);
  const [selectedBasemap, setSelectedBasemap] = useState('streets'); // Default basemap
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [farmerFarms, setFarmerFarms] = useState([]);
  
  // Farm layers state
  
  const [activeFarmLayer, setActiveFarmLayer] = useState(null);
  const [farmTypeFilter, setFarmTypeFilter] = useState('');
  const [cropTypeFilter, setCropTypeFilter] = useState('');
  const [livestockTypeFilter, setLivestockTypeFilter] = useState('');
  const [cropOptions, setCropOptions] = useState([]);
  const [livestockOptions, setLivestockOptions] = useState([]);
  const [farmsSummary, setFarmsSummary] = useState(null);
  const [isFarmDataLoading, setIsFarmDataLoading] = useState(false);
  const [shouldFetchFarms, setShouldFetchFarms] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState(null);
  
  // Layer visibility state
  const [activeLayers, setActiveLayers] = useState({
    ...getInitialActiveLayers(),
    farmersByState: false,
    farmersByLGA: false,
    commodityByState: false,
    commodityByLGA: false
  });

  // Use useCallback for event handlers to prevent unnecessary rerenders
  const toggleLeftDrawer = useCallback(() => {
    setLeftDrawerOpen(prevState => !prevState);
  }, []);

  const handleSelectFarmer = useCallback((farmer) => {
    // When selecting a farmer, deactivate any farm layers
    setActiveFarmLayer(null);
    setFarmsSummaryOpen(false);
    
    setSelectedFarmer(farmer);
    setRightDrawerOpen(true);
    // Reset selected farm when selecting a new farmer
    setSelectedFarm(null);
  }, []);

  const handleCloseRightDrawer = useCallback(() => {
    setRightDrawerOpen(false);
    setSelectedFarmer(null);
    setSelectedFarm(null);
    setFarmerFarms([]);
  }, []);

  // Handle farm selection
  const handleFarmSelect = useCallback((farm) => {
    setSelectedFarm(farm);
  }, []);

  // Update farms list when retrieved
  const handleFarmsLoaded = useCallback((farms) => {
    setFarmerFarms(farms);
  }, []);

  const handleBasemapChange = useCallback((basemap) => {
    setSelectedBasemap(basemap);
  }, []);

  const handleLayerToggle = useCallback((layerId) => {
    // When toggling a regular layer, deactivate any farm layers
    setActiveFarmLayer(null);
    setFarmsSummaryOpen(false);
    
    setActiveLayers(prevLayers => ({
      ...prevLayers,
      [layerId]: !prevLayers[layerId]
    }));
  }, []);

  // Handler for distribution layer selection (radio buttons)
  const handleDistributionLayerSelect = useCallback((layerId) => {
    // When selecting a distribution layer, deactivate any farm layers
    setActiveFarmLayer(null);
    setFarmsSummaryOpen(false);
    
    setActiveLayers(prevLayers => {
      // Create a new state object with all distribution layers turned off
      const newState = { ...prevLayers };
      
      // Turn off all distribution layers
      ['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA'].forEach(id => {
        newState[id] = false;
      });
      
      // Turn on only the selected one
      newState[layerId] = true;
      
      return newState;
    });
  }, []);
  
  // Handle farm layer selection
  const handleFarmLayerSelect = useCallback((layerId) => {
    // Toggle off if already selected
    if (activeFarmLayer === layerId) {
      setActiveFarmLayer(null);
      setFarmsSummaryOpen(false);
      return;
    }
    
    // Turn off any distribution layers
    setActiveLayers(prevLayers => {
      const newState = { ...prevLayers };
      ['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA'].forEach(id => {
        newState[id] = false;
      });
      return newState;
    });
    
    // Turn off selected farmer/farm
    setSelectedFarmer(null);
    setSelectedFarm(null);
    setFarmerFarms([]);
    setRightDrawerOpen(false);
    
    // Enable farm summary drawer
    setFarmsSummaryOpen(true);
    
    // Set active farm layer
    setActiveFarmLayer(layerId);
    
    // Reset filters when changing layer types
    if (layerId === 'all') {
      setFarmTypeFilter('');
      setCropTypeFilter('');
      setLivestockTypeFilter('');
    } else if (layerId === 'type') {
      setCropTypeFilter('');
      setLivestockTypeFilter('');
    } else if (layerId === 'crop') {
      setFarmTypeFilter('');
      setLivestockTypeFilter('');
    } else if (layerId === 'livestock') {
      setFarmTypeFilter('');
      setCropTypeFilter('');
    }
    
    // Set loading state
    setIsFarmDataLoading(true);
    setShouldFetchFarms(true); // Always fetch when changing layer type
  }, [activeFarmLayer]);
  
  // Load crop and livestock options when needed
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsFarmDataLoading(true);
        
        // Only load once if not already loaded
        if (cropOptions.length === 0 || livestockOptions.length === 0) {
          const options = await farmService.loadFilterOptions();
          
          setCropOptions(options.cropTypes);
          setLivestockOptions(options.livestockTypes);
        }
      } catch (error) {
        console.error('Error loading farm options:', error);
      } finally {
        setIsFarmDataLoading(false);
      }
    };
    
    loadOptions();
  }, []);
  
  // Handle farm data loading
  const handleFarmDataLoaded = useCallback((farms) => {
    // Calculate summary statistics
    const summary = farmService.calculateFarmsSummary(farms);
    setFarmsSummary(summary);
    setIsFarmDataLoading(false);
  }, []);
  
  // Update filter handlers to always trigger fetching
const handleFarmTypeFilterChange = useCallback((value) => {
  setFarmTypeFilter(value);
  setIsFarmDataLoading(true);
  setShouldFetchFarms(true);
}, []);

const handleCropTypeFilterChange = useCallback((value) => {
  setCropTypeFilter(value);
  setIsFarmDataLoading(true);
  setShouldFetchFarms(true);
}, []);

const handleLivestockTypeFilterChange = useCallback((value) => {
  setLivestockTypeFilter(value);
  setIsFarmDataLoading(true);
  setShouldFetchFarms(true);
}, []);

// Generate filter params based on active farm layer
const getFarmFilterParams = useCallback(() => {
  if (!shouldFetchFarms) {
    return {};
  }
  
  switch (activeFarmLayer) {
    case 'type':
      return { farm_type: farmTypeFilter };
    case 'crop':
      return { crop_type: cropTypeFilter };
    case 'livestock':
      return { livestock_type: livestockTypeFilter };
    case 'all':
    default:
      return {};
  }
}, [activeFarmLayer, farmTypeFilter, cropTypeFilter, livestockTypeFilter, shouldFetchFarms]);
  
  // Handle farm summary close
  const handleCloseFarmSummary = useCallback(() => {
    setFarmsSummaryOpen(false);
    setActiveFarmLayer(null);
  }, []);

  return (
    <Layout 
      showDrawerToggle={true}
      onDrawerToggle={toggleLeftDrawer}
      hideFooter={true}
    >
      <div className="relative h-[calc(100vh-64px)] w-full">
        {/* Left Drawer with map controls */}
        <LeftDrawer 
          isOpen={leftDrawerOpen}
          onClose={toggleLeftDrawer}
          selectedBasemap={selectedBasemap}
          onBasemapChange={handleBasemapChange}
          activeLayers={activeLayers}
          onLayerToggle={handleLayerToggle}
          onDistributionLayerSelect={handleDistributionLayerSelect}
          onSelectFarmer={handleSelectFarmer}
          // Farm layer props
          onFarmLayerSelect={handleFarmLayerSelect}
          activeFarmLayer={activeFarmLayer}
          farmTypeFilter={farmTypeFilter}
          onFarmTypeFilterChange={handleFarmTypeFilterChange}
          cropTypeFilter={cropTypeFilter}
          onCropTypeFilterChange={handleCropTypeFilterChange}
          livestockTypeFilter={livestockTypeFilter}
          onLivestockTypeFilterChange={handleLivestockTypeFilterChange}
          cropOptions={cropOptions}
          livestockOptions={livestockOptions}
        />

        {/* Right Drawer for farmer details */}
        <RightDrawer
          isOpen={rightDrawerOpen}
          onClose={handleCloseRightDrawer}
          selectedFarmer={selectedFarmer}
          onFarmSelect={handleFarmSelect}
          onFarmsLoaded={handleFarmsLoaded}
        />
        
        {/* Farms Summary Drawer */}
          <FarmsSummary
            isOpen={farmsSummaryOpen}
            onClose={handleCloseFarmSummary}
            summary={farmsSummary}
            title={
              activeFarmLayer === 'all' ? 'All Farms Summary' :
              activeFarmLayer === 'type' && farmTypeFilter ? `${farmTypeFilter.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Farms` :
              activeFarmLayer === 'type' ? 'Farms by Type' :
              activeFarmLayer === 'crop' && cropTypeFilter ? `Farms Growing ${cropTypeFilter.charAt(0).toUpperCase() + cropTypeFilter.slice(1)}` :
              activeFarmLayer === 'crop' ? 'Farms by Crop' :
              activeFarmLayer === 'livestock' && livestockTypeFilter ? `Farms with ${livestockTypeFilter.charAt(0).toUpperCase() + livestockTypeFilter.slice(1)}` :
              activeFarmLayer === 'livestock' ? 'Farms by Livestock' :
              'Farms Summary'
            }
            isLoading={isFarmDataLoading}
            selectedFilter={
              activeFarmLayer === 'all' ? 'all' :
              activeFarmLayer === 'type' && farmTypeFilter ? 'selected' :
              activeFarmLayer === 'crop' && cropTypeFilter ? 'selected' :
              activeFarmLayer === 'livestock' && livestockTypeFilter ? 'selected' :
              'none'
            }
          />

        {/* Map Container - Full Screen */}
        <MapContainer 
          basemap={selectedBasemap}
          activeLayers={activeLayers}
          selectedFarmer={selectedFarmer}
          selectedFarm={selectedFarm}
          farmerFarms={farmerFarms}
          onFarmSelect={handleFarmSelect}
        >
          {/* Render farm layers - only when shouldFetchFarms is true or for "all" layer */}
            {activeFarmLayer && (
              activeFarmLayer === 'all' || shouldFetchFarms
            ) && (
              <FarmsLayer
                visible={true}
                filterParams={getFarmFilterParams()}
                onFarmsLoaded={handleFarmDataLoaded}
                onSelectFarm={handleFarmSelect}
              />
            )}
        </MapContainer>
      </div>
    </Layout>
  );
};

export default Dashboard;