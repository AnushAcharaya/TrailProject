// components/profile-transfer/farmer-side/animal-list/components/AnimalPreview.jsx
export default function AnimalPreview({ animal }) {
  return (
    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/50">
      <div className="flex items-start space-x-4">
        <img 
          src={animal.image} 
          alt={animal.name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 truncate">{animal.name}</h3>
          <p className="text-sm font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full mt-1 inline-block">
            {animal.tag}
          </p>
          <p className="text-sm text-gray-600 mt-1">{animal.breed}</p>
        </div>
      </div>
    </div>
  );
}
