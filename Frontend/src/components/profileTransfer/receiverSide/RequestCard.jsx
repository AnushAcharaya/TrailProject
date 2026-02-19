// components/profile-transfer/receiver-side/received-requests/components/RequestCard.jsx
import { FaUser, FaCalendar } from 'react-icons/fa';
import { MdPets } from 'react-icons/md';
import SenderAvatar from './SenderAvatar';
import AcceptButton from './AcceptButton';
import DeclineButton from './DeclineButton';

export default function RequestCard({ request }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex gap-6">
        {/* Left side - Animal Image */}
        <div className="flex-shrink-0">
          <img 
            src={request.animalImage} 
            alt={request.animalName}
            className="w-32 h-32 rounded-lg object-cover"
          />
        </div>

        {/* Middle - Animal Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{request.animalName}</h3>
              <p className="text-sm text-gray-600">{request.animalTag} - {request.animalBreed}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Healthy
              </span>
            </div>
          </div>

          {/* From Section */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaUser className="text-gray-400" />
              <span className="font-medium">From:</span>
              <span className="font-semibold text-gray-900">{request.senderName}</span>
            </div>
          </div>

          {/* Reason Section */}
          <div className="mb-3">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MdPets className="text-gray-400 mt-0.5" />
              <div>
                <span className="font-medium">Reason:</span>
                <p className="text-gray-700 mt-1">{request.reason}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col justify-between items-end">
          <div className="text-xs text-gray-500 mb-4">{request.time}</div>
          <div className="flex gap-2">
            <DeclineButton />
            <AcceptButton />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
              ✓
            </div>
            <span className="text-sm font-medium text-gray-700">Request Created</span>
          </div>
          <div className="flex-1 h-1 bg-yellow-400 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 border-4 border-yellow-300 flex items-center justify-center text-yellow-900 font-bold text-sm">
              2
            </div>
            <span className="text-sm font-medium text-gray-700">Receiver Approval</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
              3
            </div>
            <span className="text-sm font-medium text-gray-500">Admin Approval</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
              4
            </div>
            <span className="text-sm font-medium text-gray-500">Transfer Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
