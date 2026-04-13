// components/profile-transfer/farmer-side/animal-list/components/SearchBar.jsx
import { useTranslation } from 'react-i18next';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ searchTerm, onSearchChange }) {
  const { t } = useTranslation('profileTransfer');
  
  return (
    <div className="relative">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
      <input
        type="text"
        placeholder={t('animalList.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-base placeholder-gray-400 focus:border-emerald-400 focus:outline-none transition-all"
      />
    </div>
  );
}
