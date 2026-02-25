import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="relative max-w-md">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search by name, phone or farmer ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-400"
      />
    </div>
  );
}

export default SearchBar;
