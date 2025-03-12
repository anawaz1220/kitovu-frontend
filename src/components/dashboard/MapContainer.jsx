// src/components/dashboard/MapContainer.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchFarmersCountByLocation, fetchCropsByLocation } from '../../services/api/location.service';

// Basemap URL configurations
const basemapUrls = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
};

// Component to update the map when props change
const MapUpdater = ({ basemap }) => {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
};

// Component to add GeoJSON layers based on API data
const DataLayers = ({ activeLayers }) => {
  const [farmersData, setFarmersData] = useState(null);
  const [cropsData, setCropsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const map = useMap();

  useEffect(() => {
    const fetchData = async () => {
      if (activeLayers.farmers && !farmersData) {
        setIsLoading(true);
        try {
          const data = await fetchFarmersCountByLocation({ type: 'LGA' });
          setFarmersData(data);
        } catch (error) {
          console.error('Error fetching farmers data:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (activeLayers.cropDistribution && !cropsData) {
        setIsLoading(true);
        try {
          const data = await fetchCropsByLocation({ type: 'LGA' });
          setCropsData(data);
        } catch (error) {
          console.error('Error fetching crops data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [activeLayers, farmersData, cropsData]);

  // Style function for farmers layer
  const farmersStyle = (feature) => {
    const count = feature.properties.farmer_count;
    return {
      fillColor: getColorByFarmersCount(count),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  // Style function for crops layer
  const cropsStyle = (feature) => {
    const area = feature.properties.crop_area;
    return {
      fillColor: getColorByCropArea(area),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  // Get color based on farmer count
  const getColorByFarmersCount = (count) => {
    return count > 100 ? '#800026' :
           count > 50  ? '#BD0026' :
           count > 20  ? '#E31A1C' :
           count > 10  ? '#FC4E2A' :
           count > 5   ? '#FD8D3C' :
           count > 2   ? '#FEB24C' :
           count > 0   ? '#FED976' :
                         '#FFEDA0';
  };

  // Get color based on crop area
  const getColorByCropArea = (area) => {
    return area > 1000 ? '#005a32' :
           area > 500  ? '#238b45' :
           area > 200  ? '#41ab5d' :
           area > 100  ? '#74c476' :
           area > 50   ? '#a1d99b' :
           area > 20   ? '#c7e9c0' :
           area > 0    ? '#e5f5e0' :
                         '#f7fcf5';
  };

  // Popup function for farmers layer
  const onEachFarmerFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(`
        <div style="font-family: Arial, sans-serif; padding: 5px;">
          <h4 style="margin: 0 0 5px 0;">${feature.properties.name}</h4>
          <p style="margin: 0;"><strong>Farmers:</strong> ${feature.properties.farmer_count}</p>
        </div>
      `);
    }
  };

  // Popup function for crops layer
  const onEachCropFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(`
        <div style="font-family: Arial, sans-serif; padding: 5px;">
          <h4 style="margin: 0 0 5px 0;">${feature.properties.name}</h4>
          <p style="margin: 0;"><strong>Farms:</strong> ${feature.properties.farms_count}</p>
          <p style="margin: 0;"><strong>Crop Area:</strong> ${feature.properties.crop_area.toFixed(2)} acres</p>
        </div>
      `);
    }
  };

  return (
    <>
      {activeLayers.farmers && farmersData && (
        <GeoJSON 
          data={farmersData} 
          style={farmersStyle}
          onEachFeature={onEachFarmerFeature}
        />
      )}
      {activeLayers.cropDistribution && cropsData && (
        <GeoJSON 
          data={cropsData} 
          style={cropsStyle}
          onEachFeature={onEachCropFeature}
        />
      )}
    </>
  );
};

const MapContainer = ({ basemap = 'streets', activeLayers }) => {
  // Default to center on Nigeria
  const position = [9.0820, 8.6753]; 
  const zoom = 6;

  return (
    <div className="w-full h-full absolute inset-0">
      <LeafletMap 
        center={position} 
        zoom={zoom} 
        className="w-full h-full"
        zoomControl={false}
        >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={basemapUrls[basemap]}
        />
        <MapUpdater basemap={basemap} />
        <DataLayers activeLayers={activeLayers} />
      </LeafletMap>
    </div>
  );
};

export default MapContainer;