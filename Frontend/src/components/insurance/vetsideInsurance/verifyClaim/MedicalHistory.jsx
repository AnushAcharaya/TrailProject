import { FaNotesMedical } from 'react-icons/fa';

const MedicalHistory = () => {
  const history = [
    { date: 'Jul 20, 2025', treatment: 'Leg fracture treatment' },
    { date: 'Jun 28, 2025', treatment: 'Routine checkup' },
    { date: 'May 15, 2025', treatment: 'Deworming' },
    { date: 'Apr 10, 2025', treatment: 'Annual vaccination' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        <FaNotesMedical className="w-5 h-5 text-emerald-600" />
        Medical History
      </h3>
      
      <div className="space-y-2">
        {history.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 hover:shadow-sm transition-all">
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-700">{item.date}</div>
              <div className="text-sm text-gray-700 font-medium">{item.treatment}</div>
            </div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalHistory;
