// src/components/advisory/ReportSections/WaterStressSection.jsx
import React from 'react';
import { Droplets, AlertCircle, Cloud, ThermometerSun, Sprout, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

/**
 * Water Stress Analysis Section Component
 * @param {Object} props - Component props
 * @param {Object} props.data - Water stress data from API
 * @param {Object} props.farmInfo - Farm information
 */
const WaterStressSection = ({ data, farmInfo }) => {
  // Handle error or no data
  if (!data || !data.success) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Droplets className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Water Stress Analysis</h2>
        </div>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{data?.error || 'Unable to load water stress analysis'}</span>
        </div>
      </div>
    );
  }

  const waterStress = data.data;

  // Prepare data for NDWI zones chart
  const zonesData = waterStress.ndwi_analysis?.zones?.map(zone => ({
    zone: `Zone ${zone.zone_id}`,
    percentage: parseFloat(zone.area_percentage),
    status: zone.status,
    area: parseFloat(zone.area_hectares),
    ndwi_range: zone.ndwi_range
  })) || [];

  // Colors for different stress levels
  const stressColors = {
    'Low Stress': '#22c55e',
    'Moderate Stress': '#eab308',
    'High Stress': '#ef4444',
    'Very High Stress': '#7c2d12'
  };

  // Get stress level color
  const getStressLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'very high': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get zone stress color
  const getZoneStressColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'low stress': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate stress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high stress': return 'text-red-600 bg-red-50 border-red-200';
      case 'very high stress': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Droplets className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Water Stress Analysis</h2>
          <p className="text-sm text-gray-600">NDWI-based water stress assessment and irrigation recommendations</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${getStressLevelColor(waterStress.overall_stress_level)}`}>
          <div className="flex items-center">
            <ThermometerSun className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium">Stress Level</p>
              <p className="text-xl font-bold">{waterStress.overall_stress_level || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Average NDWI</p>
              <p className="text-2xl font-bold text-gray-800">
                {waterStress.ndwi_analysis?.average_ndwi?.toFixed(3) || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <Sprout className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Farm Size</p>
              <p className="text-xl font-bold text-gray-800">
                {waterStress.farm_size_hectares || waterStress.farm_size_acres || 'N/A'} 
                {waterStress.farm_size_hectares ? ' ha' : ' acres'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center">
            <Sprout className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Crop Type</p>
              <p className="text-xl font-bold text-gray-800 capitalize">
                {waterStress.crop || farmInfo.crop_type || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Information */}
      {waterStress.weather_data && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center">
                <Cloud className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Recent Rainfall (7 days)</p>
                  <p className="text-xl font-bold text-gray-800">
                    {waterStress.weather_data.recent_rainfall?.last_7_days || 0} 
                    {waterStress.weather_data.recent_rainfall?.unit || 'mm'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              waterStress.weather_data.rainfall_anomaly < 0 ? 
              'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center">
                <ThermometerSun className={`h-6 w-6 mr-3 ${
                  waterStress.weather_data.rainfall_anomaly < 0 ? 'text-red-600' : 'text-green-600'
                }`} />
                <div>
                  <p className="text-sm text-gray-600">Rainfall Anomaly</p>
                  <p className={`text-xl font-bold ${
                    waterStress.weather_data.rainfall_anomaly < 0 ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {waterStress.weather_data.rainfall_anomaly > 0 ? '+' : ''}
                    {waterStress.weather_data.rainfall_anomaly || 0} 
                    {waterStress.weather_data.unit || 'mm'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Analysis Date</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(waterStress.analysis_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NDWI Zones */}
      {zonesData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Stress Zones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zones chart */}
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={zonesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({zone, percentage}) => `${zone}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {zonesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={stressColors[entry.status] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Area Coverage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Zones breakdown */}
            <div className="space-y-3">
              {waterStress.ndwi_analysis.zones.map((zone, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getZoneStressColor(zone.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Zone {zone.zone_id}</h4>
                    <span className="text-sm font-medium">{zone.status}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Area:</strong> {zone.area_hectares} ha ({zone.area_percentage}%)</p>
                    <p><strong>NDWI Range:</strong> {zone.ndwi_range}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stress Distribution Chart */}
      {zonesData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stress Distribution by Zone</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={zonesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'percentage' ? `${value}%` : `${value} ha`, 
                  name === 'percentage' ? 'Coverage' : 'Area'
                ]}
              />
              <Bar 
                dataKey="percentage" 
                fill="#3b82f6"
                name="Area Percentage"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations */}
      {waterStress.recommendations && waterStress.recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Management Recommendations</h3>
          <div className="space-y-4">
            {waterStress.recommendations.map((recommendation, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Droplets className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-800">{recommendation.action}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(recommendation.urgency)}`}>
                    {recommendation.urgency} Priority
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{recommendation.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {recommendation.target_zones && (
                    <div>
                      <p className="font-medium text-gray-600">Target Zones:</p>
                      <p className="text-gray-800">
                        {Array.isArray(recommendation.target_zones) 
                          ? recommendation.target_zones.map(zone => `Zone ${zone}`).join(', ')
                          : recommendation.target_zones
                        }
                      </p>
                    </div>
                  )}
                  
                  {recommendation.water_quantity && (
                    <div>
                      <p className="font-medium text-gray-600">Water Quantity:</p>
                      <p className="text-gray-800 font-medium">
                        {recommendation.water_quantity} {recommendation.unit || 'mm'}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium text-gray-600">Action Type:</p>
                    <p className="text-gray-800 capitalize">{recommendation.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Droplets className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 mb-2">Water Stress Summary</p>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Overall stress level: <strong>{waterStress.overall_stress_level}</strong></p>
              <p>• Average NDWI: <strong>{waterStress.ndwi_analysis?.average_ndwi?.toFixed(3)}</strong></p>
              {waterStress.weather_data?.recent_rainfall && (
                <p>• Recent rainfall: <strong>{waterStress.weather_data.recent_rainfall.last_7_days} {waterStress.weather_data.recent_rainfall.unit}</strong></p>
              )}
              {waterStress.recommendations && (
                <p>• Total recommendations: <strong>{waterStress.recommendations.length}</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterStressSection;