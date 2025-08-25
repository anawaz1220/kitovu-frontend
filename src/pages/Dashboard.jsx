// src/pages/Dashboard.jsx

import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { LeftDrawer } from '../components/dashboard';
import MapContainer from '../components/dashboard/MapContainer';
import RightDrawer from '../components/dashboard/RightDrawer';
import FarmsSummary from '../components/dashboard/FarmsSummary';
import FarmsLayer from '../components/dashboard/FarmsLayer';
import ClusteredPointsLayer from '../components/dashboard/ClusteredPointsLayer';
import FarmDetailsDrawer from '../components/dashboard/FarmDetailsDrawer';
import AdvisoryInputModal from '../components/advisory/AdvisoryInputModal'; // ADDED: Import advisory modal
import { getInitialActiveLayers } from '../config/mapSettings';
import farmService from '../services/api/farms.service';
import { getFarmers } from '../services/api/farmerQuery.service';
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
  const [farmDetailsOpen, setFarmDetailsOpen] = useState(false);
  const [selectedBasemap, setSelectedBasemap] = useState('streets');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [farmerFarms, setFarmerFarms] = useState([]);
  
  // ADDED: Advisory modal state management
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);
  const [selectedFarmForAdvisory, setSelectedFarmForAdvisory] = useState(null);
  
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

  // Clustered points state
  const [showFarmersOnMap, setShowFarmersOnMap] = useState(false);
  const [showFarmsOnMap, setShowFarmsOnMap] = useState(false);

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
    setFarmerFarms([]);
    setFarmDetailsOpen(false); // ADDED: Close farm details when selecting new farmer
  }, []);

  // Handle farm selection with individual API call
  const handleFarmSelect = useCallback(async (farm) => {
    console.log('handleFarmSelect called with farm:', farm);
    console.log('Farm ID from farm object:', farm.farm_id || farm.id);
    
    try {
      // Use farm_id if available, otherwise fall back to id
      const farmId = farm.farm_id || farm.id;
      
      if (!farmId) {
        console.error('No farm ID available for farm:', farm);
        // Still try to show what we have
        setSelectedFarm(farm);
        setFarmDetailsOpen(true);
        return;
      }
      
      // Show loading state immediately
      setSelectedFarm({ ...farm, isLoading: true });
      setFarmDetailsOpen(true);
      
      // Fetch fresh farm data from individual API
      console.log(`Making API call to: http://localhost:3000/api/farms?farm_id=${farmId}`);
      
      const freshFarmData = await farmService.getFarmById(farmId);
      console.log('API call successful! Fresh farm data received:', freshFarmData);
      
      // Set the selected farm with fresh data
      setSelectedFarm({
        ...freshFarmData,
        // Ensure it has required fields
        id: freshFarmData.id || farmId,
        farm_id: freshFarmData.farm_id || farmId,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Error fetching farm details:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Fall back to using the provided farm object
      setSelectedFarm({ ...farm, isLoading: false, hasError: true });
    }
  }, []);

  // Handle closing farm details drawer
  const handleCloseFarmDetails = useCallback(() => {
    setFarmDetailsOpen(false);
    setSelectedFarm(null);
  }, []);

  // Handle closing right drawer
  const handleCloseRightDrawer = useCallback(() => {
    setRightDrawerOpen(false);
    setSelectedFarmer(null);
  }, []);

  // Handle farms loaded from farmer selection
  const handleFarmsLoaded = useCallback((farms) => {
    console.log('Farms loaded for farmer:', farms.length);
    setFarmerFarms(farms);
  }, []);

  // FIXED: Handle advisory click - now properly manages modal state
  const handleAdvisoryClick = useCallback((farm) => {
    console.log('Advisory clicked for farm:', farm);
    setSelectedFarmForAdvisory(farm);
    setShowAdvisoryModal(true);
  }, []);

  // ADDED: Handle advisory modal close
  const handleAdvisoryModalClose = useCallback(() => {
    setShowAdvisoryModal(false);
    setSelectedFarmForAdvisory(null);
  }, []);

  // Handle basemap change
  const handleBasemapChange = useCallback((basemap) => {
    setSelectedBasemap(basemap);
  }, []);

  // FIXED: Handle layer toggle with proper state management for drawers and exclusivity
  const handleLayerToggle = useCallback((layerId) => {
    console.log('Toggling layer:', layerId);
    
    // Handle admin boundary layers
    if (['countryBoundary', 'stateBoundary', 'lgaBoundary'].includes(layerId)) {
      const newState = !activeLayers[layerId];
      
      // If turning ON this layer, turn OFF all other layers
      if (newState) {
        // Turn off all distribution layers
        setActiveLayers(prevLayers => {
          const updatedLayers = { ...prevLayers };
          ['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA', 
           'countryBoundary', 'stateBoundary', 'lgaBoundary'].forEach(id => {
            updatedLayers[id] = false;
          });
          updatedLayers[layerId] = true;
          return updatedLayers;
        });
        
        // Turn off farm layers
        setActiveFarmLayer(null);
        setFarmsSummaryOpen(false);
        
        // Turn off farmer/farm selection
        setSelectedFarmer(null);
        setSelectedFarm(null);
        setFarmerFarms([]);
        setRightDrawerOpen(false);
        setFarmDetailsOpen(false); // ADDED: Close farm details
      } else {
        // Just toggle off this layer
        setActiveLayers(prevLayers => ({
          ...prevLayers,
          [layerId]: false
        }));
      }
      return;
    }
    
    // Handle distribution layers - these have drawers that close when unchecked
    if (['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA'].includes(layerId)) {
      const newState = !activeLayers[layerId];
      
      console.log(`${layerId} being turned ${newState ? 'ON' : 'OFF'}`);
      
      // If turning ON this layer, turn OFF all other layers
      if (newState) {
        setActiveLayers(prevLayers => {
          const updatedLayers = { ...prevLayers };
          ['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA',
           'countryBoundary', 'stateBoundary', 'lgaBoundary'].forEach(id => {
            updatedLayers[id] = false;
          });
          updatedLayers[layerId] = true;
          return updatedLayers;
        });
        
        // Turn off farm layers when distribution layers are enabled
        setActiveFarmLayer(null);
        setFarmsSummaryOpen(false);
        
        // Turn off farmer/farm selection when distribution layers are enabled
        setSelectedFarmer(null);
        setSelectedFarm(null);
        setFarmerFarms([]);
        setRightDrawerOpen(false);
        setFarmDetailsOpen(false); // ADDED: Close farm details
      } else {
        // Just toggle off this layer
        setActiveLayers(prevLayers => ({
          ...prevLayers,
          [layerId]: false
        }));
      }
      return;
    }
    
    // For all other layers, simple toggle
    setActiveLayers(prevLayers => ({
      ...prevLayers,
      [layerId]: !prevLayers[layerId]
    }));
  }, [activeLayers]);

  // Handle distribution layer selection (for LGA summary specifically)
  const handleDistributionLayerSelect = useCallback((layerId) => {
    console.log('Distribution layer selected:', layerId);
    handleLayerToggle(layerId);
  }, [handleLayerToggle]);

  // Handle farm layer selection
  const handleFarmLayerSelect = useCallback((layerId) => {
    console.log('Farm layer selected:', layerId);
    
    // Toggle off if already selected
    if (activeFarmLayer === layerId) {
      setActiveFarmLayer(null);
      setFarmsSummaryOpen(false);
      return;
    }
    
    // Turn off any distribution layers and admin boundaries
    setActiveLayers(prevLayers => {
      const newState = { ...prevLayers };
      ['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA',
       'countryBoundary', 'stateBoundary', 'lgaBoundary'].forEach(id => {
        newState[id] = false;
      });
      return newState;
    });
    
    // Turn off selected farmer/farm when using farm layers
    setSelectedFarmer(null);
    setSelectedFarm(null);
    setFarmerFarms([]);
    setRightDrawerOpen(false);
    setFarmDetailsOpen(false); // ADDED: Close farm details
    
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
  
  // Handle clustered points toggles
  const handleToggleFarmersOnMap = useCallback(() => {
    setShowFarmersOnMap(prev => !prev);
  }, []);

  const handleToggleFarmsOnMap = useCallback(() => {
    setShowFarmsOnMap(prev => !prev);
  }, []);

  // Auto turn-off clusters when analytics layers are disabled
  useEffect(() => {
    const hasActiveAnalyticsLayers = activeLayers.farmersByState || activeLayers.farmersByLGA || 
                                    activeLayers.commodityByState || activeLayers.commodityByLGA;
    
    if (!hasActiveAnalyticsLayers) {
      // Turn off both clustering options when no analytics layers are active
      setShowFarmersOnMap(false);
      setShowFarmsOnMap(false);
    }
  }, [activeLayers.farmersByState, activeLayers.farmersByLGA, activeLayers.commodityByState, activeLayers.commodityByLGA]);

  // Handle farm summary close
  const handleCloseFarmSummary = useCallback(() => {
    setFarmsSummaryOpen(false);
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

        {/* Farm Details Drawer */}
        <FarmDetailsDrawer
          isOpen={farmDetailsOpen}
          onClose={handleCloseFarmDetails}
          selectedFarm={selectedFarm}
          onAdvisoryClick={handleAdvisoryClick}
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
            activeFarmLayer === 'community' && communityFilter ? `${communityFilter} Community Farms` :
            activeFarmLayer === 'community' ? 'Farms by Community' :
            'Farm Layer Summary'
          }
        />

        {/* Map Container */}
        <MapContainer
          basemap={selectedBasemap}
          activeLayers={activeLayers}
          selectedFarmer={selectedFarmer}
          selectedFarm={selectedFarm}
          farmerFarms={farmerFarms}
          onFarmSelect={handleFarmSelect}
          showFarmersOnMap={showFarmersOnMap}
          showFarmsOnMap={showFarmsOnMap}
          onToggleFarmersOnMap={handleToggleFarmersOnMap}
          onToggleFarmsOnMap={handleToggleFarmsOnMap}
          onBasemapChange={handleBasemapChange}
        >
          {/* Farm layers - only render when farm layer is active */}
          {activeFarmLayer && (
            <FarmsLayer
              key={`${activeFarmLayer}-${farmTypeFilter}-${cropTypeFilter}-${livestockTypeFilter}-${communityFilter}`}
              filterParams={getFarmFilterParams()}
              onDataLoaded={handleFarmDataLoaded}
              onAdvisoryClick={handleAdvisoryClick}
              shouldFetch={shouldFetchFarms}
              onFetchCompleted={() => setShouldFetchFarms(false)}
              isLoading={isFarmDataLoading}
            />
          )}

          {/* Clustered points layers - only render when analytics layers are active */}
          {(activeLayers.farmersByState || activeLayers.farmersByLGA || activeLayers.commodityByState || activeLayers.commodityByLGA) && (
            <ClusteredPointsLayer
              showFarmers={showFarmersOnMap}
              showFarms={showFarmsOnMap}
              onSelectFarmer={handleSelectFarmer}
              onSelectFarm={handleFarmSelect}
              onAdvisoryClick={handleAdvisoryClick}
            />
          )}
        </MapContainer>

        {/* ADDED: Advisory Input Modal */}
        <AdvisoryInputModal
          isOpen={showAdvisoryModal}
          onClose={handleAdvisoryModalClose}
          farm={selectedFarmForAdvisory}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;