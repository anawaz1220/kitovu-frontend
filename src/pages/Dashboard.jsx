// src/pages/Dashboard.jsx
import React, { useState, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { LeftDrawer } from '../components/dashboard';
import MapContainer from '../components/dashboard/MapContainer';
import RightDrawer from '../components/dashboard/RightDrawer';
import { getInitialActiveLayers } from '../config/mapSettings';

/**
* Dashboard page component with map and control panel
* Manages state for map layers, basemap selection, and drawer visibility
*/
const Dashboard = () => {
  // State management
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [selectedBasemap, setSelectedBasemap] = useState('streets'); // Default basemap
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [farmerFarms, setFarmerFarms] = useState([]);
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
    setActiveLayers(prevLayers => ({
      ...prevLayers,
      [layerId]: !prevLayers[layerId]
    }));
  }, []);

  // Handler for distribution layer selection (radio buttons)
  const handleDistributionLayerSelect = useCallback((layerId) => {
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
        />

        {/* Right Drawer for farmer details */}
        <RightDrawer
          isOpen={rightDrawerOpen}
          onClose={handleCloseRightDrawer}
          selectedFarmer={selectedFarmer}
          onFarmSelect={handleFarmSelect}
          onFarmsLoaded={handleFarmsLoaded}
        />

        {/* Map Container - Full Screen */}
        <MapContainer 
          basemap={selectedBasemap}
          activeLayers={activeLayers}
          selectedFarmer={selectedFarmer}
          selectedFarm={selectedFarm}
          farmerFarms={farmerFarms}
          onFarmSelect={handleFarmSelect}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;