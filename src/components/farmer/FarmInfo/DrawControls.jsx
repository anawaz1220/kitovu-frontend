// src/components/farmer/FarmInfo/DrawControls.jsx
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const DrawControls = ({ 
  isDrawing,
  isTracing,
  onStartDrawing,
  onStartTracing,
  onStopTracing,
  accuracy,
  hasOverlap
}) => {
  return (
    <div className="absolute top-4 left-4 z-[1000]">
      {/* Warning for overlap */}
      {hasOverlap && (
        <div className="mb-4 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            Warning: Farm overlaps with existing boundary
          </p>
        </div>
      )}

      {/* Drawing controls */}
      <div className="flex flex-col space-y-2">
        {!isDrawing && !isTracing && (
          <>
            <button
              onClick={onStartDrawing}
              className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 flex items-center space-x-2"
              title="Draw farm boundary manually"
            >
              <MapPin className="h-5 w-5 text-kitovu-purple" />
              <span className="text-sm whitespace-nowrap">Draw Farm</span>
            </button>
            <button
              onClick={onStartTracing}
              className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 flex items-center space-x-2"
              title="Trace farm boundary by walking"
            >
              <Navigation className="h-5 w-5 text-kitovu-purple" />
              <span className="text-sm whitespace-nowrap">Start Tracing</span>
            </button>
          </>
        )}

        {/* Tracing accuracy indicator */}
        {isTracing && (
          <div className="p-2 bg-white rounded-lg shadow-lg">
            <div className="text-sm text-gray-500">
              GPS Accuracy: 
              <span className="ml-2 font-medium">
                {accuracy ? `±${Math.round(accuracy)}m` : 'Calculating...'}
              </span>
            </div>
            <button
              onClick={onStopTracing}
              className="mt-2 w-full px-3 py-1 bg-kitovu-purple text-white rounded-md hover:bg-opacity-90"
            >
              Stop Tracing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawControls;