import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ProfileCard({ farmer }) {
  const navigate = useNavigate();

  const handleViewAnimals = () => {
    navigate('/vet/farmer-details');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4 mb-4">
        {/* Avatar */}
        <img 
          src={farmer.avatar} 
          alt={farmer.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        
        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {farmer.name}
          </h3>
          
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              <span>{farmer.location}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <FaPhone className="mr-2 text-gray-400" />
              <span>{farmer.phone}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animals count */}
      <p className="text-sm text-gray-500 mb-4">{farmer.animals} animals</p>
      
      {/* Action Button */}
      <button 
        onClick={handleViewAnimals}
        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
      >
        View Animals
      </button>
    </div>
  );
}

export default ProfileCard;
