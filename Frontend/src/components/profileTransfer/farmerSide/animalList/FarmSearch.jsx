// components/profile-transfer/farmer-side/animal-list/components/FarmerSearch.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaUser } from 'react-icons/fa';
import { searchFarmers } from '../../../../services/profileTransferApi';

export default function FarmerSearch({ searchTerm, onSearchChange, onFarmerSelect }) {
  const { t } = useTranslation('profileTransfer');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Fetch farmer suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Searching for farmers with query:', searchTerm);
        const farmers = await searchFarmers(searchTerm);
        console.log('Farmers received:', farmers);
        setSuggestions(farmers);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching farmer suggestions:', error);
        console.error('Error details:', error.response?.data);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFarmer = (farmer) => {
    onSearchChange(farmer.full_name || farmer.email);
    if (onFarmerSelect) {
      onFarmerSelect(farmer);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 text-lg z-10" />
      <input
        type="text"
        placeholder={t('transferModal.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-md border-2 border-emerald-200 rounded-2xl text-lg placeholder-emerald-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 shadow-sm hover:shadow-md"
      />
      
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto z-20">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((farmer) => (
                <li
                  key={farmer.id}
                  onClick={() => handleSelectFarmer(farmer)}
                  className="px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-emerald-100 last:border-b-0 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {farmer.full_name || farmer.email}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {farmer.email}
                    </p>
                    {farmer.phone_number && (
                      <p className="text-xs text-gray-500">
                        {farmer.phone_number}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {t('transferModal.noFarms', { query: searchTerm })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
