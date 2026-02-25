import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

function ProfileHeader() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <img 
          src="/api/placeholder/64/64" 
          alt="Rajesh Kumar"
          className="w-16 h-16 rounded-full object-cover"
        />
        
        {/* Details */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Rajesh Kumar
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-1 text-gray-400" />
              <span>Jaipur, Rajasthan</span>
            </div>
            <div className="flex items-center">
              <FaPhone className="mr-1 text-gray-400" />
              <span>+91 98765 48210</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
