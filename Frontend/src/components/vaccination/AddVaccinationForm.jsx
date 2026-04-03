// src/components/vaccination/AddVaccinationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSyringe } from "react-icons/fa";
import { getAllLivestock } from "../../services/livestockCrudApi";
import { createVaccination } from "../../services/vaccinationApi";
import "./../../styles/vaccination.css";

const AddVaccinationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedLivestock = location.state?.preSelectedLivestock;
  
  const [livestockList, setLivestockList] = useState([]);
  const [filteredLivestock, setFilteredLivestock] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    livestock: preSelectedLivestock || "",
    vaccineName: "",
    vaccineType: "",
    dateGiven: "",
    nextDueDate: "",
    notes: "",
  });

  // Fetch livestock on component mount
  useEffect(() => {
    fetchLivestock();
  }, []);

  const fetchLivestock = async () => {
    setLoading(true);
    const result = await getAllLivestock();
    
    if (result.success) {
      const data = result.data.results || result.data;
      setLivestockList(Array.isArray(data) ? data : []);
      setFilteredLivestock(Array.isArray(data) ? data : []);
    } else {
      console.error('Failed to fetch livestock:', result.error);
      setLivestockList([]);
      setFilteredLivestock([]);
    }
    setLoading(false);
  };

  const handleLivestockSearch = (value) => {
    setSearchTerm(value);
    setShowDropdown(true);
    
    if (value.trim() === "") {
      setFilteredLivestock(livestockList);
    } else {
      const filtered = livestockList.filter(animal => 
        animal.tag_id?.toLowerCase().includes(value.toLowerCase()) ||
        animal.breed_name?.toLowerCase().includes(value.toLowerCase()) ||
        animal.species_name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLivestock(filtered);
    }
  };

  const handleLivestockSelect = (animal) => {
    const displayText = `Tag: ${animal.tag_id}`;
    setSearchTerm(displayText);
    setFormData({ ...formData, livestock: animal.tag_id });
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    const result = await createVaccination(formData);
    
    if (result.success) {
      setNotification({ type: 'success', message: 'Vaccination record created successfully!' });
      setTimeout(() => {
        navigate('/vaccination');
      }, 2000);
    } else {
      const errorMessage = typeof result.error === 'object' 
        ? Object.entries(result.error).map(([key, value]) => `${key}: ${value}`).join(', ')
        : result.error?.message || 'Failed to create vaccination record.';
      setNotification({ type: 'error', message: errorMessage });
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-light max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-green-100 p-2 rounded">
          <FaSyringe className="text-green-700" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-body">Add Vaccination Record</h2>
          <p className="text-sm text-muted">Record a new vaccination for your livestock</p>
        </div>
      </div>

      {/* Notification Card */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-xl">&times;</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Livestock Search with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-body mb-1">Livestock *</label>
            {loading ? (
              <p className="text-sm text-gray-500">Loading livestock...</p>
            ) : (
              <>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleLivestockSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
                  placeholder="Search by tag ID, breed, or species..."
                  required
                  className="w-full p-2 border border-light rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                {/* Dropdown List */}
                {showDropdown && filteredLivestock.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredLivestock.map((animal, index) => (
                      <div
                        key={animal.id || index}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          handleLivestockSelect(animal);
                        }}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          Tag: {animal.tag_id}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>Breed: {animal.breed_name || 'N/A'} | Species: {animal.species_name}</span>
                          {animal.age && <span> | Age: {animal.age} years</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No Results Message */}
                {showDropdown && searchTerm && filteredLivestock.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                    <p className="text-gray-500 text-sm">No livestock found matching "{searchTerm}"</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">Vaccine Name *</label>
            <input
              type="text"
              name="vaccineName"
              value={formData.vaccineName}
              onChange={handleChange}
              placeholder="e.g., Foot and Mouth Disease Vaccine"
              required
              className="w-full p-2 border border-light rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">Vaccine Type *</label>
            <select
              name="vaccineType"
              value={formData.vaccineType}
              onChange={handleChange}
              required
              className="w-full p-2 border border-light rounded"
            >
              <option value="">Select vaccine type</option>
              <option value="Viral Vaccine">Viral Vaccine</option>
              <option value="Bacterial Vaccine">Bacterial Vaccine</option>
              <option value="Clostridial Vaccine">Clostridial Vaccine</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">Date Given *</label>
              <input
                type="date"
                name="dateGiven"
                value={formData.dateGiven}
                onChange={handleChange}
                required
                className="w-full p-2 border border-light rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Next Due Date *</label>
              <input
                type="date"
                name="nextDueDate"
                value={formData.nextDueDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-light rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes about this vaccination..."
              rows="3"
              className="w-full p-2 border border-light rounded"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/vaccination')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-green-800 disabled:bg-gray-400"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Vaccination'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddVaccinationForm;