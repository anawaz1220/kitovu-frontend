// src/pages/AdvisoryReport.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAdvisoryData } from '../hooks/useAdvisoryData';
import FertilizerSection from '../components/advisory/ReportSections/FertilizerSection';
import CropHealthSection from '../components/advisory/ReportSections/CropHealthSection';
import WaterStressSection from '../components/advisory/ReportSections/WaterStressSection';
import HerbicideSection from '../components/advisory/ReportSections/HerbicideSection';
import ExportToPDF from '../components/advisory/ExportToPDF';

/**
 * Advisory Report Page Component
 * Displays comprehensive agricultural advisory data for a specific farm
 */
const AdvisoryReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, data, error, fetchAdvisoryData, getDataStatus } = useAdvisoryData();
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Extract farm and parameters from navigation state
  const { farm, herbicideParams, timestamp } = location.state || {};

  // Redirect if no farm data
  useEffect(() => {
    if (!farm) {
      navigate('/', { replace: true });
      return;
    }

    // Fetch advisory data on component mount
    fetchAdvisoryData(farm.id, herbicideParams);
  }, [farm, herbicideParams, fetchAdvisoryData, navigate]);

  // Handle refresh data
  const handleRefresh = () => {
    if (farm) {
      fetchAdvisoryData(farm.id, herbicideParams);
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate('/', { replace: true });
  };

  // Get data status for display
  const dataStatus = getDataStatus();

  // Loading state
  if (loading) {
    return (
      <Layout hideFooter={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-kitovu-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Generating Advisory Report</h2>
            <p className="text-gray-600">Analyzing farm data and generating personalized recommendations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state (no data at all)
  if (error && !data) {
    return (
      <Layout hideFooter={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Generate Report</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-kitovu-purple text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Left side - Back button and title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center text-gray-600 hover:text-kitovu-purple transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back to Dashboard
                </button>
                <div className="h-6 border-l border-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Advisory Report</h1>
                  <p className="text-sm text-gray-600">
                    Farm #{farm.farm_id} • {farm.crop_type || farm.livestock_type || 'Mixed farming'} • 
                    Generated {new Date(timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-3">
                {/* Status indicator */}
                <div className="flex items-center text-sm">
                  {dataStatus.hasCompleteData ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete Data
                    </div>
                  ) : dataStatus.hasPartialData ? (
                    <div className="flex items-center text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Partial Data ({dataStatus.successCount}/{dataStatus.totalCount})
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      No Data Available
                    </div>
                  )}
                </div>

                {/* Refresh button */}
                <button
                  onClick={handleRefresh}
                  className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                {/* Export button */}
                <button
                  onClick={() => setShowExportOptions(true)}
                  className="flex items-center px-4 py-2 bg-kitovu-purple text-white rounded-md hover:bg-purple-700 transition-colors"
                  disabled={!data}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Farm Information Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Farm Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Farm ID</p>
                <p className="font-medium">#{farm.farm_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Farm Type</p>
                <p className="font-medium capitalize">{farm.farm_type?.replace(/_/g, ' ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-medium">{farm.calculated_area || 'Not calculated'} acres</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {farm.farm_type === 'crop_farming' ? 'Crop Type' : 
                   farm.farm_type === 'livestock_farming' ? 'Livestock Type' : 'Primary Type'}
                </p>
                <p className="font-medium capitalize">
                  {farm.crop_type || farm.livestock_type || 'Mixed'}
                </p>
              </div>
            </div>
          </div>

          {/* Advisory Sections */}
          <div className="space-y-6">
            {/* Fertilizer Recommendations */}
            <FertilizerSection 
              data={data?.fertilizer}
              farmInfo={farm}
            />

            {/* Crop Health Analysis */}
            <CropHealthSection 
              data={data?.cropHealth}
              farmInfo={farm}
            />

            {/* Water Stress Analysis */}
            <WaterStressSection 
              data={data?.waterStress}
              farmInfo={farm}
            />

            {/* Herbicide & Pesticide Recommendations */}
            <HerbicideSection 
              data={data?.herbicide}
              farmInfo={farm}
              inputParams={herbicideParams}
            />
          </div>
        </div>

        {/* Export PDF Component */}
        <ExportToPDF
          isOpen={showExportOptions}
          onClose={() => setShowExportOptions(false)}
          farm={farm}
          advisoryData={data}
          timestamp={timestamp}
        />
      </div>
    </Layout>
  );
};

export default AdvisoryReport;