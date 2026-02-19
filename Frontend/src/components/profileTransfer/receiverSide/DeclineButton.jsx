// components/profile-transfer/receiver-side/received-requests/components/DeclineButton.jsx
export default function DeclineButton() {
  return (
    <button className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
      <span>✕</span>
      <span>Reject</span>
    </button>
  );
}
