// components/profile-transfer/farmer-side/send-transfer/components/ActionButtons.jsx
export default function ActionButtons() {
  return (
    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <button className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
        ⚠️
      </button>
      <button className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
        ✏️
      </button>
      <button className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
        ✓
      </button>
      <button className="w-10 h-10 bg-red-400 hover:bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
        ❌
      </button>
    </div>
  );
}
