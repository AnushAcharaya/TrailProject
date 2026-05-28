import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function FilterBar({ onFilterChange, currentFilter, onRoleChange, onSearchChange, users = [] }) {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(currentFilter || "all");

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    if (onFilterChange) onFilterChange(newStatus);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    if (onSearchChange) onSearchChange(value);
  };

  const handleSuggestionSelect = (user) => {
    setSearchTerm(user.name);
    setShowSuggestions(false);
    if (onSearchChange) onSearchChange(user.name);
  };

  // Compute suggestions from users list
  const suggestions = searchTerm
    ? users.filter(user => {
        const q = searchTerm.toLowerCase();
        return (
          user.name?.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q) ||
          user.phone?.includes(q)
        );
      }).slice(0, 6)
    : [];

  const roles = [
    { value: "all",     label: t('filterBar.roles.all') },
    { value: "farmer",  label: t('filterBar.roles.farmer') },
    { value: "vet",     label: t('filterBar.roles.veterinarian') },
  ];

  const statuses = [
    { value: "all",      label: t('filterBar.statuses.all') },
    { value: "pending",  label: t('filterBar.statuses.pending') },
    { value: "approved", label: t('filterBar.statuses.approved') },
    { value: "declined", label: t('filterBar.statuses.declined') },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6 my-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center">

        {/* Search Input with suggestions */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder={t('filterBar.searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {suggestions.map(user => (
                <div
                  key={user.id}
                  onMouseDown={() => handleSuggestionSelect(user)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email} · {user.phone}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'vet' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {user.role === 'vet' ? 'Vet' : 'Farmer'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {showSuggestions && searchTerm && suggestions.length === 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
              <p className="text-sm text-gray-500">No users match "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Role Dropdown */}
        <div className="relative">
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-2.5 h-4 w-4 pointer-events-none text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-2.5 h-4 w-4 pointer-events-none text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

      </div>
    </div>
  );
}
