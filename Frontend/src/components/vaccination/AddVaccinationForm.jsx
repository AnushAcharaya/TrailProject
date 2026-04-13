// src/components/vaccination/AddVaccinationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSyringe } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getAllLivestock } from "../../services/livestockCrudApi";
import { createVaccination } from "../../services/vaccinationApi";
import "./../../styles/vaccination.css";

const AddVaccinationForm = () => {
  const { t } = useTranslation('vaccination');
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

  // Auto-fill livestock if coming from vet dashboard
  useEffect(() => {
    const selectedTag = localStorage.getItem('selectedAnimalTag');
    const selectedId = localStorage.getItem('selectedAnimalId');
    
    if (selectedTag && livestockList.length > 0) {
      // Find the animal in the list
      const animal = livestockList.find(a => a.tag_id === selectedTag);
      if (animal) {
        const displayText = `Tag: ${animal.tag_id}`;
        setSearchTerm(displayText);
        setFormData(prev => ({ ...prev, livestock: animal.tag_id }));
      }
    }
  }, [livestockList]); // Run when livestock list is loaded

  const fetchLivestock = async () => {
    setLoading(true);
    
    // Check if coming from vet dashboard - get farmer's username from localStorage
    const farmerUsername = localStorage.getItem('selectedFarmerUsername');
    const params = farmerUsername ? { owner: farmerUsername } : {};
    
    console.log('[AddVaccinationForm] Fetching livestock with params:', params);
    const result = await getAllLivestock(params);
    
    if (result.success) {
      const data = result.data.results || result.data;
      console.log('[AddVaccinationForm] Fetched livestock:', data);
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
      setNotification({ type: 'success', message: t('addForm.messages.createSuccess') });
      setTimeout(() => {
        // Check if coming from vet dashboard
        const isFromVet = location.state?.from === 'vet';
        if (isFromVet) {
          // Navigate back to vet's farmer details page (animals page)
          navigate('/vet/farmer-details');
        } else {
          // Navigate to farmer's vaccination dashboard
          navigate('/vaccination');
        }
      }, 2000);
    } else {
      const errorMessage = typeof result.error === 'object' 
        ? Object.entries(result.error).map(([key, value]) => `${key}: ${value}`).join(', ')
        : result.error?.message || t('addForm.messages.createError');
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
          <h2 className="text-xl font-semibold text-body">{t('addForm.title')}</h2>
          <p className="text-sm text-muted">{t('addForm.subtitle')}</p>
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
            <label className="block text-sm font-medium text-body mb-1">{t('addForm.fields.livestock')} *</label>
            {loading ? (
              <p className="text-sm text-gray-500">{t('addForm.fields.loadingLivestock')}</p>
            ) : (
              <>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleLivestockSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
                  placeholder={t('addForm.fields.livestockPlaceholder')}
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
                          {t('addForm.livestockInfo.tag')}: {animal.tag_id}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>{t('addForm.livestockInfo.breed')}: {animal.breed_name || 'N/A'} | {t('addForm.livestockInfo.species')}: {animal.species_name}</span>
                          {animal.age && <span> | {t('addForm.livestockInfo.age')}: {animal.age} {t('addForm.livestockInfo.years')}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No Results Message */}
                {showDropdown && searchTerm && filteredLivestock.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                    <p className="text-gray-500 text-sm">{t('addForm.fields.noLivestock', { search: searchTerm })}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">{t('addForm.fields.vaccineName')} *</label>
            <input
              type="text"
              name="vaccineName"
              value={formData.vaccineName}
              onChange={handleChange}
              placeholder={t('addForm.fields.vaccineNamePlaceholder')}
              required
              className="w-full p-2 border border-light rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">{t('addForm.fields.vaccineType')} *</label>
            <select
              name="vaccineType"
              value={formData.vaccineType}
              onChange={handleChange}
              required
              className="w-full p-2 border border-light rounded"
            >
              <option value="">{t('addForm.fields.vaccineTypeSelect')}</option>
              <option value="Viral Vaccine">{t('addForm.fields.vaccineTypes.viral')}</option>
              <option value="Bacterial Vaccine">{t('addForm.fields.vaccineTypes.bacterial')}</option>
              <option value="Clostridial Vaccine">{t('addForm.fields.vaccineTypes.clostridial')}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('addForm.fields.dateGiven')} *</label>
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
              <label className="block text-sm font-medium text-body mb-1">{t('addForm.fields.nextDueDate')} *</label>
              <input
                type="date"
                name="nextDueDate"
                value={formData.nextDueDate}
                onChange={handleChange}
                min={formData.dateGiven || undefined}
                required
                className="w-full p-2 border border-light rounded"
              />
              {formData.dateGiven && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('addForm.fields.nextDueDateHint', { date: new Date(formData.dateGiven).toLocaleDateString() })}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">{t('addForm.fields.notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t('addForm.fields.notesPlaceholder')}
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
              {t('addForm.buttons.cancel')}
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-green-800 disabled:bg-gray-400"
              disabled={submitting}
            >
              {submitting ? t('addForm.buttons.saving') : t('addForm.buttons.save')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddVaccinationForm;