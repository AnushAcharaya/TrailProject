// components/profile-transfer/farmer-side/animal-list/components/FarmerSearch.jsx
import { FaSearch } from 'react-icons/fa';

export default function FarmerSearch({ searchTerm, onSearchChange }) {
  return (
    <div className="relative">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 text-lg" />
      <input
        type="text"
        placeholder="Search Farmer by Name/Phone/Farmer ID"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-md border-2 border-emerald-200 rounded-2xl text-lg placeholder-emerald-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 shadow-sm hover:shadow-md"
      />
    </div>
  );
}
