import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { Search } from 'lucide-react';

const SearchBox = ({ setCenter }) => {
    const [searchText, setSearchText] = useState('');
    const map = useMap();
  
    const handleSearch = async () => {
      if (!searchText) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&country=Nigeria`
        );
        const data = await response.json();
        if (data && data[0]) {
          map.setView([data[0].lat, data[0].lon], 15);
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    };
  
    return (
      <div className="absolute top-2 left-2 z-[1000] bg-white rounded-md shadow-md flex items-center p-2">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search location..."
          className="px-3 py-1 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-kitovu-purple"
        />
        <button
          onClick={handleSearch}
          className="px-3 py-1 bg-kitovu-purple text-white rounded-r-md hover:bg-opacity-90"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    );
};

export default SearchBox;