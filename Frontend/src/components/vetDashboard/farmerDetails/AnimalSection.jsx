import { useNavigate } from 'react-router-dom';

function AnimalSection({ animals }) {
  const navigate = useNavigate();

  if (!animals) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Animals ({animals.length})</h3>
      
      {animals.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-600">
          No animals registered for this farmer
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map(animal => {
            const imageUrl = animal.image || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(animal.tag_id)}&background=10b981&color=fff&size=300`;

            return (
              <div key={animal.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative">
                  <img 
                    src={imageUrl}
                    alt={animal.tag_id}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(animal.tag_id)}&background=10b981&color=fff&size=300`;
                    }}
                  />
                  <span className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${
                    animal.health_status === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {animal.health_status || 'Unknown'}
                  </span>
                </div>
                
                {/* Details */}
                <div className="p-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Tag: {animal.tag_id}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <span>Species: {animal.species_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <span>Breed: {animal.breed_name || 'N/A'}</span>
                    <span>•</span>
                    <span>Age: {animal.age || 'N/A'}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        // Store animal tag for the vaccination form
                        localStorage.setItem('selectedAnimalTag', animal.tag_id);
                        localStorage.setItem('selectedAnimalId', animal.id);
                        // Navigate directly to add vaccination form
                        navigate('/vaccination/add', { state: { from: 'vet', animalId: animal.id, animalTag: animal.tag_id } });
                      }}
                      className="w-full px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded hover:bg-emerald-100 transition-colors"
                    >
                      Vaccinations
                    </button>
                    <button 
                      onClick={() => {
                        // Store animal tag for the medical history form
                        localStorage.setItem('selectedAnimalTag', animal.tag_id);
                        localStorage.setItem('selectedAnimalId', animal.id);
                        // Navigate directly to add treatment form
                        navigate('/medical/add', { state: { from: 'vet', animalId: animal.id, animalTag: animal.tag_id } });
                      }}
                      className="w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
                    >
                      Medical History
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AnimalSection;
