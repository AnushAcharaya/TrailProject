import { FaSyringe } from 'react-icons/fa';

const VaccinationHistory = () => {
  const vaccinations = [
    { date: 'Jul 10, 2025', type: 'FMD Vaccine', status: 'vaccinated' },
    { date: 'Jun 15, 2025', type: 'PPR Vaccine', status: 'vaccinated' },
    { date: 'May 20, 2025', type: 'Brucellosis', status: 'pending' },
    { date: 'Apr 12, 2025', type: 'Enterotoxemia', status: 'vaccinated' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        <FaSyringe className="w-5 h-5 text-emerald-600" />
        Vaccination History
      </h3>
      
      <div className="space-y-2">
        {vaccinations.map((vaccine, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 hover:shadow-sm transition-all">
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-700">{vaccine.date}</div>
              <div className="text-sm text-gray-700 font-medium">{vaccine.type}</div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${vaccine.status === 'vaccinated' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
              {vaccine.status === 'vaccinated' ? 'Done' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VaccinationHistory;
