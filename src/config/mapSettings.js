// src/config/mapSettings.js
/**
 * Configuration settings for map components
 */

// Default basemap options
export const BASEMAP_OPTIONS = [
    { id: 'streets', name: 'Streets', description: 'Standard OpenStreetMap style' },
    { id: 'satellite', name: 'Satellite', description: 'Aerial imagery from ESRI' },
    { id: 'dark', name: 'Dark Mode', description: 'Dark theme for low-light viewing' }
  ];
  
  // Default layer options
  export const LAYER_OPTIONS = [
    { 
      id: 'farmersByState', 
      name: 'Analystics by State', 
      description: 'Shows density of farmers across states',
      category: 'distribution'
    },
    { 
      id: 'farmersByLGA', 
      name: 'Analytics by LGA', 
      description: 'Shows the distribution of Farmers Farms and Commodities by LGA',
      category: 'distribution'
    },
    // { 
    //   id: 'commodityByState', 
    //   name: 'Commodity by State', 
    //   description: 'Displays crop types and areas by state',
    //   category: 'distribution'
    // },
    // { 
    //   id: 'commodityByLGA', 
    //   name: 'Commodity by LGA', 
    //   description: 'Displays crop types and areas by LGA',
    //   category: 'distribution'
    // },
    { 
      id: 'countryBoundary', 
      name: 'Country Boundary', 
      description: 'Nigeria national boundary',
      category: 'admin'
    },
    { 
      id: 'stateBoundary', 
      name: 'State Boundaries', 
      description: 'Nigerian state boundaries',
      category: 'admin',
      defaultActive: true
    },
    { 
      id: 'lgaBoundary', 
      name: 'LGA Boundaries', 
      description: 'Local Government Areas',
      category: 'admin'
    }
  ];
  
  // Default map center for Abia State, Nigeria
  export const DEFAULT_MAP_CENTER = [5.43435404875959, 7.501115245033158];
  export const DEFAULT_MAP_ZOOM = 9; // Appropriate zoom level for state view
  
  // Get initial active layers based on default settings
  export const getInitialActiveLayers = () => {
    const initialLayers = {};
    LAYER_OPTIONS.forEach(layer => {
      initialLayers[layer.id] = !!layer.defaultActive;
    });
    return initialLayers;
  };