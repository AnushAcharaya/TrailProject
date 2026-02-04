import { FiSearch } from "react-icons/fi";
import "../../styles/farmerdashboard.css";

const SearchBar = () => {
  return (
    <div className="relative w-full max-w-full sm:max-w-lg">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        placeholder="Search livestock by tag ID or name..."
        className="w-full pl-10 pr-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm sm:text-base"
      />
    </div>
  );
};

export default SearchBar;
