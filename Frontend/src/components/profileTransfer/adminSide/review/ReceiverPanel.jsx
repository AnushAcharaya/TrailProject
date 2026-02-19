function ReceiverPanel() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Receiver</h3>
      <div className="flex items-start gap-4 mb-6">
        <img 
          src="/api/placeholder/64/64" 
          alt="Receiver"
          className="w-16 h-16 rounded-full object-cover shadow-sm flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-gray-900 mb-1">Grace Wanjiku</h4>
          <p className="text-sm text-gray-600">Farmer ID: FM-2022-002</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start justify-between py-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +254 712 345 678
          </span>
        </div>
        <div className="flex items-start justify-between py-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Kiambu
          </span>
        </div>
        <div className="flex items-start justify-between py-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-600 font-medium">Verified</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ReceiverPanel;
