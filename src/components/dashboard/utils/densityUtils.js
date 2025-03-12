// src/components/dashboard/utils/densityUtils.js

/**
 * Calculates the color for farmer density choropleth map
 * @param {number} count - Number of farmers
 * @returns {string} - Hex color code for the choropleth
 */
export const getFarmerDensityColor = (count) => {
    // Return colors based on density ranges - using blue shades
    return count > 40 ? '#0052CC' :  // Dark blue
           count > 30 ? '#1A75FF' :  // Medium-dark blue
           count > 20 ? '#4D94FF' :  // Medium blue
           count > 10 ? '#80B3FF' :  // Light-medium blue
           count > 0  ? '#B3D1FF' :  // Light blue
                       'transparent'; // Transparent for zero values
  };
  
  /**
   * Styling function for the farmer density choropleth
   * @param {Object} feature - GeoJSON feature
   * @returns {Object} - Leaflet path style options
   */
  export const farmerDensityStyle = (feature) => {
    const count = feature.properties.farmer_count || 0;
    
    return {
      fillColor: getFarmerDensityColor(count),
      weight: 1,
      opacity: 1,
      color: count === 0 ? '#CCCCCC' : 'white', // Light gray border for zero values
      dashArray: count === 0 ? '3' : '',
      fillOpacity: count === 0 ? 0.1 : 0.7     // Very low opacity for zero values to make them appear hollow
    };
  };
  
  /**
   * Creates a legend element for farmer density
   * @returns {HTMLElement} - Legend DOM element
   */
  export const createFarmerDensityLegend = () => {
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
    title.innerHTML = '<strong>Farmers Count</strong>';
    title.style.marginBottom = '6px';
    div.appendChild(title);
  
    // Define grades - include 0 as its own category
    const grades = [0, 1, 11, 21, 31, 41];
    const labels = ['0', '1 - 10', '11 - 20', '21 - 30', '31 - 40', '41+'];
    
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
        colorBox.style.backgroundColor = getFarmerDensityColor(fromValue);
      }
      
      colorBox.style.marginRight = '8px';
      
      // Create label text
      const label = document.createTextNode(labels[i]);
      
      // Add to item
      item.appendChild(colorBox);
      item.appendChild(label);
      
      div.appendChild(item);
    }
  
    return div;
  };
  
  /**
   * Feature interaction when clicking on a state in the density map
   * @param {Object} feature - GeoJSON feature
   * @param {Object} layer - Leaflet layer
   */
  export const onEachDensityFeature = (feature, layer) => {
    if (feature.properties) {
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'custom-popup';
      
      popupContent.innerHTML = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #084081; border-bottom: 1px solid #eee; padding-bottom: 5px;">${feature.properties.name}</h4>
          <p style="margin: 0; display: flex; justify-content: space-between;">
            <strong>Farmers Count:</strong> <span>${feature.properties.farmer_count || 0}</span>
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
          layer.setStyle(farmerDensityStyle(feature));
        }
      });
    }
  };