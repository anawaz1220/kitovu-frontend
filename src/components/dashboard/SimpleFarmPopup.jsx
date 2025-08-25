import React, { useState, useEffect } from 'react';
import { Popup } from 'react-leaflet';
import { Loader2, MapPin, Ruler, Sprout, User, DollarSign } from 'lucide-react';
import farmService from '../../services/api/farms.service';

/**
 * Simple farm popup that definitely works - for testing
 */
const SimpleFarmPopup = ({ farm, onAdvisoryClick }) => {
  const [farmData, setFarmData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data when popup component mounts
  useEffect(() => {
    const loadFarmData = async () => {
      const farmId = farm?.farm_id || farm?.id;
      
      if (!farmId) {
        setError('No farm ID found');
        return;
      }

      setIsLoading(true);
      try {
        console.log(`SimpleFarmPopup: Loading farm ${farmId}`);
        const data = await farmService.getFarmById(farmId);
        console.log('SimpleFarmPopup: Data loaded:', data);
        setFarmData(data);
      } catch (err) {
        console.error('SimpleFarmPopup: Error:', err);
        setError('Failed to load farm data');
      } finally {
        setIsLoading(false);
      }
    };

    loadFarmData();
  }, [farm?.farm_id, farm?.id]);

  if (isLoading) {
    return (
      <Popup>
        <div style={{ padding: '15px', textAlign: 'center' }}>
          <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
          <p>Loading farm details...</p>
        </div>
      </Popup>
    );
  }

  if (error) {
    return (
      <Popup>
        <div style={{ padding: '15px', color: 'red' }}>
          <p>Error: {error}</p>
          <p>Farm ID: {farm?.farm_id || farm?.id}</p>
        </div>
      </Popup>
    );
  }

  const data = farmData || {};

  return (
    <Popup>
      <div style={{ 
        fontFamily: 'system-ui, sans-serif',
        minWidth: '250px',
        maxWidth: '300px'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '12px',
          marginBottom: '12px',
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Sprout style={{ width: '18px', height: '18px', marginRight: '8px' }} />
            <div>
              <h3 style={{ margin: '0', fontSize: '16px' }}>Farm Details</h3>
              <p style={{ margin: '0', fontSize: '12px', opacity: '0.9' }}>
                ID: {data.id || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Farm Information */}
        <div style={{ fontSize: '14px' }}>
          {/* Area */}
          {data.calculated_area && (
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <Ruler style={{ width: '14px', height: '14px', marginRight: '8px', color: '#6b7280' }} />
              <span style={{ color: '#6b7280' }}>Area:</span>
              <span style={{ marginLeft: '4px', fontWeight: '500' }}>{data.calculated_area} acres</span>
            </div>
          )}

          {/* Farm Type */}
          {data.farm_type && (
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <MapPin style={{ width: '14px', height: '14px', marginRight: '8px', color: '#6b7280' }} />
              <span style={{ color: '#6b7280' }}>Type:</span>
              <span style={{ marginLeft: '4px', fontWeight: '500', textTransform: 'capitalize' }}>
                {data.farm_type.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Crop Type */}
          {data.crop_type && (
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <Sprout style={{ width: '14px', height: '14px', marginRight: '8px', color: '#10b981' }} />
              <span style={{ color: '#6b7280' }}>Crop:</span>
              <span style={{ marginLeft: '4px', fontWeight: '500', textTransform: 'capitalize' }}>
                {data.crop_type}
              </span>
            </div>
          )}

          {/* Livestock Type */}
          {data.livestock_type && (
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <User style={{ width: '14px', height: '14px', marginRight: '8px', color: '#f59e0b' }} />
              <span style={{ color: '#6b7280' }}>Livestock:</span>
              <span style={{ marginLeft: '4px', fontWeight: '500', textTransform: 'capitalize' }}>
                {data.livestock_type}
              </span>
            </div>
          )}

          {/* Ownership */}
          {data.ownership_status && (
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Ownership:</span>
              <span style={{ marginLeft: '4px', fontWeight: '500', textTransform: 'capitalize' }}>
                {data.ownership_status.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Yields */}
          {(data.crop_yield || data.livestock_yield) && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Yields:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {data.crop_yield && (
                  <div style={{ background: '#f0fdf4', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#166534' }}>Crop</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#15803d' }}>
                      {data.crop_yield}
                    </div>
                  </div>
                )}
                {data.livestock_yield && (
                  <div style={{ background: '#fffbeb', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#92400e' }}>Livestock</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d97706' }}>
                      {data.livestock_yield}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distance */}
          {data.distance_to_farm_km && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
              Distance: {data.distance_to_farm_km} km
            </div>
          )}
        </div>

        {/* Advisory Button */}
        {onAdvisoryClick && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => onAdvisoryClick(data)}
              style={{
                width: '100%',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.background = '#6d28d9'}
              onMouseOut={(e) => e.target.style.background = '#7c3aed'}
            >
              Provide Advisory
            </button>
          </div>
        )}
      </div>
    </Popup>
  );
};

export default SimpleFarmPopup;