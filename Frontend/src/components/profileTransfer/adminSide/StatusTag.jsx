// components/profile-transfer/admin-side/dashboard/components/StatusTag.jsx
export default function StatusTag({ status }) {
  const statusConfig = {
    'Pending': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    'Receiver Approved': { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800',
      border: 'border-blue-200'
    },
    'Admin Approved': { 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-800',
      border: 'border-emerald-200'
    },
    'Rejected': { 
      bg: 'bg-red-100', 
      text: 'text-red-800',
      border: 'border-red-200'
    }
  };

  const config = statusConfig[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-800',
    border: 'border-gray-200'
  };

  return (
    <span className={`inline-flex px-3 py-1 ${config.bg} ${config.text} ${config.border} border rounded-full text-xs font-medium`}>
      {status}
    </span>
  );
}
