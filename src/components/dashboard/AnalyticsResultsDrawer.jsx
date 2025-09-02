import React, { useState } from 'react';
import { X, Users, LandPlot, MapPin, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * AnalyticsResultsDrawer - Displays filter results and analytics data
 */
const AnalyticsResultsDrawer = ({ 
  isOpen, 
  onClose, 
  results,
  showFarmersChecked = true,
  showFarmsChecked = false,
  onToggleShowFarmers,
  onToggleShowFarms 
}) => {
  const [expandedTable, setExpandedTable] = useState(null);

  if (!results) return null;

  const { summary, breakdowns } = results;
  
  // Map the API response structure correctly
  const mappedBreakdowns = {
    state: breakdowns?.by_state || [],
    lga: breakdowns?.by_lga || [],
    community: breakdowns?.by_community || []
  };

  // Summary cards data
  const summaryCards = [
    {
      id: 'farmers',
      title: 'Total Farmers',
      value: summary?.total_farmers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      checked: showFarmersChecked,
      onToggle: onToggleShowFarmers
    },
    {
      id: 'farms',
      title: 'Total Farms',
      value: summary?.total_farms || 0,
      icon: LandPlot,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      checked: showFarmsChecked,
      onToggle: onToggleShowFarms
    },
    {
      id: 'states',
      title: 'Total States',
      value: summary?.total_states || 1,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => handleTableToggle('state')
    },
    {
      id: 'lgas',
      title: 'Total LGAs',
      value: mappedBreakdowns?.lga?.length || 0,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => handleTableToggle('lga')
    },
    {
      id: 'communities',
      title: 'Total Communities',
      value: mappedBreakdowns?.community?.length || 0,
      icon: MapPin,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => handleTableToggle('community')
    }
  ];

  const handleTableToggle = (tableType) => {
    setExpandedTable(expandedTable === tableType ? null : tableType);
  };

  const renderExpandedTable = (type, data) => {
    if (!data || data.length === 0) return null;
    
    return (
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-gray-900">
                  {type === 'state' ? 'State' : type === 'lga' ? 'LGA' : 'Community'}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-900">Farmers</th>
                <th className="px-3 py-2 text-left font-medium text-gray-900">Farms</th>
                {results.unique_crops && results.unique_crops.map(crop => (
                  <th key={crop} className="px-3 py-2 text-left font-medium text-gray-900 capitalize">{crop}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => console.log('Clicked on:', row)}
                >
                  <td className="px-3 py-2 text-gray-900">{row.name}</td>
                  <td className="px-3 py-2 text-gray-600">{row.farmers_count || 0}</td>
                  <td className="px-3 py-2 text-gray-600">{row.farms_count || 0}</td>
                  {results.unique_crops && results.unique_crops.map(crop => (
                    <td key={crop} className="px-3 py-2 text-gray-600 text-center">
                      {row.crops && row.crops[crop] ? row.crops[crop] : 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBreakdownTable = (title, data, type) => {
    if (!data || data.length === 0) return null;

    const isExpanded = expandedTable === type;

    return (
      <div className="mb-4">
        <button
          onClick={() => handleTableToggle(type)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-900">
                    {type === 'state' ? 'State' : type === 'lga' ? 'LGA' : 'Community'}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Farmers</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Farms</th>
                  {/* Dynamic crop columns */}
                  {results.unique_crops && results.unique_crops.map(crop => (
                    <th key={crop} className="px-3 py-2 text-left font-medium text-gray-900 capitalize">{crop}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      // TODO: Implement zoom to area and filter
                      console.log('Clicked on:', row);
                    }}
                  >
                    <td className="px-3 py-2 text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{row.farmers_count || 0}</td>
                    <td className="px-3 py-2 text-gray-600">{row.farms_count || 0}</td>
                    {/* Dynamic crop columns */}
                    {results.unique_crops && results.unique_crops.map(crop => (
                      <td key={crop} className="px-3 py-2 text-gray-600 text-center">
                        {row.crops && row.crops[crop] ? row.crops[crop] : 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`bg-white w-96 shadow-lg h-full border-l transition-all duration-300 overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-20`}
      style={{ position: 'absolute', top: 0, bottom: 0, right: 0 }}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-kitovu-purple">Analytics Results</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>



      {/* Summary Cards */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
        {/* Farmers and Farms Cards in a row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {summaryCards.slice(0, 2).map((card) => {
            const IconComponent = card.icon;
            return (
              <div 
                key={card.id}
                className={`p-3 rounded-lg ${card.bgColor} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${card.color}`} />
                    <div>
                      <p className="text-xs font-medium text-gray-900">{card.title}</p>
                      <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {/* <input
                          type="checkbox"
                          checked={card.checked}
                          onChange={(e) => {
                            console.log(`Checkbox ${card.title} changed to:`, e.target.checked);
                            e.stopPropagation();
                            if (card.onToggle) {
                              console.log(`Calling onToggle for ${card.title}`);
                              card.onToggle();
                            } else {
                              console.log(`No onToggle handler for ${card.title}`);
                            }
                          }}
                          className="h-3 w-3 text-kitovu-purple focus:ring-kitovu-purple border-gray-300 rounded"
                        /> */}
                        {/* <p className="text-xs text-gray-500">Show on map</p> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* State, LGA, Community Cards - Each in its own row with expandable tables */}
        <div className="space-y-2">
          {summaryCards.slice(2).map((card) => {
            const IconComponent = card.icon;
            const isExpanded = expandedTable === (card.id === 'states' ? 'state' : card.id === 'lgas' ? 'lga' : 'community');
            return (
              <div key={card.id} className="space-y-2">
                <div 
                  className={`p-3 rounded-lg ${card.bgColor} cursor-pointer hover:shadow-md transition-all duration-300`}
                  onClick={card.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`h-4 w-4 ${card.color}`} />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{card.title}</p>
                        <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-all duration-300 ${
                        isExpanded 
                          ? 'rotate-180 text-kitovu-purple animate-pulse' 
                          : 'text-gray-400 hover:text-kitovu-purple hover:animate-bounce'
                      }`} 
                    />
                  </div>
                </div>
                
                {/* Expandable table directly under each card */}
                {isExpanded && renderExpandedTable(
                  card.id === 'states' ? 'state' : card.id === 'lgas' ? 'lga' : 'community',
                  mappedBreakdowns[card.id === 'states' ? 'state' : card.id === 'lgas' ? 'lga' : 'community']
                )}
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
};

export default AnalyticsResultsDrawer;