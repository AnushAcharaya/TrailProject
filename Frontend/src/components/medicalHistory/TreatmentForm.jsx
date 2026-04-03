// src/components/medicalHistory/TreatmentForm.jsx
import { useState, useEffect } from "react";
import PrimaryButton from "./PrimaryButton";
import { getAllLivestock } from "../../services/livestockCrudApi";
import "./../../styles/medicalHistory.css";

const TreatmentForm = ({ initialData = null, onSubmit, isEdit = false }) => {
  console.log('[TreatmentForm] initialData:', initialData);
  console.log('[TreatmentForm] initialData.medicines:', initialData?.medicines);
  
  const [formData, setFormData] = useState({
    livestockTag: initialData?.livestockTag || "",
    treatmentName: initialData?.treatmentName || "",
    diagnosis: initialData?.diagnosis || "",
    vetName: initialData?.vetName || "",
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
        exactTimes: ["08:00", "13:00", "18:00"], // for 3x/day
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

  // Update form data when initialData changes - BUT ONLY ONCE!
  useEffect(() => {
    if (initialData && !isInitialized) {
      console.log('[TreatmentForm] FIRST TIME initialData load, updating form');
      console.log('[TreatmentForm] New medicines:', initialData.medicines);
      setFormData({
        livestockTag: initialData.livestockTag || "",
        treatmentName: initialData.treatmentName || "",
        diagnosis: initialData.diagnosis || "",
        vetName: initialData.vetName || "",
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
            exactTimes: ["08:00", "13:00", "18:00"],
          },
        ],
      });
      setSearchTerm(initialData.livestockTag || "");
      setIsInitialized(true); // Mark as initialized so this doesn't run again
    }
  }, [initialData, isInitialized]);

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
    
    // Validate that at least one medicine has all required fields filled
    const hasValidMedicine = formData.medicines.some(med => 
      med.name.trim() !== "" && med.dosage.trim() !== ""
    );
    
    console.log('[TreatmentForm] hasValidMedicine:', hasValidMedicine);
    
    if (!hasValidMedicine) {
      alert("Please fill in at least one medicine with name and dosage.");
      return;
    }
    
    // Filter out empty medicines before submitting
    const validMedicines = formData.medicines.filter(med => 
      med.name.trim() !== "" && med.dosage.trim() !== ""
    );
    
    console.log('[TreatmentForm] Valid medicines AFTER filtering:', validMedicines);
    console.log('[TreatmentForm] Valid medicines count:', validMedicines.length);
    
    const dataToSubmit = {
      ...formData,
      medicines: validMedicines
    };
    
    console.log('[TreatmentForm] Final dataToSubmit:', dataToSubmit);
    console.log('[TreatmentForm] dataToSubmit.medicines:', dataToSubmit.medicines);
    console.log('[TreatmentForm] =====================================');
    
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="treatment-form-gradient">
      <div className="space-y-5">
        {/* Livestock Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-body mb-1">Livestock *</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleLivestockSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search by tag number, name, or breed..."
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
                    Tag: {animal.tag_id}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>Breed: {animal.breed_name} ({animal.species_name})</span>
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
        </div>

        {/* Treatment Name */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">Treatment Name *</label>
          <input
            type="text"
            name="treatmentName"
            value={formData.treatmentName}
            onChange={handleChange}
            placeholder="e.g., Deworming, Infection Treatment"
            required
            className="w-full p-2 border border-light rounded"
          />
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">Diagnosis / Description</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Describe condition or treatment plan"
            rows="3"
            className="w-full p-2 border border-light rounded"
          />
        </div>

        {/* Medicines Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-body">Medicines *</label>
            <button
              type="button"
              onClick={addMedicine}
              className="text-secondary text-sm font-medium"
            >
              + Add Another
            </button>
          </div>

          {formData.medicines.map((med, index) => (
            <div key={index} className="border border-light rounded p-4 mb-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                {/* Medicine Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-muted mb-1">What medicine?</label>
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                    placeholder="e.g., Ivermectin"
                    required
                    className="w-full p-2 border border-light rounded text-sm"
                  />
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-xs text-muted mb-1">How much each time?</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                    placeholder="e.g., 5 mL"
                    required
                    className="w-full p-2 border border-light rounded text-sm"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs text-muted mb-1">How many times per day?</label>
                  <select
                    value={med.frequency}
                    onChange={(e) => handleMedicineChange(index, "frequency", Number(e.target.value))}
                    className="w-full p-2 border border-light rounded text-sm"
                  >
                    <option value={1}>Once</option>
                    <option value={2}>Twice</option>
                    <option value={3}>Three times</option>
                  </select>
                </div>
              </div>

              {/* Schedule Type Toggle */}
              <div className="mb-3">
                <label className="block text-xs text-muted mb-1">How to schedule doses?</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`schedule-${index}`}
                      checked={med.scheduleType === "interval"}
                      onChange={() => handleMedicineChange(index, "scheduleType", "interval")}
                      className="mr-2"
                    />
                    <span className="text-sm">Every X hours</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`schedule-${index}`}
                      checked={med.scheduleType === "exact"}
                      onChange={() => handleMedicineChange(index, "scheduleType", "exact")}
                      className="mr-2"
                    />
                    <span className="text-sm">Set exact times</span>
                  </label>
                </div>
              </div>

              {/* Schedule Settings */}
              {med.scheduleType === "interval" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Start time</label>
                    <input
                      type="time"
                      value={med.startTime}
                      onChange={(e) => handleMedicineChange(index, "startTime", e.target.value)}
                      className="w-full p-2 border border-light rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Every how many hours?</label>
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
                      <label className="block text-xs text-muted mb-1">Time {i}</label>
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
                <label className="block text-xs text-muted mb-1">For how many days?</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={med.duration}
                    onChange={(e) => handleMedicineChange(index, "duration", Number(e.target.value))}
                    className="w-24 p-2 border border-light rounded text-sm"
                  />
                  <span className="text-sm text-muted self-center">days</span>
                  {formData.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-500 text-sm self-end ml-auto"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Message */}
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                {med.scheduleType === "interval"
                  ? `Doses every ${med.intervalHours} hours starting ${med.startTime}`
                  : `Doses at: ${med.exactTimes.slice(0, med.frequency).join(", ")}`}
              </div>
            </div>
          ))}
        </div>

        {/* Vet Name */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">Veterinarian Name</label>
          <input
            type="text"
            name="vetName"
            value={formData.vetName}
            onChange={handleChange}
            placeholder="e.g., Dr. Smith"
            className="w-full p-2 border border-light rounded"
          />
        </div>

        {/* Treatment Date */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">Treatment Start Date *</label>
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
            Next Follow-up
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
          <label className="block text-sm font-medium text-body mb-1">Treatment Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full p-2 border border-light rounded"
          >
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-body mb-1">Upload Medical Document (Optional)</label>
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
            Cancel
          </button>
          <PrimaryButton type="submit">
            {isEdit ? "Update Treatment" : "Save Treatment"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
};

export default TreatmentForm;