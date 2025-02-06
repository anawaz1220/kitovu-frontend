import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FormInput from '../common/FormInput';
import SearchBox from '../map/SearchBox';
import nigeriaData from '../../utils/nigeriaData.json';

// Custom marker icon in TrackOS colors
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7A2F99" width="36" height="36">
      <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 7.94 8.5 15.5 8.5 15.5s8.5-7.56 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const MapController = ({ onLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true
    });

    map.on('locationfound', (e) => {
      onLocationFound(e.latlng);
    });

    map.on('locationerror', () => {
      map.setView([8.1574, 3.6147], 13); // Oyo center as fallback
    });
  }, [map, onLocationFound]);

  return null;
};

const LocationInfo = () => {
  const { register, setValue, watch } = useFormContext();
  const [position, setPosition] = useState([8.1574, 3.6147]); // Oyo center
  const [isLoading, setIsLoading] = useState(false);
  const selectedState = watch('state');

  const updateAddressFromCoordinates = async (lat, lng) => {
    setPosition([lat, lng]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      setValue('address', data.address?.road || data.address?.suburb || '');
      setValue('community', data.address?.suburb || data.address?.neighbourhood || '');
      setValue('city', data.address?.city || data.address?.town || '');
      
      const state = data.address?.state;
      if (state) {
        setValue('state', state);
        // Update LGA if state exists in our data
        if (nigeriaData[state]) {
          const possibleLGA = nigeriaData[state].find(lga => 
            data.address?.city_district?.includes(lga) || 
            data.address?.suburb?.includes(lga)
          );
          if (possibleLGA) {
            setValue('lga', possibleLGA);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    updateAddressFromCoordinates(lat, lng);
  };

  const handleMapClick = (latlng) => {
    updateAddressFromCoordinates(latlng.lat, latlng.lng);
  };

  const handleSearch = (newPosition, searchResult) => {
    setPosition(newPosition);
    if (searchResult.address) {
      setValue('address', searchResult.address.road || searchResult.address.suburb || '');
      setValue('community', searchResult.address.suburb || searchResult.address.neighbourhood || '');
      setValue('city', searchResult.address.city || searchResult.address.town || '');
      setValue('state', searchResult.address.state || '');
    }
  };

  useEffect(() => {
    setValue('latitude', position[0]);
    setValue('longitude', position[1]);
  }, [position, setValue]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Farmer Address</h2>
      <p className="text-sm text-gray-600">
        Please provide the farmer's address
      </p>
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <FormInput
            name="address"
            label="Street Address"
            required
            placeholder="Enter street address"
          />
  
          <FormInput
            name="community"
            label="Community"
            placeholder="Enter community name"
          />
        </div>
  
        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="form-label">State</label>
            <select
              {...register('state')}
              className="form-input"
            >
              <option value="">Select State</option>
              {Object.keys(nigeriaData).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="form-label">LGA</label>
            <select
              {...register('lga')}
              className="form-input"
              disabled={!selectedState}
            >
              <option value="">Select LGA</option>
              {selectedState && nigeriaData[selectedState]?.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
  
          <FormInput
            name="city"
            label="City"
            required
            placeholder="Enter city"
          />
  
          {/* Hidden fields for coordinates */}
          <input type="hidden" {...register('latitude')} />
          <input type="hidden" {...register('longitude')} />
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="space-y-6">
  //     <h2 className="text-xl font-semibold text-gray-900">Farmer Address</h2>
  //     <p className="text-sm text-gray-600">
  //       Please provide the farmer's address 
  //     </p>

  //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //       {/* Address Form Section */}
  //       <div className="space-y-4">
  //         <FormInput
  //           name="address"
  //           label="Street Address"
  //           required
  //           placeholder="Enter street address"
  //         />

  //         <FormInput
  //           name="community"
  //           label="Community"
  //           placeholder="Enter community name"
  //         />

  //         <div className="space-y-4">
  //           <div>
  //             <label className="form-label">State</label>
  //             <select
  //               {...register('state')}
  //               className="form-input"
  //             >
  //               <option value="">Select State</option>
  //               {Object.keys(nigeriaData).map(state => (
  //                 <option key={state} value={state}>{state}</option>
  //               ))}
  //             </select>
  //           </div>

  //           <div>
  //             <label className="form-label">LGA</label>
  //             <select
  //               {...register('lga')}
  //               className="form-input"
  //               disabled={!selectedState}
  //             >
  //               <option value="">Select LGA</option>
  //               {selectedState && nigeriaData[selectedState]?.map(lga => (
  //                 <option key={lga} value={lga}>{lga}</option>
  //               ))}
  //             </select>
  //           </div>
  //         </div>

  //         <FormInput
  //           name="city"
  //           label="City"
  //           required
  //           placeholder="Enter city"
  //         />

  //         {/* Hidden fields for coordinates */}
  //         <input type="hidden" {...register('latitude')} />
  //         <input type="hidden" {...register('longitude')} />
  //       </div>

  //       {/* Map Section */}
  //       {/* <div className="bg-white rounded-lg shadow-sm">
  //         <div className="h-[500px] relative">
  //           <MapContainer
  //             center={position}
  //             zoom={13}
  //             className="h-full w-full rounded-lg"
  //           >
  //             <TileLayer
  //               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  //             />
  //             <SearchBox onSearch={handleSearch} />
  //             <Marker
  //               position={position}
  //               draggable={true}
  //               icon={customIcon}
  //               eventHandlers={{
  //                 dragend: handleMarkerDragEnd
  //               }}
  //             />
  //             <MapController onLocationFound={(latlng) => setPosition([latlng.lat, latlng.lng])} />
  //             <MapEvents onMapClick={handleMapClick} />
  //           </MapContainer>
  //           {isLoading && (
  //             <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
  //               <span className="text-kitovu-purple">Loading address...</span>
  //             </div>
  //           )}
  //         </div>
  //       </div> */}
  //     </div>
  //   </div>
  // );
};

export default LocationInfo;