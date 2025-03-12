// Event handlers
const toggleDrawer = () => {
  setDrawerOpen(!drawerOpen);
};

const handleBasemapChange = (basemap) => {
  setSelectedBasemap(basemap);
};// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { LeftDrawer, MapContainer } from '../components/dashboard';
import { getInitialActiveLayers } from '../config/mapSettings';

/**
* Dashboard page component with map and control panel
* Manages state for map layers, basemap selection, and drawer visibility
*/
const Dashboard = () => {
// State management
const [drawerOpen, setDrawerOpen] = useState(true);
const [selectedBasemap, setSelectedBasemap] = useState('streets'); // Default basemap
const [activeLayers, setActiveLayers] = useState({
  ...getInitialActiveLayers(),
  farmersByState: false,
  farmersByLGA: false,
  commodityByState: false,
  commodityByLGA: false
});

// Event handlers
const toggleDrawer = () => {
  setDrawerOpen(!drawerOpen);
};

const handleBasemapChange = (basemap) => {
  setSelectedBasemap(basemap);
};

const handleLayerToggle = (layerId) => {
  setActiveLayers({
    ...activeLayers,
    [layerId]: !activeLayers[layerId]
  });
};

// Handler for distribution layer selection (radio buttons)
const handleDistributionLayerSelect = (layerId) => {
  // Create a new state object with all distribution layers turned off
  const newState = { ...activeLayers };
  
  // Turn off all distribution layers
  ['farmersByState', 'farmersByLGA', 'commodityByState', 'commodityByLGA'].forEach(id => {
    newState[id] = false;
  });
  
  // Turn on only the selected one
  newState[layerId] = true;
  
  setActiveLayers(newState);
};

return (
  <Layout 
    showDrawerToggle={true}
    onDrawerToggle={toggleDrawer}
    hideFooter={true}
  >
    <div className="relative h-[calc(100vh-64px)] w-full">
      {/* Left Drawer with map controls */}
      <LeftDrawer 
        isOpen={drawerOpen}
        onClose={toggleDrawer}
        selectedBasemap={selectedBasemap}
        onBasemapChange={handleBasemapChange}
        activeLayers={activeLayers}
        onLayerToggle={handleLayerToggle}
        onDistributionLayerSelect={handleDistributionLayerSelect}
      />

      {/* Map Container - Full Screen */}
      <MapContainer 
        basemap={selectedBasemap}
        activeLayers={activeLayers}
      />
    </div>
  </Layout>
);
};

export default Dashboard;