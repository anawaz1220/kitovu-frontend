// src/components/dashboard/MapContainer.jsx
import React from 'react';
import { MapContainer as LeafletMap, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { defaultPosition, defaultZoom, basemapUrls } from './utils/mapConfig';
import MapUpdater from './MapUpdater';
import DataLayers from './DataLayers';

const MapContainer = ({ basemap = 'streets', activeLayers }) => {
  return (
    <div className="w-full h-full absolute inset-0" style={{ zIndex: 1 }}>
      <LeafletMap 
        center={defaultPosition} 
        zoom={defaultZoom} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={basemapUrls[basemap]}
        />
        <ZoomControl position="bottomright" />
        <MapUpdater basemap={basemap} />
        <DataLayers activeLayers={activeLayers} />
      </LeafletMap>
    </div>
  );
};

export default MapContainer;