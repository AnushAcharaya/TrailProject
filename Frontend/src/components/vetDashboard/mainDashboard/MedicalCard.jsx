// components/dashboard/main-dashboard/components/MedicalCard.jsx
export default function MedicalCard() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-blue-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-6 flex-1">
        Medical
      </h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🏥</span>
          </div>
          <p className="text-lg font-semibold text-gray-600">No alerts</p>
          <p className="text-sm text-gray-500">All animals healthy</p>
        </div>
      </div>
    </div>
  );
}
