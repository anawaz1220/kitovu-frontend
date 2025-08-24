// src/components/dashboard/AbiaLGASummaryDrawer.jsx
import React, { useState, useMemo } from 'react';
import { X, Users, LandPlot, Ruler, MapPin, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * AbiaLGASummaryDrawer component for displaying LGA summary with interactive table
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {Function} props.onClose - Function to call when drawer is closed
 * @param {Object} props.summaryData - Abia LGA summary data
 * @param {boolean} props.isLoading - Whether data is currently loading
 * @param {string} props.error - Error message if any
 * @param {Function} props.onLGAClick - Function to call when LGA is clicked in table
 * @param {string} props.selectedLGA - Currently selected LGA name
 */
const AbiaLGASummaryDrawer = ({ 
  isOpen, 
  onClose, 
  summaryData, 
  isLoading = false,
  error = null,
  onLGAClick = () => {},
  selectedLGA = null
}) => {
  const [sortField, setSortField] = useState('lga_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Get unique crops from all LGAs
  const uniqueCrops = useMemo(() => {
    if (!summaryData || !summaryData.lgas_summary) return [];
    
    const cropsSet = new Set();
    summaryData.lgas_summary.forEach(lga => {
      if (lga.crops_by_count) {
        lga.crops_by_count.forEach(crop => {
          cropsSet.add(crop.crop);
        });
      }
    });
    
    return Array.from(cropsSet).sort();
  }, [summaryData]);

  // Create enhanced table data with crop columns
  const enhancedTableData = useMemo(() => {
    if (!summaryData || !summaryData.lgas_summary) return [];
    
    return summaryData.lgas_summary.map((lga, index) => {
      const lgaData = {
        lga_name: lga.lga_name,
        lga_index: index,
        farmers_count: lga.farmers_count,
        farms_count: lga.farms_count,
        total_area_acres: lga.total_area_acres
      };
      
      // Add crop counts for each unique crop
      uniqueCrops.forEach(cropName => {
        const cropData = lga.crops_by_count?.find(c => c.crop === cropName);
        lgaData[`crop_${cropName}`] = cropData ? cropData.count : 0;
      });
      
      return lgaData;
    });
  }, [summaryData, uniqueCrops]);

  // Sort enhanced table data
  const sortedTableData = useMemo(() => {
    const sorted = [...enhancedTableData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    
    return sorted;
  }, [enhancedTableData, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle row click
  const handleRowClick = (row) => {
    onLGAClick(row.lga_name, row.lga_index);
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!summaryData || !summaryData.lgas_summary) return null;
    
    const totalFarmers = summaryData.lgas_summary.reduce((sum, lga) => sum + lga.farmers_count, 0);
    const totalFarms = summaryData.lgas_summary.reduce((sum, lga) => sum + lga.farms_count, 0);
    const totalArea = summaryData.lgas_summary.reduce((sum, lga) => sum + lga.total_area_acres, 0);
    const totalLGAs = summaryData.lgas_summary.length;
    
    return { totalFarmers, totalFarms, totalArea, totalLGAs };
  }, [summaryData]);

  if (!isOpen) return null;

  return (
    <div 
      className="bg-white shadow-lg h-full border-l transition-all duration-300"
      style={{ 
        position: 'absolute', 
        top: 0, 
        bottom: 0, 
        right: 0, 
        width: '480px',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drawer Header */}
      <div 
        className="p-4 flex justify-between items-center border-b bg-kitovu-purple text-white sticky top-0 z-10"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-medium">Analytics by LGAs of {summaryData ? summaryData.state_name : 'Abia'} State</h2>
          {/* <p className="text-sm opacity-90">
            Shows the distribution of Farmers Farms and Commodities of {summaryData ? summaryData.state_name : 'Abia'} State LGAs
          </p> */}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-white hover:text-gray-200 transition-colors p-2"
          style={{ pointerEvents: 'auto', display: 'none' }}
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
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-kitovu-purple border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading LGA summary...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <MapPin size={48} strokeWidth={1.5} />
              <p className="mt-4">{error}</p>
            </div>
          ) : !summaryData ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MapPin size={48} strokeWidth={1.5} />
              <p className="mt-4">No LGA summary data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              {summaryStats && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-purple-100 rounded-full p-2 mr-3">
                        <Users className="h-4 w-4 text-kitovu-purple" />
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-500">Total Farmers</h3>
                        <p className="text-lg font-bold text-gray-800">{summaryStats.totalFarmers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <LandPlot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-500">Total Farms</h3>
                        <p className="text-lg font-bold text-gray-800">{summaryStats.totalFarms}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-amber-100 rounded-full p-2 mr-3">
                        <Ruler className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-500">Total Area</h3>
                        <p className="text-lg font-bold text-gray-800">{summaryStats.totalArea.toFixed(2)} acres</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-3">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-500">Total LGAs</h3>
                        <p className="text-lg font-bold text-gray-800">{summaryStats.totalLGAs}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Interactive Table */}
              <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3">LGA Crops Breakdown</h3>
                
                <div 
                  className="overflow-x-auto rounded-lg"
                  onWheel={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Table Header */}
                  <div className="bg-white sticky top-0 z-10 border-b-2 border-gray-100">
                    <div className="grid gap-1 p-2 text-xs font-medium text-gray-700" style={{
                      gridTemplateColumns: `150px 60px 60px ${uniqueCrops.map(() => '50px').join(' ')}`
                    }}>
                      <button 
                        onClick={() => handleSort('lga_name')}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-left hover:text-kitovu-purple flex items-center justify-between px-2 py-1 rounded"
                      >
                        <span>LGA Name</span>
                        {sortField === 'lga_name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleSort('farmers_count')}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-center hover:text-kitovu-purple flex items-center justify-center px-1 py-1 rounded"
                      >
                        <span>Farmers</span>
                        {sortField === 'farmers_count' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleSort('farms_count')}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-center hover:text-kitovu-purple flex items-center justify-center px-1 py-1 rounded"
                      >
                        <span>Farms</span>
                        {sortField === 'farms_count' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </button>
                      {uniqueCrops.map((crop) => (
                        <button
                          key={crop}
                          onClick={() => handleSort(`crop_${crop}`)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="text-center hover:text-kitovu-purple flex flex-col items-center justify-center px-1 py-1 rounded"
                          title={crop.replace('_', ' ').toUpperCase()}
                        >
                          <span className="text-xs capitalize leading-tight">
                            {crop.replace('_', ' ').substring(0, 6)}
                          </span>
                          {sortField === `crop_${crop}` && (
                            sortDirection === 'asc' ? <ChevronUp className="h-2 w-2" /> : <ChevronDown className="h-2 w-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div 
                    className="space-y-1 p-2 max-h-96 overflow-y-auto"
                    onWheel={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {sortedTableData.map((row) => (
                      <div
                        key={row.lga_index}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`grid gap-1 p-2 text-xs rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedLGA === row.lga_name 
                            ? 'bg-kitovu-purple text-white shadow-md transform scale-[1.01]' 
                            : 'bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-sm hover:transform hover:scale-[1.005] shadow-sm'
                        }`}
                        style={{
                          gridTemplateColumns: `150px 60px 60px ${uniqueCrops.map(() => '50px').join(' ')}`
                        }}
                      >
                        <div className="font-medium truncate px-2 py-1" title={row.lga_name}>
                          {row.lga_name}
                        </div>
                        <div className="text-center px-1 py-1">{row.farmers_count}</div>
                        <div className="text-center px-1 py-1">{row.farms_count}</div>
                        {uniqueCrops.map((crop) => (
                          <div key={crop} className="text-center px-1 py-1 font-medium">
                            {row[`crop_${crop}`] || 0}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Click on any row to highlight the LGA on the map • {sortedTableData.length} LGAs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbiaLGASummaryDrawer;