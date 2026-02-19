// components/profile-transfer/farmer-side/animal-list/components/AnimalCard.jsx
import { FaExchangeAlt } from 'react-icons/fa';

export default function AnimalCard({ animal, onTransferClick }) {
  // Status badge styling
  const getStatusStyle = (status) => {
    const styles = {
      'Healthy': 'bg-emerald-100 text-emerald-700',
      'Vaccinated': 'bg-blue-100 text-blue-700',
      'Under Treatment': 'bg-yellow-100 text-yellow-700',
      'Sick': 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Section */}
      <div className="relative">
        <img 
          src={animal.image} 
          alt={animal.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-emerald-600 px-3 py-1 rounded-full text-xs font-semibold text-white">
          {animal.tag}
        </div>
        {animal.status && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(animal.status)}`}>
            {animal.status}
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        {/* Name */}
        <h3 className="font-bold text-xl text-gray-900 mb-2">{animal.name}</h3>
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Species:</span>
            <span className="font-semibold text-gray-800">{animal.breed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Age:</span>
            <span className="font-semibold text-gray-800">{animal.age}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Owner:</span>
            <span className="font-semibold text-gray-800">{animal.owner}</span>
          </div>
        </div>

        {/* Transfer Button */}
        <button
          onClick={() => onTransferClick(animal)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FaExchangeAlt className="text-sm" />
          <span>Transfer</span>
        </button>
      </div>
    </div>
  );
}
