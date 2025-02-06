import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBox = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}, Nigeria`
      );
      const data = await response.json();
      if (data && data[0]) {
        onSearch([parseFloat(data[0].lat), parseFloat(data[0].lon)], data[0]);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="absolute top-4 left-4 right-16 z-[1000]">
      <div className="relative">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          placeholder="Search for a location..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm 
                   focus:border-kitovu-purple focus:ring-1 focus:ring-kitovu-purple
                   pl-10"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100"
        >
          <Search className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default SearchBox;