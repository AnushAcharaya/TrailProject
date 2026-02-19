// components/profile-transfer/farmer-side/send-transfer/components/ProgressStepper.jsx
import React from 'react';

export default function ProgressStepper() {
  const steps = [
    { label: 'Request Created', status: 'completed', color: 'emerald' },
    { label: 'Receiver Approval', status: 'active', color: 'emerald' },
    { label: 'Admin Approval', status: 'pending', color: 'yellow' },
    { label: 'Transfer Completed', status: 'pending', color: 'gray' }
  ];

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-200/50">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.label}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
              step.status === 'completed' ? 'bg-emerald-500 text-white font-bold' :
              step.status === 'active' ? 'bg-emerald-500 border-4 border-emerald-400 text-white font-bold shadow-emerald-200' :
              step.color === 'yellow' ? 'bg-yellow-400 border-4 border-yellow-300 text-yellow-900 font-bold shadow-yellow-100' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-gradient-to-r from-emerald-300 to-emerald-400 rounded-full" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between mt-4 text-sm">
        {steps.map(step => (
          <span key={step.label} className={`font-medium ${
            step.status === 'completed' || step.status === 'active' ? 'text-emerald-700' : 'text-gray-500'
          }`}>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
