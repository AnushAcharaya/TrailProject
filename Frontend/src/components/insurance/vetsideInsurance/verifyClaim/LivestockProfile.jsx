import { 
  FaTag, FaShieldAlt, FaHeartbeat, FaCalendarAlt, 
  FaMapMarkerAlt, FaStethoscope 
} from 'react-icons/fa';

const LivestockProfile = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        <FaStethoscope className="w-5 h-5 text-emerald-600" />
        Livestock Profile
      </h3>
      
      <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
        Dolly
      </div>
      <div className="text-sm font-semibold text-gray-600 mb-4">Sheep • Merino Breed</div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 flex-shrink-0">
            <FaTag className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-600">Tag ID</div>
            <div className="text-sm font-bold text-gray-900">SH-002</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 flex-shrink-0">
            <FaShieldAlt className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-600">Health Status</div>
            <div className="text-sm font-bold text-emerald-700">Healthy</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 flex-shrink-0">
            <FaHeartbeat className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-600">Age</div>
            <div className="text-sm font-bold text-gray-900">2 Years</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 flex-shrink-0">
            <FaCalendarAlt className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-600">Last Checkup</div>
            <div className="text-sm font-bold text-gray-900">Jul 15, 2025</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 flex-shrink-0">
            <FaMapMarkerAlt className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-600">Location</div>
            <div className="text-sm font-bold text-gray-900">Kathmandu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivestockProfile;
