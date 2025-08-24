// src/components/dashboard/AbiaLGASummaryLayer.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchAbiaLGASummary } from '../../services/api/abiaLGASummary.service';
import { fetchAbiaLGABoundaries } from '../../services/api/location.service';
import AbiaLGASummaryDrawer from './AbiaLGASummaryDrawer';

/**
 * Component that renders the Abia LGA summary layer with density visualization
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the layer should be visible
 */
const AbiaLGASummaryLayer = ({ visible }) => {
  const map = useMap();
  const [summaryData, setSummaryData] = useState(null);
  const [allLGABoundaries, setAllLGABoundaries] = useState(null);
  const [combinedGeoJsonData, setCombinedGeoJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLGA, setSelectedLGA] = useState(null);
  const [selectedLGAIndex, setSelectedLGAIndex] = useState(null);
  
  // Keep track of layer references for popup management
  const layerRefsMap = useRef(new Map());

  // Theme color scheme for farmer density (purple shades)
  const getDensityColor = (farmerCount) => {
    return farmerCount > 20 ? '#581c87' :  // Very dark purple
           farmerCount > 15 ? '#6b21b8' :  // Dark purple  
           farmerCount > 10 ? '#7c3aed' :  // Medium-dark purple
           farmerCount > 5  ? '#8b5cf6' :  // Medium purple
           farmerCount > 2  ? '#a78bfa' :  // Light-medium purple
           farmerCount > 0  ? '#c4b5fd' :  // Light purple
                              '#f3f4f6';   // Very light gray for zero but still visible
  };

  // Fetch data when layer becomes visible
  useEffect(() => {
    if (!visible) {
      setSummaryData(null);
      setAllLGABoundaries(null);
      setCombinedGeoJsonData(null);
      setSelectedLGA(null);
      setSelectedLGAIndex(null);
      layerRefsMap.current.clear();
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching Abia LGA data...');
        
        // Fetch both summary data and all LGA boundaries
        const [summaryResult, boundariesResult] = await Promise.all([
          fetchAbiaLGASummary().catch(err => {
            console.warn('Summary data not available:', err);
            return { rawSummary: null, geoJsonData: null };
          }),
          fetchAbiaLGABoundaries()
        ]);
        
        setSummaryData(summaryResult.rawSummary);
        setAllLGABoundaries(boundariesResult);
        
        // Combine the data - use boundaries as base and add summary data where available
        if (boundariesResult && boundariesResult.features) {
          const combinedFeatures = boundariesResult.features.map((boundaryFeature, index) => {
            // Find matching summary data for this LGA - improved matching
            const summaryLGA = summaryResult.rawSummary?.lgas_summary?.find(
              lga => {
                const boundaryName = boundaryFeature.properties.name.toLowerCase().trim();
                const summaryName = lga.lga_name.toLowerCase().trim();
                return boundaryName === summaryName;
              }
            );
            
            return {
              ...boundaryFeature,
              properties: {
                ...boundaryFeature.properties,
                // Add summary data if available, otherwise use defaults
                farmers_count: summaryLGA?.farmers_count || 0,
                farms_count: summaryLGA?.farms_count || 0,
                total_area_acres: summaryLGA?.total_area_acres || 0,
                crops_by_count: summaryLGA?.crops_by_count || [],
                boundary_index: index, // Use boundary index for map features
                lga_name: boundaryFeature.properties.name,
                // Add summary index for table mapping
                summary_index: summaryResult.rawSummary?.lgas_summary?.findIndex(
                  lga => lga.lga_name.toLowerCase().trim() === boundaryFeature.properties.name.toLowerCase().trim()
                ) || -1
              }
            };
          });
          
          setCombinedGeoJsonData({
            type: 'FeatureCollection',
            features: combinedFeatures
          });
        }
        
        console.log('Abia LGA data loaded successfully');
      } catch (err) {
        console.error('Error fetching Abia LGA data:', err);
        setError('Failed to load Abia LGA data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [visible]);

  // Fit bounds to LGAs when data is loaded
  useEffect(() => {
    if (!visible || !combinedGeoJsonData) return;

    try {
      console.log('Flying to Abia LGA bounds...');
      const tempLayer = L.geoJSON(combinedGeoJsonData);
      const bounds = tempLayer.getBounds();
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 10
        });
      }
    } catch (error) {
      console.error('Error fitting bounds to LGAs:', error);
    }
  }, [visible, combinedGeoJsonData, map]);

  // Style function for LGA polygons
  const getFeatureStyle = useMemo(() => {
    return (feature) => {
      const farmerCount = feature.properties.farmers_count || 0;
      const isSelected = selectedLGAIndex === feature.properties.boundary_index;
      
      return {
        fillColor: getDensityColor(farmerCount),
        weight: isSelected ? 4 : 2,
        opacity: 1,
        color: isSelected ? '#dc2626' : '#2563eb', // Blue borders, red when selected
        fillOpacity: farmerCount === 0 ? 0.3 : 0.7, // Still visible for zero values
        dashArray: isSelected ? '8,4' : ''
      };
    };
  }, [selectedLGAIndex]);

  // Feature interaction handler
  const onEachFeature = useMemo(() => {
    return (feature, layer) => {
      // Store layer reference for popup management
      layerRefsMap.current.set(feature.properties.boundary_index, layer);
      
      // Create enhanced popup content with all LGA data
      const props = feature.properties;
      
      // Build crops breakdown
      let cropsBreakdown = '';
      if (props.crops_by_count && props.crops_by_count.length > 0) {
        cropsBreakdown = props.crops_by_count.map(crop => `
          <div style="display: flex; justify-content: space-between; margin: 4px 0; padding: 4px; background: #f8fafc; border-radius: 4px;">
            <span style="font-weight: 500; color: #374151; text-transform: capitalize;">${crop.crop.replace('_', ' ')}</span>
            <span style="color: #059669; font-weight: bold;">${crop.count} farms (${crop.area} acres)</span>
          </div>
        `).join('');
      } else {
        cropsBreakdown = '<div style="text-align: center; color: #6b7280; font-style: italic; padding: 8px;">No commodities data available</div>';
      }

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 16px; min-width: 280px; max-width: 320px;">
          <h4 style="margin: 0 0 12px 0; font-size: 18px; color: #581c87; border-bottom: 3px solid #581c87; padding-bottom: 8px; font-weight: bold;">
            ${props.lga_name || props.name}
          </h4>
          
          <!-- Summary Stats Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 12px 0;">
            <div style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #581c87;">${props.farmers_count}</div>
              <div style="font-size: 10px; color: #6b21b8; font-weight: 500;">FARMERS</div>
            </div>
            <div style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #581c87;">${props.farms_count}</div>
              <div style="font-size: 10px; color: #6b21b8; font-weight: 500;">FARMS</div>
            </div>
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #92400e;">${props.total_area_acres}</div>
              <div style="font-size: 10px; color: #92400e; font-weight: 500;">ACRES</div>
            </div>
          </div>
          
          <!-- Crops Breakdown -->
          <div style="margin-top: 16px; padding: 12px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <div style="font-size: 14px; color: #0c4a6e; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;">
              🌾 Commodities Breakdown
            </div>
            <div style="max-height: 120px; overflow-y: auto;">
              ${cropsBreakdown}
            </div>
          </div>
          
          <!-- Action Hint -->
          <div style="margin-top: 12px; padding: 8px; background: #f3f4f6; border-radius: 6px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #6b7280; font-style: italic;">
              💡 Click to select and highlight this LGA
            </p>
          </div>
        </div>
      `;
      
      layer.bindPopup(popupContent, {
        maxWidth: 350,
        className: 'custom-popup'
      });

      // Add interaction events
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            color: '#1d4ed8',
            fillOpacity: 0.9
          });
          layer.bringToFront();
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(getFeatureStyle(feature));
        },
        click: (e) => {
          console.log('LGA clicked from map:', props.lga_name || props.name);
          handleLGAMapClick(props.lga_name || props.name, props.boundary_index, layer);
        }
      });
    };
  }, [getFeatureStyle]);

  // Handle LGA click from map
  const handleLGAMapClick = (lgaName, boundaryIndex, layer) => {
    console.log('Map click - LGA:', lgaName, 'Boundary Index:', boundaryIndex);
    setSelectedLGA(lgaName);
    setSelectedLGAIndex(boundaryIndex);
    
    // Fit bounds to selected LGA and show popup after fly completes
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12
      });
      
      // Auto-open popup after fly animation completes
      setTimeout(() => {
        if (layer && layer.openPopup) {
          layer.openPopup();
        }
      }, 500); // 0.5 second delay
    }
  };

  // Handle LGA click from table
  const handleLGATableClick = (lgaName, summaryIndex) => {
    console.log('Table click - LGA:', lgaName, 'Summary Index:', summaryIndex);
    
    // Find the corresponding boundary feature using LGA name matching
    if (combinedGeoJsonData && combinedGeoJsonData.features) {
      const feature = combinedGeoJsonData.features.find(f => {
        const featureName = f.properties.lga_name.toLowerCase().trim();
        const searchName = lgaName.toLowerCase().trim();
        return featureName === searchName;
      });
      
      if (feature) {
        const boundaryIndex = feature.properties.boundary_index;
        console.log('Found matching feature with boundary index:', boundaryIndex);
        
        setSelectedLGA(lgaName);
        setSelectedLGAIndex(boundaryIndex);
        
        // Get the layer reference and fly to it
        const layer = layerRefsMap.current.get(boundaryIndex);
        if (layer) {
          const bounds = L.geoJSON(feature).getBounds();
          if (bounds.isValid()) {
            map.flyToBounds(bounds, {
              padding: [50, 50],
              maxZoom: 12
            });
            
            // Auto-open popup after fly animation completes
            setTimeout(() => {
              if (layer && layer.openPopup) {
                layer.openPopup();
              }
            }, 500); // 0.5 second delay
          }
        }
      } else {
        console.error('Could not find matching feature for LGA:', lgaName);
      }
    }
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    console.log('LGA Drawer close requested - layer should be unchecked');
  };

  // Don't render if not visible
  if (!visible) return null;

  return (
    <>
      {/* Render the GeoJSON layer if we have data */}
      {combinedGeoJsonData && (
        <GeoJSON
          key={`abia-lga-summary-${selectedLGAIndex || 'none'}`}
          data={combinedGeoJsonData}
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
        />
      )}

      {/* Show drawer when layer is visible */}
      <AbiaLGASummaryDrawer
        isOpen={visible}
        onClose={handleDrawerClose}
        summaryData={summaryData}
        isLoading={isLoading}
        error={error}
        onLGAClick={handleLGATableClick}
        selectedLGA={selectedLGA}
      />
    </>
  );
};

export default AbiaLGASummaryLayer;