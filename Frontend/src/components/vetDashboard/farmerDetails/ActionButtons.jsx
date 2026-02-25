import { FaEdit, FaArrowLeft } from 'react-icons/fa';

function ActionButtons() {
  return (
    <div className="flex space-x-3">
      <button className="w-12 h-12 bg-red-400 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group">
        <FaEdit className="text-lg group-hover:scale-110 transition-transform duration-200" />
      </button>
      <button className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group">
        <FaArrowLeft className="text-lg group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
}

export default ActionButtons;
