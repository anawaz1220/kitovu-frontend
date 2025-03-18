// src/components/dashboard/FarmsSummary.jsx
import React from 'react';
import { X, LandPlot, Ruler, Wheat, Tractor, Users, Home, MapPin } from 'lucide-react';

/**
 * FarmsSummary component for displaying summary information in a right drawer
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {Function} props.onClose - Function to call when drawer is closed
 * @param {Object} props.summary - Summary data object
 * @param {string} props.title - Drawer title
 * @param {boolean} props.isLoading - Whether data is currently loading
 * @param {string} props.selectedFilter - Filter status: 'all', 'selected', or 'none'
 */
  const FarmsSummary = ({ 
    isOpen, 
    onClose, 
    summary, 
    title = "Farms Summary", 
    isLoading = false,
    selectedFilter = 'none'
  }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`bg-white w-80 shadow-lg h-full border-l transition-all duration-300 overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-20`}
      style={{ position: 'absolute', top: 0, bottom: 0, right: 0 }}
    >
      {/* Drawer Header */}
      <div className="p-4 flex justify-between items-center border-b bg-kitovu-purple text-white">
        <h2 className="text-lg font-medium">{title}</h2>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Summary Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-kitovu-purple border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading farms data...</p>
            </div>
          ) : selectedFilter === 'none' ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <LandPlot size={48} strokeWidth={1.5} />
              <p className="mt-4">Please select a filter option to view farms</p>
            </div>
          ) : !summary ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <LandPlot size={48} strokeWidth={1.5} />
              <p className="mt-4">No farms data available</p>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Filter Info */}
            {title !== "Farms Summary" && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Active Filter</h3>
                <p className="text-lg font-semibold text-kitovu-purple">{title}</p>
              </div>
            )}
            
            {/* Total Farms */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <LandPlot className="h-6 w-6 text-kitovu-purple" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Farms</h3>
                  <p className="text-2xl font-bold text-gray-800">{summary.totalFarms}</p>
                </div>
              </div>
            </div>
            
            {/* Total Area */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <Ruler className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Area</h3>
                  <p className="text-2xl font-bold text-gray-800">{summary.totalArea} acres</p>
                </div>
              </div>
            </div>
            
            {/* Unique Crops and Livestock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Wheat className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Unique Crops</h3>
                    <p className="text-xl font-bold text-gray-800">{summary.uniqueCrops}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-amber-100 rounded-full p-2 mr-3">
                    <Tractor className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Unique Livestock</h3>
                    <p className="text-xl font-bold text-gray-800">{summary.uniqueLivestocks}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Unique Farmers */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-pink-100 rounded-full p-3 mr-4">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Unique Farmers</h3>
                  <p className="text-2xl font-bold text-gray-800">{summary.uniqueFarmers}</p>
                </div>
              </div>
            </div>
            
            {/* Ownership Status */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Ownership Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  <Home className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Owned</p>
                    <p className="text-lg font-semibold text-gray-800">{summary.ownedFarms}</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  <MapPin className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Leased</p>
                    <p className="text-lg font-semibold text-gray-800">{summary.leasedFarms}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmsSummary;