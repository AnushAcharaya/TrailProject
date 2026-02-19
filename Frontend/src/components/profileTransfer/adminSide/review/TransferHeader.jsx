function TransferHeader() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Animal Profile</h3>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <img 
            src="/api/placeholder/120/120" 
            alt="Bali"
            className="w-28 h-28 rounded-2xl object-cover shadow-md"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bali <span className="text-lg text-gray-500 font-normal">(TG-001)</span>
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Breed:</span>
              <span className="text-sm font-medium text-gray-900">Cow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Age:</span>
              <span className="text-sm font-medium text-gray-900">3 Years</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Health:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Healthy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransferHeader;
