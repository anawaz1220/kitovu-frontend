import React from 'react';
import { Map, Layers, Navigation2 } from 'lucide-react';

const LayerControls = ({ currentLayer, onLayerChange, isTracing, onTraceToggle }) => {
  return (
    <div className="absolute top-2 right-2 z-[1000] bg-white rounded-md shadow-md">
      <div className="flex p-1">
        <button
          onClick={() => onLayerChange('satellite')}
          className={`p-2 ${
            currentLayer === 'satellite'
              ? 'bg-kitovu-purple text-white'
              : 'bg-white text-gray-700'
          } rounded-l-md hover:bg-opacity-90`}
          title="Satellite View"
        >
          <Layers className="h-5 w-5" />
        </button>
        <button
          onClick={() => onLayerChange('osm')}
          className={`p-2 ${
            currentLayer === 'osm'
              ? 'bg-kitovu-purple text-white'
              : 'bg-white text-gray-700'
          } hover:bg-opacity-90`}
          title="Map View"
        >
          <Map className="h-5 w-5" />
        </button>
        <button
          onClick={onTraceToggle}
          className={`p-2 ${
            isTracing
              ? 'bg-kitovu-purple text-white'
              : 'bg-white text-gray-700'
          } rounded-r-md hover:bg-opacity-90`}
          title={isTracing ? 'Stop Tracing' : 'Start Tracing'}
        >
          <Navigation2 
            className={`h-5 w-5 ${isTracing ? 'animate-pulse' : ''}`} 
          />
        </button>
      </div>
    </div>
  );
};

export default LayerControls;