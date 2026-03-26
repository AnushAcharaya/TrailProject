function SenderPanel({ transfer }) {
  if (!transfer) return null;

  const sender = transfer.sender_details || {};
  const fullName = sender.full_name || sender.username || 'Unknown';
  const phone = sender.phone || sender.phone_number || 'N/A';
  const email = sender.email || 'N/A';
  const farmName = sender.farm_name || 'N/A';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Sender</h3>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-2xl font-bold text-emerald-600">
            {fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-gray-900 mb-1">{fullName}</h4>
          <p className="text-sm text-gray-600">ID: {sender.id || 'N/A'}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start justify-between py-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {email}
          </span>
        </div>
        <div className="flex items-start justify-between py-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {phone}
          </span>
        </div>
        <div className="flex items-start justify-between py-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {farmName}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SenderPanel;
