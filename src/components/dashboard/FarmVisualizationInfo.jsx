// src/components/dashboard/FarmVisualizationInfo.jsx
import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

/**
 * Information panel to explain farm visualization modes
 * @param {Object} props - Component props
 * @param {boolean} props.showPolygons - Whether polygons are currently being shown
 * @param {number} props.currentZoom - Current map zoom level
 * @param {number} props.threshold - Zoom threshold for switching between points and polygons
 */
const FarmVisualizationInfo = ({ showPolygons, currentZoom, threshold }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  
  if (isDismissed) {
    return null;
  }
  
  return (
    <div className="absolute bottom-12 left-2 bg-white px-3 py-2 rounded-md shadow-md z-[900] max-w-xs border-l-4 border-kitovu-purple">
      <div className="flex items-start">
        <Info className="h-4 w-4 text-kitovu-purple mt-0.5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-gray-700 mb-1">
            {showPolygons ? (
              <>
                <span className="font-semibold">Showing farm boundaries</span> at current zoom level.
              </>
            ) : (
              <>
                <span className="font-semibold">Showing farm locations</span> as points. Zoom in to see boundaries.
              </>
            )}
          </p>
        </div>
        <button 
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default FarmVisualizationInfo;