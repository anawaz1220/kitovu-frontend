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
import { getFarmers } from '../services/api/farmerQuery.service'; // Keep for other sections
import communityService from '../services/api/community.service';

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
  const [communityFilter, setCommunityFilter] = useState('');
  const [cropOptions, setCropOptions] = useState([]);
  const [livestockOptions, setLivestockOptions] = useState([]);
  const [communityOptions, setCommunityOptions] = useState([]);
  const [farmsSummary, setFarmsSummary] = useState(null);
  const [isFarmDataLoading, setIsFarmDataLoading] = useState(false);
  const [shouldFetchFarms, setShouldFetchFarms] = useState(false);

  // Layer visibility state
  const [activeLayers, setActiveLayers] = useState({
    ...getInitialActiveLayers(),
    farmersByState: false,
    farmersByLGA: false,
    commodityByState: false,
    commodityByLGA: false
  });

  // Track if options have been loaded
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Use useCallback for event handlers to prevent unnecessary rerenders
  const toggleLeftDrawer = useCallback(() => {
    setLeftDrawerOpen(prevState => !prevState);
  }, []);

  // Updated handleSelectFarmer to work with search results
  const handleSelectFarmer = useCallback((farmer) => {
    console.log('Selected farmer from search:', farmer);
    
    // When selecting a farmer, deactivate any farm layers
    setActiveFarmLayer(null);
    setFarmsSummaryOpen(false);
    
    // The farmer object from search has farmer_id, display_name, phone_number
    // We'll let RightDrawer handle fetching the complete details
    setSelectedFarmer(farmer);
    setRightDrawerOpen(true);
    
    // Reset selected farm when selecting a new farmer
    setSelectedFarm(null);
    setFarmerFarms([]); // Clear existing farms, RightDrawer will load new ones
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

  // Update farms list when retrieved from RightDrawer
  const handleFarmsLoaded = useCallback((farms) => {
    console.log('Farms loaded from RightDrawer:', farms.length);
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
      // Create a new state object with a copy of the previous state
      const newState = { ...prevLayers };
      
      // Turn off all distribution layers
      ['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA'].forEach(id => {
        newState[id] = false;
      });
      
      // If layerId is not null, turn on the selected layer
      if (layerId !== null) {
        newState[layerId] = true;
      }
      
      return newState;
    });
  }, []);
  
  // Handle farm layer selection
  const handleFarmLayerSelect = useCallback((layerId) => {
    console.log('Farm layer selected:', layerId);
    
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
    
    // Turn off selected farmer/farm when using farm layers
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
      setCommunityFilter('');
    } else if (layerId === 'type') {
      setCropTypeFilter('');
      setLivestockTypeFilter('');
      setCommunityFilter('');
    } else if (layerId === 'crop') {
      setFarmTypeFilter('');
      setLivestockTypeFilter('');
      setCommunityFilter('');
    } else if (layerId === 'livestock') {
      setFarmTypeFilter('');
      setCropTypeFilter('');
      setCommunityFilter('');
    } else if (layerId === 'community') {
      setFarmTypeFilter('');
      setCropTypeFilter('');
      setLivestockTypeFilter('');
    }
    
    // Set loading state
    setIsFarmDataLoading(true);
    setShouldFetchFarms(true); // Always fetch when changing layer type
  }, [activeFarmLayer]);
  
  // Load crop, livestock, and community options on component mount
  useEffect(() => {
    // Skip if options are already loaded
    if (optionsLoaded) return;
    
    const loadOptions = async () => {
      try {
        setIsFarmDataLoading(true);
        
        console.log('Loading filter options...');
        
        // Load farm type options
        const options = await farmService.loadFilterOptions();
        setCropOptions(options.cropTypes);
        setLivestockOptions(options.livestockTypes);
        
        console.log('Loading communities...');
        
        // Load communities from the community service
        const communities = await communityService.getCommunities();
        setCommunityOptions(communities);
        
        console.log(`Options loaded - Crops: ${options.cropTypes.length}, Livestock: ${options.livestockTypes.length}, Communities: ${communities.length}`);
        
        // Mark options as loaded
        setOptionsLoaded(true);
      } catch (error) {
        console.error('Error loading options:', error);
      } finally {
        setIsFarmDataLoading(false);
      }
    };
    
    loadOptions();
  }, [optionsLoaded]);
  
  // Handle farm data loading
  const handleFarmDataLoaded = useCallback((farms) => {
    console.log(`Farm data loaded: ${farms.length} farms`);
    // Calculate summary statistics
    const summary = farmService.calculateFarmsSummary(farms);
    console.log('Farm summary calculated:', summary);
    setFarmsSummary(summary);
    setIsFarmDataLoading(false);
  }, []);
  
  // Update filter handlers to always trigger fetching
  const handleFarmTypeFilterChange = useCallback((value) => {
    console.log('Farm type filter changed:', value);
    setFarmTypeFilter(value);
    setIsFarmDataLoading(true);
    setShouldFetchFarms(true);
  }, []);

  const handleCropTypeFilterChange = useCallback((value) => {
    console.log('Crop type filter changed:', value);
    setCropTypeFilter(value);
    setIsFarmDataLoading(true);
    setShouldFetchFarms(true);
  }, []);

  const handleLivestockTypeFilterChange = useCallback((value) => {
    console.log('Livestock type filter changed:', value);
    setLivestockTypeFilter(value);
    setIsFarmDataLoading(true);
    setShouldFetchFarms(true);
  }, []);

  const handleCommunityFilterChange = useCallback((value) => {
    console.log('Community filter changed:', value);
    setCommunityFilter(value);
    setIsFarmDataLoading(true);
    setShouldFetchFarms(true);
    
    // Clear community service cache to force fresh data
    communityService.clearCache();
  }, []);

  // Generate filter params based on active farm layer
  const getFarmFilterParams = useCallback(() => {
    if (!shouldFetchFarms) {
      return {};
    }
    
    let params = {};
    
    switch (activeFarmLayer) {
      case 'type':
        params = { farm_type: farmTypeFilter };
        break;
      case 'crop':
        params = { crop_type: cropTypeFilter };
        break;
      case 'livestock':
        params = { livestock_type: livestockTypeFilter };
        break;
      case 'community':
        params = { community: communityFilter };
        break;
      case 'all':
      default:
        params = {};
    }
    
    console.log('Generated filter params:', params);
    return params;
  }, [activeFarmLayer, farmTypeFilter, cropTypeFilter, livestockTypeFilter, communityFilter, shouldFetchFarms]);
  
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
          communityFilter={communityFilter}
          onCommunityFilterChange={handleCommunityFilterChange}
          cropOptions={cropOptions}
          livestockOptions={livestockOptions}
          communityOptions={communityOptions}
        />

        {/* Right Drawer for farmer details - Now optimized for search results */}
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
            activeFarmLayer === 'community' && communityFilter ? `Farms in ${communityFilter}` :
            activeFarmLayer === 'community' ? 'Farms by Community' :
            'Farms Summary'
          }
          isLoading={isFarmDataLoading}
          selectedFilter={
            activeFarmLayer === 'all' ? 'all' :
            activeFarmLayer === 'type' && farmTypeFilter ? 'selected' :
            activeFarmLayer === 'crop' && cropTypeFilter ? 'selected' :
            activeFarmLayer === 'livestock' && livestockTypeFilter ? 'selected' :
            activeFarmLayer === 'community' && communityFilter ? 'selected' :
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