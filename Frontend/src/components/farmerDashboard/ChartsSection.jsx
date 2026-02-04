import "../../styles/farmerdashboard.css";

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
        <h3 className="font-semibold text-slate-700 mb-3 sm:mb-4 text-sm sm:text-base">
          Livestock Distribution
        </h3>
        <p className="text-xs text-slate-500 mb-3">Total animals by type</p>
        <div className="h-48 sm:h-56 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm sm:text-base">Pie / Donut Chart</p>
            <p className="text-xs mt-1">Chart visualization here</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
        <h3 className="font-semibold text-slate-700 mb-3 sm:mb-4 text-sm sm:text-base">
          Vaccination Status
        </h3>
        <p className="text-xs text-slate-500 mb-3">Monthly vaccination overview</p>
        <div className="h-48 sm:h-56 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm sm:text-base">Bar Chart</p>
            <p className="text-xs mt-1">Chart visualization here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
