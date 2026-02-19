// components/profile-transfer/farmer-side/animal-list/components/FilterBar.jsx
const filters = ['All', 'Cows', 'Goats', 'Chickens', 'Pigs'];

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            activeFilter === filter
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-white/70 backdrop-blur-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
