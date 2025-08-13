// src/components/advisory/ExportToPDF.jsx
import React, { useState } from 'react';
import { X, Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export to PDF Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {Object} props.farm - Farm information
 * @param {Object} props.advisoryData - Advisory data to export
 * @param {string} props.timestamp - Generation timestamp
 */
const ExportToPDF = ({ isOpen, onClose, farm, advisoryData, timestamp }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [includeCharts, setIncludeCharts] = useState(true);

  if (!isOpen) return null;

  // Generate PDF from current page
  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Get the content to export (the entire advisory report page)
      const element = document.querySelector('.advisory-report-content') || document.body;
      
      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 15000,
        height: element.scrollHeight,
        width: element.scrollWidth
      });

      // Calculate dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // Start position

      // Add header information
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Agricultural Advisory Report', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Farm #${farm.farm_id} • Generated: ${new Date(timestamp).toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });
      
      position = 30;

      // Add the main content image
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - position);

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const filename = `Advisory_Report_Farm_${farm.farm_id}_${new Date(timestamp).toISOString().split('T')[0]}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate a simple text-based PDF (alternative method)
  const exportSimplePDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;
      const lineHeight = 7;
      const margin = 15;

      // Helper function to add text with word wrapping
      const addText = (text, x, y, maxWidth, fontSize = 10, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, isBold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * lineHeight);
      };

      // Header
      yPosition = addText('Agricultural Advisory Report', pageWidth / 2, yPosition, pageWidth - 30, 18, true);
      pdf.text('', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition = addText(`Farm #${farm.farm_id}`, margin, yPosition + 5, pageWidth - 30, 12, true);
      yPosition = addText(`Generated: ${new Date(timestamp).toLocaleString()}`, margin, yPosition + 2, pageWidth - 30, 10);
      yPosition += 10;

      // Farm Information
      yPosition = addText('Farm Information', margin, yPosition, pageWidth - 30, 14, true);
      yPosition = addText(`Farm Type: ${farm.farm_type?.replace(/_/g, ' ') || 'N/A'}`, margin + 5, yPosition + 5, pageWidth - 35);
      yPosition = addText(`Area: ${farm.calculated_area || 'Not calculated'} acres`, margin + 5, yPosition, pageWidth - 35);
      yPosition = addText(`Crop/Livestock: ${farm.crop_type || farm.livestock_type || 'Mixed'}`, margin + 5, yPosition, pageWidth - 35);
      yPosition += 10;

      // Add advisory data summaries
      if (advisoryData) {
        // Fertilizer Section
        if (advisoryData.fertilizer?.success) {
          yPosition = addText('Fertilizer Recommendations', margin, yPosition, pageWidth - 30, 14, true);
          const fert = advisoryData.fertilizer.data;
          if (fert.recommendations?.total_fertilizer_quantity) {
            yPosition = addText(`Total Quantity: ${fert.recommendations.total_fertilizer_quantity} ${fert.recommendations.unit}`, margin + 5, yPosition + 5, pageWidth - 35);
          }
          if (fert.commentary) {
            yPosition = addText(`Expert Commentary: ${fert.commentary}`, margin + 5, yPosition, pageWidth - 35);
          }
          yPosition += 10;
        }

        // Crop Health Section
        if (advisoryData.cropHealth?.success) {
          yPosition = addText('Crop Health Analysis', margin, yPosition, pageWidth - 30, 14, true);
          const health = advisoryData.cropHealth.data;
          yPosition = addText(`Health Index: ${health.overall_health_index || 'N/A'}`, margin + 5, yPosition + 5, pageWidth - 35);
          yPosition = addText(`Status: ${health.status || 'Unknown'}`, margin + 5, yPosition, pageWidth - 35);
          if (health.ndvi_analysis?.average_ndvi) {
            yPosition = addText(`Average NDVI: ${health.ndvi_analysis.average_ndvi.toFixed(3)}`, margin + 5, yPosition, pageWidth - 35);
          }
          yPosition += 10;
        }

        // Water Stress Section
        if (advisoryData.waterStress?.success) {
          yPosition = addText('Water Stress Analysis', margin, yPosition, pageWidth - 30, 14, true);
          const water = advisoryData.waterStress.data;
          yPosition = addText(`Stress Level: ${water.overall_stress_level || 'Unknown'}`, margin + 5, yPosition + 5, pageWidth - 35);
          if (water.ndwi_analysis?.average_ndwi) {
            yPosition = addText(`Average NDWI: ${water.ndwi_analysis.average_ndwi.toFixed(3)}`, margin + 5, yPosition, pageWidth - 35);
          }
          yPosition += 10;
        }

        // Herbicide Section
        if (advisoryData.herbicide?.success) {
          yPosition = addText('Herbicide & Pesticide Recommendations', margin, yPosition, pageWidth - 30, 14, true);
          const herb = advisoryData.herbicide.data;
          yPosition = addText(`Growth Stage: ${herb.growth_stage || 'N/A'}`, margin + 5, yPosition + 5, pageWidth - 35);
          if (herb.recommendations?.herbicides?.length > 0) {
            yPosition = addText(`Recommended Herbicides: ${herb.recommendations.herbicides.length}`, margin + 5, yPosition, pageWidth - 35);
          }
          yPosition += 10;
        }
      }

      // Footer
      const currentDate = new Date().toLocaleString();
      pdf.setFontSize(8);
      pdf.text(`Generated by TrakOS Agricultural Advisory System - ${currentDate}`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });

      // Save PDF
      const filename = `Advisory_Report_Farm_${farm.farm_id}_${new Date(timestamp).toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      onClose();
      
    } catch (error) {
      console.error('Error generating simple PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-kitovu-purple text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-bold">Export Advisory Report</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200"
              disabled={isExporting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Orientation
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    orientation === 'portrait' 
                      ? 'border-kitovu-purple bg-purple-50 text-kitovu-purple' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isExporting}
                >
                  <FileText className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">Portrait</span>
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    orientation === 'landscape' 
                      ? 'border-kitovu-purple bg-purple-50 text-kitovu-purple' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isExporting}
                >
                  <FileText className="h-6 w-6 mx-auto mb-1 transform rotate-90" />
                  <span className="text-sm font-medium">Landscape</span>
                </button>
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="h-4 w-4 text-kitovu-purple focus:ring-kitovu-purple border-gray-300 rounded"
                    disabled={isExporting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Include charts and graphs</span>
                </label>
              </div>
            </div>

            {/* Export Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Export Information:</p>
                <p>• Farm: #{farm.farm_id}</p>
                <p>• Format: PDF (A4)</p>
                <p>• Generated: {new Date(timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={includeCharts ? exportToPDF : exportSimplePDF}
              className="px-6 py-2 bg-kitovu-purple text-white rounded-md hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportToPDF;