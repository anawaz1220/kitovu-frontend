// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { LeftDrawer, MapContainer } from '../components/dashboard';
import { Menu } from 'lucide-react';

const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  // Change default basemap from 'dark' to 'streets'
  const [selectedBasemap, setSelectedBasemap] = useState('streets');
  const [activeLayers, setActiveLayers] = useState({
    farmers: false,
    cropDistribution: false,
    countryBoundary: false,
    stateBoundary: true,
    lgaBoundary: false,
  });

  const toggleDrawer = () => {
    console.log("Toggling drawer", !drawerOpen);
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

  return (
    <Layout 
      showDrawerToggle={true}
      onDrawerToggle={toggleDrawer}
      hideFooter={true}
    >
      <div className="relative h-[calc(100vh-64px)] w-full">
        {/* Left Drawer */}
        <LeftDrawer 
          isOpen={drawerOpen}
          onClose={toggleDrawer}
          selectedBasemap={selectedBasemap}
          onBasemapChange={handleBasemapChange}
          activeLayers={activeLayers}
          onLayerToggle={handleLayerToggle}
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