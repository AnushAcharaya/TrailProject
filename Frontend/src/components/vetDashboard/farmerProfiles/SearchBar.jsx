import { FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function SearchBar({ value, onChange }) {
  const { t } = useTranslation('vetDashboard');
  
  return (
    <div className="relative w-full">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={t('farmerProfiles.searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-400"
      />
    </div>
  );
}

export default SearchBar;
