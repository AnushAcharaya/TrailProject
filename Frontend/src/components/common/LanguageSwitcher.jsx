import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

const LanguageSwitcher = ({ context = 'global', theme = 'light' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get the storage key based on context
  const getStorageKey = () => {
    return `language_${context}`;
  };

  // Load language preference for this context on mount
  useEffect(() => {
    const storageKey = getStorageKey();
    const savedLanguage = localStorage.getItem(storageKey);
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [context, i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, lng);
    setIsOpen(false);
    
    // TODO: Update user profile language preference if authenticated
    // This will be implemented when we add the backend API
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get language code label
  const getLanguageLabel = () => {
    return i18n.language === 'ne' ? 'Nep' : 'Eng';
  };

  // Get text color based on theme
  const getTextColor = () => {
    return theme === 'dark' ? 'text-white' : 'text-gray-600';
  };

  const getLabelColor = () => {
    return theme === 'dark' ? 'text-white' : 'text-gray-700';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Globe Icon Button with Language Label */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Change Language"
      >
        <FaGlobe className={`${getTextColor()} text-xl mb-1`} />
        <span className={`text-xs font-medium ${getLabelColor()}`}>
          {getLanguageLabel()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
              i18n.language === 'en' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-700'
            }`}
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('ne')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
              i18n.language === 'ne' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-700'
            }`}
          >
            नेपाली
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
