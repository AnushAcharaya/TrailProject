// src/components/medicalHistory/TreatmentForm.jsx
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import PrimaryButton from "./PrimaryButton";
import { getAllLivestock } from "../../services/livestockCrudApi";
import "./../../styles/medicalHistory.css";

const TreatmentForm = ({ initialData = null, onSubmit, isEdit = false }) => {
  const { t } = useTranslation('medical');
  console.log('[TreatmentForm] initialData:', initialData);
  console.log('[TreatmentForm] initialData.medicines:', initialData?.medicines);
  
  // Get logged-in user's info from localStorage
  const getLoggedInUser = () => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          name: user.full_name || user.username || "",
          role: user.role || ""
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
        return { name: "", role: "" };
      }
    }
    return { name: "", role: "" };
  };

  const loggedInUser = getLoggedInUser();
  const isVet = loggedInUser.role === 'vet';

  console.log('[TreatmentForm] ========== INITIALIZATION ==========');
  console.log('[TreatmentForm] Logged in user:', loggedInUser);
  console.log('[TreatmentForm] User role:', loggedInUser.role);
  console.log('[TreatmentForm] Is vet?:', isVet);
  console.log('[TreatmentForm] Is farmer?:', loggedInUser.role === 'farmer');
  console.log('[TreatmentForm] ==========================================');

  const [formData, setFormData] = useState({
    livestockTag: initialData?.livestockTag || "",
    treatmentName: initialData?.treatmentName || "",
    diagnosis: initialData?.diagnosis || "",
    vetName: initialData?.vetName || (isVet ? loggedInUser.name : ""),
    treatmentDate: initialData?.treatmentDate || "",
    nextTreatmentDate: initialData?.nextTreatmentDate || "",
    status: initialData?.status || "In Progress",
    document: null,
    medicines: initialData?.medicines || [
      {
        name: "",
        dosage: "",
        frequency: 1,
        duration: 3,
        scheduleType: "interval", // "exact" or "interval"
        startTime: "08:00",
        intervalHours: 5,
        exactTimes: ["08:00"],
      },
    ],
  });

  console.log('[TreatmentForm] formData.medicines:', formData.medicines);

  const [livestockList, setLivestockList] = useState([]);
  const [filteredLivestock, setFilteredLivestock] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialData?.livestockTag || "");
  const [isLoadingLivestock, setIsLoadingLivestock] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Vet autocomplete states
  const [vetSuggestions, setVetSuggestions] = useState([]);
  const [showVetDropdown, setShowVetDropdown] = useState(false);

  // Update form data when initialData changes - BUT ONLY ONCE!
  useEffect(() => {
    if (initialData && !isInitialized) {
      console.log('[TreatmentForm] FIRST TIME initialData load, updating form');
      console.log('[TreatmentForm] New medicines:', initialData.medicines);
      setFormData({
        livestockTag: initialData.livestockTag || "",
        treatmentName: initialData.treatmentName || "",
        diagnosis: initialData.diagnosis || "",
        vetName: initialData.vetName || (isVet ? loggedInUser.name : ""),
        treatmentDate: initialData.treatmentDate || "",
        nextTreatmentDate: initialData.nextTreatmentDate || "",
        status: initialData.status || "In Progress",
        document: null,
        medicines: initialData.medicines || [
          {
            name: "",
            dosage: "",
            frequency: 1,
            duration: 3,
            scheduleType: "interval",
            startTime: "08:00",
            intervalHours: 5,
            exactTimes: ["08:00"],
          },
        ],
      });
      setSearchTerm(initialData.livestockTag || "");
      setIsInitialized(true); // Mark as initialized so this doesn't run again
    }
  }, [initialData, isInitialized, isVet, loggedInUser.name]);

  useEffect(() => {
    // Fetch livestock from API
    const fetchLivestock = async () => {
      setIsLoadingLivestock(true);
      
      // Check if coming from vet dashboard - get farmer's username from localStorage
      const farmerUsername = localStorage.getItem('selectedFarmerUsername');
      const params = farmerUsername ? { owner: farmerUsername } : {};
      
      console.log('[TreatmentForm] Fetching livestock with params:', params);
      const result = await getAllLivestock(params);
      
      if (result.success) {
        // Handle paginated response
        const livestock = result.data.results || result.data;
        console.log('[TreatmentForm] Fetched livestock:', livestock);
        setLivestockList(livestock);
        setFilteredLivestock(livestock);
      } else {
        console.error("Failed to load livestock:", result.error);
      }
      setIsLoadingLivestock(false);
    };
    
    fetchLivestock();
  }, []);

  // Auto-fill livestock if coming from vet dashboard (only for new forms, not edits)
  useEffect(() => {
    if (!isEdit && livestockList.length > 0 && !initialData) {
      const selectedTag = localStorage.getItem('selectedAnimalTag');
      
      if (selectedTag) {
        // Find the animal in the list
        const animal = livestockList.find(a => a.tag_id === selectedTag);
        if (animal) {
          const displayText = `${animal.tag_id} - ${animal.breed_name} (${animal.species_name})`;
          setSearchTerm(displayText);
          setFormData(prev => ({ ...prev, livestockTag: animal.tag_id }));
        }
      }
    }
  }, [livestockList, isEdit, initialData]); // Run when livestock list is loaded

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
    const displayText = `${animal.tag_id} - ${animal.breed_name} (${animal.species_name})`;
    setSearchTerm(displayText);
    setFormData({ ...formData, livestockTag: animal.tag_id });
    setShowDropdown(false);
  };

  // Fetch vet suggestions from API
  const fetchVetSuggestions = async (search) => {
    console.log('[TreatmentForm][fetchVetSuggestions] ========== CALLED ==========');
    console.log('[TreatmentForm][fetchVetSuggestions] Search term:', search);
    console.log('[TreatmentForm][fetchVetSuggestions] Search length:', search ? search.length : 0);
    
    if (!search || search.trim().length < 2) {
      console.log('[TreatmentForm][fetchVetSuggestions] Search term too short, clearing suggestions');
      setVetSuggestions([]);
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const url = `http://localhost:8000/api/v1/auth/vets/?search=${encodeURIComponent(search)}`;
      console.log('[TreatmentForm][fetchVetSuggestions] Calling API:', url);
      console.log('[TreatmentForm][fetchVetSuggestions] Token:', token ? `${token.substring(0, 20)}...` : 'Missing');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[TreatmentForm][fetchVetSuggestions] Response status:', response.status);
      console.log('[TreatmentForm][fetchVetSuggestions] Response OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[TreatmentForm][fetchVetSuggestions] Response data:', data);
        console.log('[TreatmentForm][fetchVetSuggestions] data.success:', data.success);
        console.log('[TreatmentForm][fetchVetSuggestions] data.vets:', data.vets);
        if (data.success) {
          console.log('[TreatmentForm][fetchVetSuggestions] Setting vet suggestions:', data.vets);
          setVetSuggestions(data.vets || []);
        } else {
          console.log('[TreatmentForm][fetchVetSuggestions] API returned success=false');
        }
      } else {
        const errorData = await response.json();
        console.error('[TreatmentForm][fetchVetSuggestions] Response not OK:', response.status, errorData);
      }
    } catch (error) {
      console.error('[TreatmentForm][fetchVetSuggestions] Error:', error);
      console.error('[TreatmentForm][fetchVetSuggestions] Error stack:', error.stack);
    }
  };

  // Handle vet name input change
  const handleVetNameChange = (e) => {
    const value = e.target.value;
    console.log('[TreatmentForm][handleVetNameChange] ========== CALLED ==========');
    console.log('[TreatmentForm][handleVetNameChange] Value:', value);
    console.log('[TreatmentForm][handleVetNameChange] Value length:', value.length);
    console.log('[TreatmentForm][handleVetNameChange] isVet:', isVet);
    console.log('[TreatmentForm][handleVetNameChange] loggedInUser:', loggedInUser);
    setFormData({ ...formData, vetName: value });
    setShowVetDropdown(true);
    
    // Fetch suggestions after user types
    console.log('[TreatmentForm][handleVetNameChange] About to call fetchVetSuggestions');
    fetchVetSuggestions(value);
  };

  // Handle vet selection from dropdown
  const handleVetSelect = (vetName) => {
    setFormData({ ...formData, vetName: vetName });
    setShowVetDropdown(false);
    setVetSuggestions([]);
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [
        ...formData.medicines,
        {
          name: "",
          dosage: "",
          frequency: 1,
          duration: 3,
          scheduleType: "interval",
          startTime: "08:00",
          intervalHours: 5,
          exactTimes: ["08:00", "13:00", "18:00"],
        },
      ],
    });
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const updated = [...formData.medicines];
      updated.splice(index, 1);
      setFormData({ ...formData, medicines: updated });
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...formData.medicines];
    updated[index][field] = value;
    
    // When frequency changes, adjust exactTimes array to match
    if (field === 'frequency') {
      const newFrequency = Number(value);
      const currentTimes = updated[index].exactTimes || [];
      
      // Resize exactTimes array to match frequency
      if (currentTimes.length < newFrequency) {
        // Add more times if needed
        const defaultTimes = ["08:00", "13:00", "18:00"];
        while (currentTimes.length < newFrequency) {
          currentTimes.push(defaultTimes[currentTimes.length] || "08:00");
        }
      } else if (currentTimes.length > newFrequency) {
        // Remove extra times
        currentTimes.splice(newFrequency);
      }
      
      updated[index].exactTimes = currentTimes;
    }
    
    setFormData({ ...formData, medicines: updated });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setFormData({ ...formData, document: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('[TreatmentForm] ========== FORM SUBMIT ==========');
    console.log('[TreatmentForm] formData.medicines BEFORE validation:', formData.medicines);
    console.log('[TreatmentForm] medicines count:', formData.medicines.length);
    console.log('[TreatmentForm] medicines array:', JSON.stringify(formData.medicines, null, 2));
    
    // Validate that at least one medicine has all required fields filled
    const hasValidMedicine = formData.medicines.some(med => 
      med.name.trim() !== "" && med.dosage.trim() !== ""
    );
    
    console.log('[TreatmentForm] hasValidMedicine:', hasValidMedicine);
    
    if (!hasValidMedicine) {
      alert(t('form.validation.required') || 'Please fill in at least one medicine with name and dosage');
      console.error('[TreatmentForm] ⚠️ VALIDATION FAILED - No valid medicines!');
      return;
    }
    
    // Filter out empty medicines and trim exactTimes to match frequency
    const validMedicines = formData.medicines
      .filter(med => med.name.trim() !== "" && med.dosage.trim() !== "")
      .map(med => ({
        ...med,
        exactTimes: med.scheduleType === "exact"
          ? (med.exactTimes || []).slice(0, med.frequency)
          : med.exactTimes,
      }));
    
    console.log('[TreatmentForm] Valid medicines AFTER filtering:', validMedicines);
    console.log('[TreatmentForm] Valid medicines count:', validMedicines.length);
    console.log('[TreatmentForm] Valid medicines JSON:', JSON.stringify(validMedicines, null, 2));
    
    if (validMedicines.length === 0) {
      alert('Please add at least one medicine with name and dosage');
      console.error('[TreatmentForm] ⚠️ NO VALID MEDICINES AFTER FILTERING!');
      return;
    }
    
    const dataToSubmit = {
      ...formData,
      medicines: validMedicines
    };
    
    console.log('[TreatmentForm] ========== FINAL DATA TO SUBMIT ==========');
    console.log('[TreatmentForm] dataToSubmit:', dataToSubmit);
    console.log('[TreatmentForm] dataToSubmit.medicines:', dataToSubmit.medicines);
    console.log('[TreatmentForm] dataToSubmit.medicines length:', dataToSubmit.medicines.length);
    console.log('[TreatmentForm] dataToSubmit.medicines[0]:', dataToSubmit.medicines[0]);
    console.log('[TreatmentForm] =====================================');
    
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="treatment-form-gradient">
      <div className="space-y-5">
        {/* Livestock Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-body mb-1">{t('form.livestock')} *</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleLivestockSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder={t('form.livestockPlaceholder')}
            required
            className="w-full p-2 border border-light rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          {/* Dropdown List */}
          {showDropdown && filteredLivestock.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredLivestock.map((animal, index) => (
                <div
                  key={index}
                  onClick={() => handleLivestockSelect(animal)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {t('form.livestockInfo.tag')}: {animal.tag_id}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>{t('form.livestockInfo.breed')}: {animal.breed_name} ({animal.species_name})</span>
                    {animal.age && <span> | {t('form.livestockInfo.age')}: {animal.age} {t('form.livestockInfo.years')}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* No Results Message */}
          {showDropdown && searchTerm && filteredLivestock.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <p className="text-gray-500 text-sm">{t('form.noLivestock', { search: searchTerm })}</p>
            </div>
          )}
        </div>

        {/* Treatment Name */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">{t('form.treatmentName')} *</label>
          <input
            type="text"
            name="treatmentName"
            value={formData.treatmentName}
            onChange={handleChange}
            placeholder={t('form.treatmentNamePlaceholder')}
            required
            className="w-full p-2 border border-light rounded"
          />
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">{t('form.diagnosis')}</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder={t('form.diagnosisPlaceholder')}
            rows="3"
            className="w-full p-2 border border-light rounded"
          />
        </div>

        {/* Medicines Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-body">{t('form.medicines')} *</label>
            <button
              type="button"
              onClick={addMedicine}
              className="text-secondary text-sm font-medium"
            >
              {t('form.addAnother')}
            </button>
          </div>

          {formData.medicines.map((med, index) => (
            <div key={index} className="border border-light rounded p-4 mb-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                {/* Medicine Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-muted mb-1">{t('form.medicineName')}</label>
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                    placeholder={t('form.medicineNamePlaceholder')}
                    required
                    className="w-full p-2 border border-light rounded text-sm"
                  />
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-xs text-muted mb-1">{t('form.dosage')}</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                    placeholder={t('form.dosagePlaceholder')}
                    required
                    className="w-full p-2 border border-light rounded text-sm"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs text-muted mb-1">{t('form.frequency')}</label>
                  <select
                    value={med.frequency}
                    onChange={(e) => handleMedicineChange(index, "frequency", Number(e.target.value))}
                    className="w-full p-2 border border-light rounded text-sm"
                  >
                    <option value={1}>{t('form.frequencyOptions.once')}</option>
                    <option value={2}>{t('form.frequencyOptions.twice')}</option>
                    <option value={3}>{t('form.frequencyOptions.three')}</option>
                  </select>
                </div>
              </div>

              {/* Schedule Type Toggle */}
              <div className="mb-3">
                <label className="block text-xs text-muted mb-1">{t('form.scheduleType')}</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`schedule-${index}`}
                      checked={med.scheduleType === "interval"}
                      onChange={() => handleMedicineChange(index, "scheduleType", "interval")}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('form.scheduleInterval')}</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`schedule-${index}`}
                      checked={med.scheduleType === "exact"}
                      onChange={() => handleMedicineChange(index, "scheduleType", "exact")}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('form.scheduleExact')}</span>
                  </label>
                </div>
              </div>

              {/* Schedule Settings */}
              {med.scheduleType === "interval" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">{t('form.startTime')}</label>
                    <input
                      type="time"
                      value={med.startTime}
                      onChange={(e) => handleMedicineChange(index, "startTime", e.target.value)}
                      className="w-full p-2 border border-light rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">{t('form.intervalHours')}</label>
                    <input
                      type="number"
                      min="1"
                      value={med.intervalHours}
                      onChange={(e) => handleMedicineChange(index, "intervalHours", Number(e.target.value))}
                      className="w-full p-2 border border-light rounded text-sm"
                    />
                  </div>
                </div>
              )}

              {med.scheduleType === "exact" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[1, 2, 3].slice(0, med.frequency).map((i) => (
                    <div key={i}>
                      <label className="block text-xs text-muted mb-1">{t('form.exactTime', { number: i })}</label>
                      <input
                        type="time"
                        value={med.exactTimes[i - 1] || ""}
                        onChange={(e) => {
                          const newTimes = [...med.exactTimes];
                          newTimes[i - 1] = e.target.value;
                          handleMedicineChange(index, "exactTimes", newTimes);
                        }}
                        className="w-full p-2 border border-light rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Duration */}
              <div className="mt-3">
                <label className="block text-xs text-muted mb-1">{t('form.duration')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={med.duration}
                    onChange={(e) => handleMedicineChange(index, "duration", Number(e.target.value))}
                    className="w-24 p-2 border border-light rounded text-sm"
                  />
                  <span className="text-sm text-muted self-center">{t('form.durationDays')}</span>
                  {formData.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-500 text-sm self-end ml-auto"
                    >
                      {t('form.remove')}
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Message */}
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                {med.scheduleType === "interval"
                  ? t('form.schedulePreview.interval', { hours: med.intervalHours, time: med.startTime })
                  : t('form.schedulePreview.exact', { times: med.exactTimes.slice(0, med.frequency).join(", ") })}
              </div>
            </div>
          ))}
        </div>

        {/* Vet Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-body mb-1">{t('form.vetName')}</label>
          <input
            type="text"
            name="vetName"
            value={formData.vetName}
            onChange={(e) => {
              console.log('[TreatmentForm] Vet name input onChange triggered');
              console.log('[TreatmentForm] Event value:', e.target.value);
              console.log('[TreatmentForm] isVet:', isVet);
              console.log('[TreatmentForm] Will call:', isVet ? 'handleChange' : 'handleVetNameChange');
              if (isVet) {
                handleChange(e);
              } else {
                handleVetNameChange(e);
              }
            }}
            onFocus={() => {
              console.log('[TreatmentForm] Vet name input onFocus triggered');
              console.log('[TreatmentForm] isVet:', isVet);
              console.log('[TreatmentForm] Will show dropdown:', !isVet);
              if (!isVet) {
                setShowVetDropdown(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowVetDropdown(false), 300)}
            placeholder={t('form.vetNamePlaceholder')}
            readOnly={isVet}
            autoComplete="off"
            className={`w-full p-2 border border-light rounded ${isVet ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          
          {/* Vet Suggestions Dropdown */}
          {!isVet && showVetDropdown && vetSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {vetSuggestions.map((vet, index) => (
                <div
                  key={vet.id || index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleVetSelect(vet.name);
                  }}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{vet.name}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* No Results Message */}
          {!isVet && showVetDropdown && formData.vetName && formData.vetName.length >= 2 && vetSuggestions.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <p className="text-gray-500 text-sm">No veterinarians found matching "{formData.vetName}"</p>
            </div>
          )}
        </div>

        {/* Treatment Date */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">{t('form.treatmentDate')} *</label>
          <input
            type="date"
            name="treatmentDate"
            value={formData.treatmentDate}
            onChange={handleChange}
            required
            className="w-full p-2 border border-light rounded"
          />
        </div>

        {/* Next Treatment Date (Optional) */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">
            {t('form.nextTreatmentDate')}
          </label>
          <input
            type="date"
            name="nextTreatmentDate"
            value={formData.nextTreatmentDate || ""}
            onChange={handleChange}
            className="w-full p-2 border border-light rounded"
          />
        </div>

        {/* Treatment Status */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">{t('form.status')} *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full p-2 border border-light rounded"
          >
            <option value="In Progress">{t('card.status.inProgress')}</option>
            <option value="Completed">{t('card.status.completed')}</option>
          </select>
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">{t('form.document')}</label>
          <input
            type="file"
            name="document"
            accept=".pdf,.jpg,.png"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.history.back()}
          >
            {t('buttons.cancel')}
          </button>
          <PrimaryButton type="submit">
            {isEdit ? t('buttons.update') : t('buttons.save')}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
};

export default TreatmentForm;