// src/components/vaccination/VaccinationSearchBar.jsx
import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const VaccinationSearchBar = ({ searchTerm, onSearchChange, allVaccinations }) => {
  const { t } = useTranslation('vaccination');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      generateSuggestions(searchTerm);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, allVaccinations]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateSuggestions = (term) => {
    const search = term.toLowerCase();
    const suggestionSet = new Set();
    const suggestionList = [];

    allVaccinations.forEach((vaccination) => {
      // Vaccine names
      if (vaccination.vaccine_name?.toLowerCase().includes(search)) {
        const suggestion = {
          type: t('search.types.vaccine'),
          value: vaccination.vaccine_name,
          label: `${vaccination.vaccine_name} (${t('search.types.vaccine')})`
        };
        const key = `vaccine-${vaccination.vaccine_name}`;
        if (!suggestionSet.has(key)) {
          suggestionSet.add(key);
          suggestionList.push(suggestion);
        }
      }

      // Vaccine types
      if (vaccination.vaccine_type?.toLowerCase().includes(search)) {
        const suggestion = {
          type: t('search.types.type'),
          value: vaccination.vaccine_type,
          label: `${vaccination.vaccine_type} (${t('search.types.type')})`
        };
        const key = `type-${vaccination.vaccine_type}`;
        if (!suggestionSet.has(key)) {
          suggestionSet.add(key);
          suggestionList.push(suggestion);
        }
      }

      // Tag IDs
      if (vaccination.livestock?.tag_id?.toLowerCase().includes(search)) {
        const suggestion = {
          type: t('search.types.tag'),
          value: vaccination.livestock.tag_id,
          label: `${vaccination.livestock.tag_id} (${t('search.types.tag')})`
        };
        const key = `tag-${vaccination.livestock.tag_id}`;
        if (!suggestionSet.has(key)) {
          suggestionSet.add(key);
          suggestionList.push(suggestion);
        }
      }

      // Species names
      if (vaccination.livestock?.species_name?.toLowerCase().includes(search)) {
        const suggestion = {
          type: t('search.types.species'),
          value: vaccination.livestock.species_name,
          label: `${vaccination.livestock.species_name} (${t('search.types.species')})`
        };
        const key = `species-${vaccination.livestock.species_name}`;
        if (!suggestionSet.has(key)) {
          suggestionSet.add(key);
          suggestionList.push(suggestion);
        }
      }

      // Status
      if (vaccination.status?.toLowerCase().includes(search)) {
        const suggestion = {
          type: t('search.types.status'),
          value: vaccination.status,
          label: `${vaccination.status.charAt(0).toUpperCase() + vaccination.status.slice(1)} (${t('search.types.status')})`
        };
        const key = `status-${vaccination.status}`;
        if (!suggestionSet.has(key)) {
          suggestionSet.add(key);
          suggestionList.push(suggestion);
        }
      }
    });

    setSuggestions(suggestionList.slice(0, 8)); // Limit to 8 suggestions
  };

  const handleSuggestionClick = (value) => {
    onSearchChange(value);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onSearchChange('');
    setShowSuggestions(false);
  };

  return (
    <div className="mb-6" ref={searchRef}>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => searchTerm && setShowSuggestions(true)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={16} />
          </button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.value)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <span className="text-gray-800">{suggestion.value}</span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {suggestion.type}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && searchTerm && suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-gray-500 text-sm text-center">{t('search.noSuggestions')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccinationSearchBar;
