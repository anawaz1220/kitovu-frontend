// src/components/dashboard/utils/commodityUtils.js

/**
 * Calculates the color for commodity density choropleth map
 * @param {number} area - Area of crops
 * @returns {string} - Hex color code for the choropleth
 */
export const getCommodityDensityColor = (area) => {
    // Return colors based on density ranges - using blue shades
    return area > 1000 ? '#003D99' :  // Very dark blue
           area > 500  ? '#0052CC' :  // Dark blue
           area > 200  ? '#0066FF' :  // Medium-dark blue
           area > 100  ? '#4D94FF' :  // Medium blue
           area > 0    ? '#99C2FF' :  // Light blue
                         'transparent'; // Transparent for zero values
  };
  
  /**
   * Styling function for the commodity density choropleth
   * @param {Object} feature - GeoJSON feature
   * @returns {Object} - Leaflet path style options
   */
  export const commodityDensityStyle = (feature) => {
    const area = feature.properties.crop_area || 0;
    
    return {
      fillColor: getCommodityDensityColor(area),
      weight: 1,
      opacity: 1,
      color: area === 0 ? '#CCCCCC' : 'white', // Light gray border for zero values
      dashArray: area === 0 ? '3' : '',
      fillOpacity: area === 0 ? 0.1 : 0.7     // Very low opacity for zero values to make them appear hollow
    };
  };
  
  /**
   * Creates a legend element for commodity density
   * @returns {HTMLElement} - Legend DOM element
   */
  export const createCommodityDensityLegend = () => {
    const div = document.createElement('div');
    div.className = 'info legend';
    div.style.padding = '6px 8px';
    div.style.background = 'white';
    div.style.borderRadius = '4px';
    div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
    div.style.lineHeight = '18px';
    div.style.color = '#555';
  
    // Legend title
    const title = document.createElement('div');
    title.innerHTML = '<strong>Crop Area (acres)</strong>';
    title.style.marginBottom = '6px';
    div.appendChild(title);
  
    // Define grades with clear labeling
    const grades = [0, 1, 101, 201, 501, 1001];
    const labels = ['0', '1 - 100', '101 - 200', '201 - 500', '501 - 1000', '1001+'];
    
    // Loop through the density intervals and generate a label with colored square for each
    for (let i = 0; i < grades.length; i++) {
      const fromValue = grades[i];
      
      const item = document.createElement('div');
      
      // Create colored square
      const colorBox = document.createElement('i');
      colorBox.style.width = '18px';
      colorBox.style.height = '18px';
      colorBox.style.display = 'inline-block';
      
      // Special styling for zero value
      if (fromValue === 0) {
        colorBox.style.backgroundColor = 'white';
        colorBox.style.border = '1px solid #CCCCCC';
        colorBox.style.borderStyle = 'dashed';
      } else {
        colorBox.style.backgroundColor = getCommodityDensityColor(fromValue);
      }
      
      colorBox.style.marginRight = '8px';
      
      // Create label text using the predefined labels
      const label = document.createTextNode(labels[i]);
      
      // Add to item
      item.appendChild(colorBox);
      item.appendChild(label);
      
      div.appendChild(item);
    }
  
    return div;
  };
  
  /**
   * Feature interaction when clicking on a state/LGA in the density map
   * @param {Object} feature - GeoJSON feature
   * @param {Object} layer - Leaflet layer
   */
  export const onEachCommodityFeature = (feature, layer) => {
    if (feature.properties) {
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'custom-popup';
      
      popupContent.innerHTML = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #238b45; border-bottom: 1px solid #eee; padding-bottom: 5px;">${feature.properties.name}</h4>
          <p style="margin: 0; display: flex; justify-content: space-between;">
            <strong>Farms Count:</strong> <span>${feature.properties.farms_count || 0}</span>
          </p>
          <p style="margin: 5px 0 0 0; display: flex; justify-content: space-between;">
            <strong>Crop Area:</strong> <span>${feature.properties.crop_area ? feature.properties.crop_area.toFixed(2) : 0} acres</span>
          </p>
        </div>
      `;
      
      // Bind popup to layer
      layer.bindPopup(popupContent);
      
      // Highlight on hover
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.8
          });
          
          layer.bringToFront();
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(commodityDensityStyle(feature));
        }
      });
    }
  };