// src/utils/leafletSetup.js
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// Basic measurement utility functions - these replace the defaults in Leaflet
// and ensure our measurements work correctly
const setupLeafletMeasurements = () => {
  // Ensure GeometryUtil exists
  if (!L.GeometryUtil) {
    L.GeometryUtil = {};
  }

  // Geodesic area calculation
  L.GeometryUtil.geodesicArea = function(latLngs) {
    let pointsCount = 0,
        area = 0,
        d2r = Math.PI / 180,
        p1, p2;

    if (latLngs && latLngs.length > 2) {
      pointsCount = latLngs.length;
      
      for (let i = 0; i < pointsCount; i++) {
        p1 = latLngs[i];
        p2 = latLngs[(i + 1) % pointsCount];
        
        if (p1 && p2 && typeof p1.lat === 'number' && typeof p1.lng === 'number' &&
            typeof p2.lat === 'number' && typeof p2.lng === 'number') {
          area += ((p2.lng - p1.lng) * d2r) *
                (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
        }
      }
      
      area = Math.abs(area * 6378137.0 * 6378137.0 / 2.0);
    }

    return area;
  };

  // This is the key function that's causing the issue - needs to handle all cases
  L.GeometryUtil.readableArea = function(area, isMetric, precision) {
    // Ensure parameters have default values to prevent 'type is not defined' errors
    isMetric = (isMetric === undefined) ? true : isMetric;
    precision = (precision === undefined) ? 2 : precision;
    
    let areaStr;
    
    if (isMetric) {
      if (area >= 10000) {
        areaStr = (area * 0.0001).toFixed(precision) + ' ha';
      } else {
        areaStr = area.toFixed(precision) + ' m²';
      }
    } else {
      area *= 0.09290304; // Convert to square feet
      if (area >= 4046.86) {
        areaStr = (area * 0.000247105).toFixed(precision) + ' acres'; // Convert to acres
      } else {
        areaStr = area.toFixed(precision) + ' ft²';
      }
    }
    
    return areaStr;
  };

  // Also ensure readableDistance is defined correctly - this is used for line measurements
  L.GeometryUtil.readableDistance = function(distance, isMetric, precision) {
    // Set default values
    isMetric = (isMetric === undefined) ? true : isMetric;
    precision = (precision === undefined) ? 2 : precision;
    
    let distanceStr;
    
    if (isMetric) {
      // Show meters for distances < 1km
      if (distance < 1000) {
        distanceStr = distance.toFixed(precision) + ' m';
      } else {
        distanceStr = (distance / 1000).toFixed(precision) + ' km';
      }
    } else {
      // Show feet for distances < 1 mile (5280 feet)
      distance *= 3.28084; // Convert to feet
      if (distance < 5280) {
        distanceStr = distance.toFixed(precision) + ' ft';
      } else {
        distanceStr = (distance / 5280).toFixed(precision) + ' mi';
      }
    }
    
    return distanceStr;
  };
};

// Call the setup function
setupLeafletMeasurements();

// Direct patch for Leaflet.Draw - this is an additional safety measure
// to ensure our changes apply to the bundled code
if (L.Draw && L.Draw.Polyline && L.Draw.Polyline.prototype) {
  // Patch the _getMeasurementString method which is likely where the error occurs
  const originalGetMeasurementString = L.Draw.Polyline.prototype._getMeasurementString;
  
  L.Draw.Polyline.prototype._getMeasurementString = function() {
    try {
      return originalGetMeasurementString.call(this);
    } catch (e) {
      // Fallback implementation if original throws an error
      if (this._measurementRunningTotal) {
        return L.GeometryUtil.readableDistance(this._measurementRunningTotal, true);
      }
      return '0 m';
    }
  };
}

if (L.Draw && L.Draw.Polygon && L.Draw.Polygon.prototype) {
  // Similarly patch the polygon measurement method
  const originalGetMeasurementString = L.Draw.Polygon.prototype._getMeasurementString;
  
  L.Draw.Polygon.prototype._getMeasurementString = function() {
    try {
      return originalGetMeasurementString.call(this);
    } catch (e) {
      // Fallback implementation if original throws an error
      if (this._area) {
        return L.GeometryUtil.readableArea(this._area, true);
      }
      return '0 m²';
    }
  };
}

export default L;