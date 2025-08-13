// src/components/advisory/ReportSections/CropHealthSection.jsx
import React from 'react';
import { Leaf, AlertCircle, TrendingUp, Eye, Activity, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

/**
 * Crop Health Analysis Section Component
 * @param {Object} props - Component props
 * @param {Object} props.data - Crop health data from API
 * @param {Object} props.farmInfo - Farm information
 */
const CropHealthSection = ({ data, farmInfo }) => {
  // Handle error or no data
  if (!data || !data.success) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Leaf className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Crop Health Analysis</h2>
        </div>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{data?.error || 'Unable to load crop health analysis'}</span>
        </div>
      </div>
    );
  }

  const health = data.data;

  // Prepare data for NDVI zones chart
  const zonesData = health.ndvi_analysis?.zones?.map(zone => ({
    zone: `Zone ${zone.zone_id}`,
    percentage: parseFloat(zone.area_percentage),
    status: zone.status,
    area: parseFloat(zone.area_hectares),
    ndvi_range: zone.ndvi_range
  })) || [];

  // Colors for different health statuses
  const statusColors = {
    'Excellent': '#22c55e',
    'Good': '#84cc16',
    'Fair': '#eab308',
    'Poor': '#f97316',
    'Very Poor': '#ef4444'
  };

  // Get health index color
  const getHealthIndexColor = (index) => {
    if (index >= 80) return 'text-green-600 bg-green-50';
    if (index >= 60) return 'text-yellow-600 bg-yellow-50';
    if (index >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'very poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Leaf className="h-6 w-6 text-green-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Crop Health Analysis</h2>
          <p className="text-sm text-gray-600">NDVI-based vegetation vitality assessment</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${getHealthIndexColor(health.overall_health_index)}`}>
          <div className="flex items-center">
            <Activity className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium">Health Index</p>
              <p className="text-2xl font-bold">{health.overall_health_index || 0}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${getStatusColor(health.status)}`}>
          <div className="flex items-center">
            <Eye className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium">Overall Status</p>
              <p className="text-xl font-bold">{health.status || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Average NDVI</p>
              <p className="text-2xl font-bold text-gray-800">
                {health.ndvi_analysis?.average_ndvi?.toFixed(3) || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Growth Stage</p>
              <p className="text-xl font-bold text-gray-800 capitalize">
                {health.growth_stage || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NDVI Range Information */}
      {health.ndvi_analysis && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">NDVI Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Minimum NDVI</p>
              <p className="text-xl font-bold text-red-600">{health.ndvi_analysis.min_ndvi?.toFixed(3) || 'N/A'}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Average NDVI</p>
              <p className="text-xl font-bold text-yellow-600">{health.ndvi_analysis.average_ndvi?.toFixed(3) || 'N/A'}</p>
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Maximum NDVI</p>
              <p className="text-xl font-bold text-green-600">{health.ndvi_analysis.max_ndvi?.toFixed(3) || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Health Zones */}
      {zonesData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Zones Distribution</h3>
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
                      <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Area Coverage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Zones breakdown */}
            <div className="space-y-3">
              {health.ndvi_analysis.zones.map((zone, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStatusColor(zone.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Zone {zone.zone_id}</h4>
                    <span className="text-sm font-medium">{zone.status}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Area:</strong> {zone.area_hectares} ha ({zone.area_percentage}%)</p>
                    <p><strong>NDVI Range:</strong> {zone.ndvi_range}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Area Distribution Chart */}
      {zonesData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Area Distribution by Health Status</h3>
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
              <Bar dataKey="percentage" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Alerts */}
      {health.alerts && health.alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Alerts</h3>
          <div className="space-y-3">
            {health.alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'high' ? 'bg-red-50 border-red-400' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start">
                  <AlertCircle className={`h-5 w-5 mr-2 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{alert.type} Alert</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    {alert.affected_area_percentage && (
                      <p className="text-xs text-gray-500 mt-1">
                        Affected area: {alert.affected_area_percentage}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {health.recommendations && health.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {health.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start text-sm text-blue-700">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysis Date */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Analysis Date: {new Date(health.analysis_date).toLocaleDateString()} at {new Date(health.analysis_date).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default CropHealthSection;