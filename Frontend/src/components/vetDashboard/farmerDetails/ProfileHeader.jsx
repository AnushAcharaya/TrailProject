import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

function ProfileHeader({ farmer }) {
  if (!farmer) return null;

  const profileImageUrl = farmer.profile_image_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.full_name || farmer.username)}&background=059669&color=fff&size=128`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <img 
          src={profileImageUrl} 
          alt={farmer.full_name || farmer.username}
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.full_name || farmer.username)}&background=059669&color=fff&size=128`;
          }}
        />
        
        {/* Details */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {farmer.full_name || farmer.username}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {farmer.address && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-1 text-gray-400" />
                <span>{farmer.address}</span>
              </div>
            )}
            {farmer.phone && (
              <div className="flex items-center">
                <FaPhone className="mr-1 text-gray-400" />
                <span>{farmer.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
