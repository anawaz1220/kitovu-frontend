// src/components/dashboard/FarmerDensityLegend.jsx
import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { calculateJenksBreaks, generateLabelsFromBreaks } from './utils/naturalBreaksUtils';

/**
 * Component that displays a dynamic legend for the farmer density layer
 * using natural breaks from the actual data distribution
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the legend should be visible
 * @param {Object} props.data - GeoJSON data with farmer counts
 */
const FarmerDensityLegend = ({ visible, data }) => {
  const map = useMap();
  const [legendControl, setLegendControl] = useState(null);

  // Define color scheme - blue shades from light to dark
  const BLUE_COLORS = [
    '#F7FBFF', // Very light blue for zero values
    '#DEEBF7',
    '#C6DBEF',
    '#9ECAE1',
    '#6BAED6',
    '#4292C6',
    '#2171B5',
    '#084594'  // Dark blue for high values
  ];

  useEffect(() => {
    if (!visible) {
      if (legendControl) {
        map.removeControl(legendControl);
      }
      return;
    }

    // Extract farmer counts from data for natural breaks calculation
    let farmerCounts = [];
    if (data && data.features) {
      farmerCounts = data.features
        .map(f => f.properties.farmer_count)
        .filter(count => count !== undefined && count !== null && count > 0);
    }

    // Calculate breaks using Jenks natural breaks algorithm (5 classes + 0 value)
    const breaks = [0];
    if (farmerCounts.length > 0) {
      const calculatedBreaks = calculateJenksBreaks(farmerCounts, 5);
      breaks.push(...calculatedBreaks);
    } else {
      // Fallback to default breaks if no data
      breaks.push(1, 10, 20, 30, 40);
    }

    // Remove duplicates and ensure ascending order
    const uniqueBreaks = [...new Set(breaks)].sort((a, b) => a - b);
    
    // Generate labels from breaks
    const labels = generateLabelsFromBreaks(uniqueBreaks);
    
    // Create custom legend control
    const newLegendControl = L.control({ position: 'bottomright' });
    
    newLegendControl.onAdd = function() {
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
      
      // Add items for each break
      for (let i = 0; i < uniqueBreaks.length - 1; i++) {
        const colorIndex = Math.min(i, BLUE_COLORS.length - 1);
        const item = document.createElement('div');
        
        // Create colored square
        const colorBox = document.createElement('i');
        colorBox.style.width = '18px';
        colorBox.style.height = '18px';
        colorBox.style.display = 'inline-block';
        
        // Special styling for zero value
        if (uniqueBreaks[i] === 0 && uniqueBreaks[i+1] > 0) {
          colorBox.style.backgroundColor = 'white';
          colorBox.style.border = '1px solid #CCCCCC';
          colorBox.style.borderStyle = 'dashed';
        } else {
          colorBox.style.backgroundColor = BLUE_COLORS[colorIndex + 1];
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
    
    // Add legend to map
    newLegendControl.addTo(map);
    setLegendControl(newLegendControl);
    
    // Cleanup function
    return () => {
      if (newLegendControl) {
        map.removeControl(newLegendControl);
      }
    };
  }, [map, visible, data, BLUE_COLORS]);
  
  // This component doesn't render anything directly
  return null;
};

export default FarmerDensityLegend;