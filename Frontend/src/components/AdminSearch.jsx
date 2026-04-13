import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function FilterBar({ onFilterChange, currentFilter }) {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(currentFilter || "all");

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    if (onFilterChange) {
      onFilterChange(newStatus);
    }
  };

  // Role options
  const roles = [
    { value: "all", label: t('filterBar.roles.all') },
    { value: "farmer", label: t('filterBar.roles.farmer') },
    { value: "veterinarian", label: t('filterBar.roles.veterinarian') },
  ];

  // Status options
  const statuses = [
    { value: "all", label: t('filterBar.statuses.all') },
    { value: "pending", label: t('filterBar.statuses.pending') },
    { value: "approved", label: t('filterBar.statuses.approved') },
    { value: "declined", label: t('filterBar.statuses.declined') },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6 my-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder={t('filterBar.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Roles Dropdown */}
        <div className="relative">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-2.5 h-4 w-4 pointer-events-none text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-2.5 h-4 w-4 pointer-events-none text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}