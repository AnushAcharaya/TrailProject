// components/profileTransfer/farmerSide/animalList/TransferModal.jsx
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import AnimalPreview from './AnimalPreview';
import FarmSearch from './FarmSearch';
import ReasonTextArea from './ReasonTextArea';

export default function TransferModal({ animal, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transfer Ownership
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <AnimalPreview animal={animal} />
          <FarmSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <ReasonTextArea reason={reason} onReasonChange={setReason} />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-emerald-100 bg-emerald-50/50 rounded-b-3xl">
          <div className="flex space-x-3">
            <button className="flex-1 py-3.5 px-6 bg-white/80 backdrop-blur-sm hover:bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              Cancel
            </button>
            <button className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
