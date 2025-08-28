// src/components/dashboard/AbiaStateSummaryDrawer.jsx
import React from 'react';
import { X, Users, LandPlot, Ruler, Wheat, MapPin, Eye, EyeOff } from 'lucide-react';

/**
 * AbiaStateSummaryDrawer component for displaying complete Abia state summary
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {Function} props.onClose - Function to call when drawer is closed
 * @param {Object} props.summaryData - Abia state summary data
 * @param {boolean} props.isLoading - Whether data is currently loading
 * @param {string} props.error - Error message if any
 */
const AbiaStateSummaryDrawer = ({ 
  isOpen, 
  onClose, 
  summaryData, 
  isLoading = false,
  error = null,
  showFarmersOnMap = false,
  showFarmsOnMap = false,
  onToggleFarmersOnMap,
  onToggleFarmsOnMap
}) => {
  if (!isOpen) return null;

  // Handle close - this should work now
  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('State drawer close button clicked');
    // For now, we'll handle this in the parent component
    // The layer needs to be unchecked in the Dashboard
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div 
      className="bg-white shadow-lg h-full border-l transition-all duration-300 overflow-y-auto"
      style={{ 
        position: 'absolute', 
        top: 0, 
        bottom: 0, 
        right: 0, 
        width: '320px',
        zIndex: 1001,
        pointerEvents: 'auto'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drawer Header */}
      <div 
        className="p-4 flex justify-between items-center border-b bg-kitovu-purple text-white sticky top-0"
        style={{ zIndex: 1002 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-medium">Analytics by {summaryData ? summaryData.state_name : '-'} State</h2>
          {/* <p className="text-sm opacity-90">
            {summaryData ? summaryData.state_name : 'Abia'} State Summary
          </p> */}
        </div>
        <button 
          onClick={handleClose}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          className="text-white hover:text-gray-200 transition-colors p-2 rounded hover:bg-white hover:bg-opacity-20"
          style={{ 
            pointerEvents: 'auto',
            zIndex: 1003,
            display: 'block'
          }}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Summary Content */}
      <div 
        className="overflow-y-auto"
        style={{ 
          height: 'calc(100% - 80px)',
          pointerEvents: 'auto'
        }}
        onWheel={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-4" onWheel={(e) => e.stopPropagation()}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-kitovu-purple border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading state summary...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <MapPin size={48} strokeWidth={1.5} />
              <p className="mt-4">{error}</p>
            </div>
          ) : !summaryData ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MapPin size={48} strokeWidth={1.5} />
              <p className="mt-4">No state summary data available</p>
            </div>
          ) : (
            <div className="space-y-6" onWheel={(e) => e.stopPropagation()}>
              

              {/* Total Farmers */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-full p-3 mr-4">
                      <Users className="h-6 w-6 text-kitovu-purple" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Farmers</h3>
                      <p className="text-2xl font-bold text-gray-800">{summaryData.farmers_count}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <input
                      type="checkbox"
                      checked={showFarmersOnMap}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (onToggleFarmersOnMap) onToggleFarmersOnMap();
                      }}
                      className={`w-5 h-5 text-blue-600 bg-white border-2 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer ${
                        showFarmersOnMap 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-pink-400 hover:border-pink-500 hover:shadow-sm animate-pulse'
                      }`}
                    />
                    <label className="text-[10px] text-gray-600 mt-1 text-center">View on Map</label>
                  </div>
                </div>
              </div>
              
              {/* Total Farms */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <LandPlot className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Farms</h3>
                      <p className="text-2xl font-bold text-gray-800">{summaryData.farms_count}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <input
                      type="checkbox"
                      checked={showFarmsOnMap}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (onToggleFarmsOnMap) onToggleFarmsOnMap();
                      }}
                      className={`w-5 h-5 text-green-600 bg-white border-2 rounded focus:ring-green-500 focus:ring-2 transition-all duration-200 cursor-pointer ${
                        showFarmsOnMap 
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : 'border-pink-400 hover:border-pink-500 hover:shadow-sm animate-pulse'
                      }`}
                    />
                    <label className="text-[10px] text-gray-600 mt-1 text-center">View on Map</label>
                  </div>
                </div>
              </div>
              
              {/* Total Area */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-amber-100 rounded-full p-3 mr-4">
                    <Ruler className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Area</h3>
                    <p className="text-2xl font-bold text-gray-800">{summaryData.total_area_acres} acres</p>
                  </div>
                </div>
              </div>
              
              {/* Crops by Count */}
              {summaryData.crops_by_count && summaryData.crops_by_count.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 rounded-full p-3 mr-4">
                      <Wheat className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Crops by Count</h3>
                      <p className="text-lg font-bold text-gray-800">{summaryData.crops_by_count.length} crop types</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {summaryData.crops_by_count.map((crop, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize text-gray-800">
                            {crop.crop.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {crop.count} farms
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Area: {crop.area} acres</span>
                          <span>
                            {summaryData.farms_count > 0 
                              ? `${((crop.count / summaryData.farms_count) * 100).toFixed(1)}%` 
                              : '0%'} of farms
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: summaryData.farms_count > 0 
                                ? `${(crop.count / summaryData.farms_count) * 100}%` 
                                : '0%' 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbiaStateSummaryDrawer;