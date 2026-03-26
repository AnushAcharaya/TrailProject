// components/profile-transfer/farmer-side/send-transfer/components/AcceptButton.jsx
export default function AcceptButton({ onClick, loading }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>✓</span>
          <span>Accept</span>
        </>
      )}
    </button>
  );
}
