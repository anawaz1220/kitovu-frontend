// src/components/advisory/ReportSections/FertilizerSection.jsx
import React from 'react';
import { Sprout, AlertCircle, TrendingUp, Package, Calendar, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Fertilizer Recommendations Section Component
 * @param {Object} props - Component props
 * @param {Object} props.data - Fertilizer data from API
 * @param {Object} props.farmInfo - Farm information
 */
const FertilizerSection = ({ data, farmInfo }) => {
  // Handle error or no data
  if (!data || !data.success) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Sprout className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Fertilizer Recommendations</h2>
        </div>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{data?.error || 'Unable to load fertilizer recommendations'}</span>
        </div>
      </div>
    );
  }

  const fertilizer = data.data;

  // Prepare data for charts
  const compositionData = fertilizer.recommendations?.composition?.map(item => ({
    name: item.type,
    quantity: parseFloat(item.quantity),
    unit: item.unit
  })) || [];

  const scheduleData = fertilizer.recommendations?.application_schedule?.map(item => ({
    stage: item.stage,
    quantity: parseFloat(item.quantity),
    percentage: item.percentage
  })) || [];

  // Soil analysis data for chart
  const soilData = fertilizer.soil_analysis ? Object.entries(fertilizer.soil_analysis).map(([key, value]) => ({
    nutrient: value.name || key,
    value: parseFloat(value.value) || 0,
    status: value.status,
    unit: value.unit
  })) : [];

  // Colors for charts
  const COLORS = ['#8b5cf6', '#06d6a0', '#ffd60a', '#f72585'];

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'low': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-green-600 bg-green-50';
      case 'excellent': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Sprout className="h-6 w-6 text-green-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Fertilizer Recommendations</h2>
          <p className="text-sm text-gray-600">Personalized fertilizer guidance based on soil analysis and vegetation health</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-xl font-bold text-gray-800">
                {fertilizer.recommendations?.total_fertilizer_quantity || 0} {fertilizer.recommendations?.unit || 'kg'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Farm Size</p>
              <p className="text-xl font-bold text-gray-800">
                {fertilizer.farm_size_hectares || farmInfo.calculated_area || 0} 
                {fertilizer.farm_size_hectares ? ' ha' : ' acres'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <Sprout className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Crop Type</p>
              <p className="text-xl font-bold text-gray-800 capitalize">
                {fertilizer.crop || farmInfo.crop_type || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-amber-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg NDVI</p>
              <p className="text-xl font-bold text-gray-800">
                {fertilizer.vegetation_analysis?.average_ndvi?.toFixed(2) || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Soil Analysis */}
      {fertilizer.soil_analysis && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Soil Analysis Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Soil status cards */}
            <div className="space-y-3">
              {Object.entries(fertilizer.soil_analysis).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 capitalize">{value.name || key.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-600">{value.value} {value.unit}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value.status)}`}>
                    {value.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Soil chart */}
            {soilData.length > 0 && (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={soilData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nutrient" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip 
                      formatter={(value, name) => [`${value} mg/kg`, 'Value']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fertilizer Composition */}
      {compositionData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Composition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Composition chart */}
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, quantity}) => `${name}: ${quantity}kg`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantity"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} kg`, 'Quantity']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Composition details */}
            <div className="space-y-3">
              {fertilizer.recommendations.composition.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{item.type}</h4>
                    <span className="text-lg font-bold text-kitovu-purple">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  {item.adjustment_reason && (
                    <p className="text-sm text-gray-600">{item.adjustment_reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Application Schedule */}
      {scheduleData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schedule chart */}
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scheduleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'quantity' ? `${value} kg` : `${value}%`, 
                      name === 'quantity' ? 'Quantity' : 'Percentage'
                    ]}
                  />
                  <Bar dataKey="quantity" fill="#06d6a0" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Schedule timeline */}
            <div className="space-y-3">
              {fertilizer.recommendations.application_schedule.map((stage, index) => (
                <div key={index} className="flex items-center p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{stage.stage}</p>
                    <p className="text-sm text-gray-600">
                      {stage.quantity} {stage.unit} ({stage.percentage}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Commercial Products */}
      {fertilizer.commercial_products && fertilizer.commercial_products.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Commercial Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fertilizer.commercial_products.map((product, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} {product.unit}</p>
                  </div>
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vegetation Health Insights */}
      {fertilizer.vegetation_insights && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vegetation Health Insights</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Stressed Areas:</strong> {fertilizer.vegetation_insights.stressed_areas_percentage}% of farm area
                </p>
                {fertilizer.vegetation_insights.zone_specific_recommendations && (
                  <div className="space-y-2">
                    {fertilizer.vegetation_insights.zone_specific_recommendations.map((zone, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">Zone {zone.zone_id} ({zone.health_status}):</span>
                        <span className="text-gray-600 ml-1">{zone.recommendation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commentary */}
      {fertilizer.commentary && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Expert Commentary</p>
              <p className="text-sm text-green-700">{fertilizer.commentary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerSection;