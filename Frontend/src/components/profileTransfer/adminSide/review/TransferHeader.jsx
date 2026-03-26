function TransferHeader({ transfer }) {
  if (!transfer) return null;

  const livestock = transfer.livestock_details || {};
  const species = livestock.species_name || 'Unknown';
  const breed = livestock.breed_name || 'Unknown';
  const tagId = livestock.tag_id || 'N/A';
  const livestockImage = livestock.image;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Animal Profile</h3>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          {livestockImage ? (
            <img 
              src={livestockImage.startsWith('http') ? livestockImage : `http://localhost:8000${livestockImage}`}
              alt={`${species} - ${tagId}`}
              className="w-28 h-28 rounded-2xl object-cover shadow-md"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-28 h-28 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-md"
            style={{ display: livestockImage ? 'none' : 'flex' }}
          >
            <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {species} <span className="text-lg text-gray-500 font-normal">({tagId})</span>
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Breed:</span>
              <span className="text-sm font-medium text-gray-900">{breed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Gender:</span>
              <span className="text-sm font-medium text-gray-900">{livestock.gender || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Age:</span>
              <span className="text-sm font-medium text-gray-900">{livestock.age ? `${livestock.age} years` : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Health Status:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                livestock.health_status === 'Healthy' ? 'bg-green-100 text-green-800' :
                livestock.health_status === 'Under Treatment' ? 'bg-yellow-100 text-yellow-800' :
                livestock.health_status === 'Critical' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {livestock.health_status || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Requested:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(transfer.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transfer Reason Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Transfer Reason</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {transfer.reason || 'No reason provided'}
        </p>
      </div>
    </div>
  );
}

export default TransferHeader;
