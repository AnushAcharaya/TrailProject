// components/profile-transfer/receiver-side/received-requests/components/RequestStatus.jsx
export default function RequestStatus({ count }) {
  return (
    <div className="ml-4 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm border border-emerald-400 rounded-full text-xs font-bold text-white shadow-lg ml-auto">
      {count} request
    </div>
  );
}
