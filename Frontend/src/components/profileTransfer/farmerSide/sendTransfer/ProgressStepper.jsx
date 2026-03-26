// components/profile-transfer/farmer-side/send-transfer/components/ProgressStepper.jsx
import React from 'react';

export default function ProgressStepper({ status = 'Pending' }) {
  // Determine which steps are completed based on status
  const getStepStatus = (stepNumber) => {
    switch (status) {
      case 'Pending':
        return stepNumber === 1 ? 'completed' : stepNumber === 2 ? 'active' : 'pending';
      case 'Receiver Approved':
        return stepNumber <= 2 ? 'completed' : stepNumber === 3 ? 'active' : 'pending';
      case 'Admin Approved':
        return stepNumber <= 3 ? 'completed' : stepNumber === 4 ? 'active' : 'pending';
      case 'Completed':
        return 'completed';
      case 'Rejected':
        return stepNumber === 1 ? 'completed' : stepNumber === 2 ? 'rejected' : 'pending';
      default:
        return 'pending';
    }
  };

  const steps = [
    { label: 'Request Created', number: 1 },
    { label: 'Receiver Approval', number: 2 },
    { label: 'Admin Approval', number: 3 },
    { label: 'Transfer Completed', number: 4 }
  ];

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-200/50">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.number);
          
          return (
            <React.Fragment key={step.label}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                stepStatus === 'completed' ? 'bg-emerald-500 text-white font-bold' :
                stepStatus === 'rejected' ? 'bg-red-500 text-white font-bold' :
                stepStatus === 'active' ? 'bg-yellow-400 border-4 border-yellow-300 text-yellow-900 font-bold shadow-yellow-100' :
                'bg-gray-200 text-gray-500'
              }`}>
                {stepStatus === 'completed' ? '✓' : stepStatus === 'rejected' ? '✕' : step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 rounded-full ${
                  getStepStatus(step.number + 1) === 'completed' || getStepStatus(step.number + 1) === 'rejected' ? 'bg-gradient-to-r from-emerald-300 to-emerald-400' :
                  getStepStatus(step.number + 1) === 'active' ? 'bg-gradient-to-r from-emerald-300 to-yellow-400' :
                  'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between mt-4 text-sm">
        {steps.map(step => {
          const stepStatus = getStepStatus(step.number);
          return (
            <span key={step.label} className={`font-medium ${
              stepStatus === 'completed' || stepStatus === 'active' ? 'text-emerald-700' : 
              stepStatus === 'rejected' ? 'text-red-700' :
              'text-gray-500'
            }`}>
              {step.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
