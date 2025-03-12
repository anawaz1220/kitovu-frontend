// src/components/dashboard/utils/mapStyles.js

// Style functions for various layers
export const farmersStyle = (feature) => {
    const count = feature.properties.farmer_count;
    return {
      fillColor: getColorByFarmersCount(count),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };
  
  export const cropsStyle = (feature) => {
    const area = feature.properties.crop_area;
    return {
      fillColor: getColorByCropArea(area),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };
  
  export const countryStyle = () => {
    return {
      fillColor: 'transparent',
      weight: 2,
      opacity: 1,
      color: '#4a1d96', // Dark purple color
      fillOpacity: 0,
      dashArray: '3'
    };
  };
  
  export const stateStyle = () => {
    return {
      fillColor: 'transparent',
      weight: 1.5,
      opacity: 1,
      color: '#8e44ad', // Purple color
      fillOpacity: 0
    };
  };
  
  export const lgaStyle = () => {
    return {
      fillColor: 'transparent',
      weight: 1,
      opacity: 1,
      color: '#27ae60', // Green color
      fillOpacity: 0
    };
  };
  
  // Color functions
  export const getColorByFarmersCount = (count) => {
    return count > 100 ? '#800026' :
           count > 50  ? '#BD0026' :
           count > 20  ? '#E31A1C' :
           count > 10  ? '#FC4E2A' :
           count > 5   ? '#FD8D3C' :
           count > 2   ? '#FEB24C' :
           count > 0   ? '#FED976' :
                         '#FFEDA0';
  };
  
  export const getColorByCropArea = (area) => {
    return area > 1000 ? '#005a32' :
           area > 500  ? '#238b45' :
           area > 200  ? '#41ab5d' :
           area > 100  ? '#74c476' :
           area > 50   ? '#a1d99b' :
           area > 20   ? '#c7e9c0' :
           area > 0    ? '#e5f5e0' :
                         '#f7fcf5';
  };