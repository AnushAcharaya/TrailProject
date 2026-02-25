// src/components/vaccination/EditVaccinationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSyringe } from "react-icons/fa";
import { getAllLivestock } from "../../services/livestockCrudApi";
import { getVaccinationById, updateVaccination } from "../../services/vaccinationApi";
import "./../../styles/vaccination.css";

const EditVaccinationForm = ({ vaccinationId }) => {
  const navigate = useNavigate();
  const [livestockList, setLivestockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    livestock: "",
    vaccineName: "",
    vaccineType: "",
    dateGiven: "",
    nextDueDate: "",
    notes: "",
  });

  // Fetch livestock and vaccination data on component mount
  useEffect(() => {
    fetchData();
  }, [vaccinationId]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch livestock list
    const livestockResult = await getAllLivestock();
    if (livestockResult.success) {
      const data = livestockResult.data.results || livestockResult.data;
      setLivestockList(Array.isArray(data) ? data : []);
    }

    // Fetch vaccination data
    const vaccinationResult = await getVaccinationById(vaccinationId);
    if (vaccinationResult.success) {
      const v = vaccinationResult.data;
      setFormData({
        livestock: v.livestock?.tag_id || "",
        vaccineName: v.vaccine_name || "",
        vaccineType: v.vaccine_type || "",
        dateGiven: v.date_given || "",
        nextDueDate: v.next_due_date || "",
        notes: v.notes || "",
      });
    } else {
      setNotification({ 
        type: 'error', 
        message: 'Failed to load vaccination data.' 
      });
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    const result = await updateVaccination(vaccinationId, formData);
    
    if (result.success) {
      setNotification({ 
        type: 'success', 
        message: 'Vaccination record updated successfully!' 
      });
      setTimeout(() => {
        navigate('/vaccination');
      }, 2000);
    } else {
      const errorMessage = typeof result.error === 'object' 
        ? Object.entries(result.error).map(([key, value]) => `${key}: ${value}`).join(', ')
        : result.error?.message || 'Failed to update vaccination record.';
      setNotification({ type: 'error', message: errorMessage });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-light max-w-2xl mx-auto">
        <p className="text-center text-gray-600">Loading vaccination data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-light max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-green-100 p-2 rounded">
          <FaSyringe className="text-green-700" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-body">Edit Vaccination Record</h2>
          <p className="text-sm text-muted">Update vaccination details</p>
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
          <div>
            <label className="block text-sm font-medium text-body mb-1">Livestock *</label>
            <select
              name="livestock"
              value={formData.livestock}
              onChange={handleChange}
              required
              className="w-full p-2 border border-light rounded"
            >
              <option value="">Select livestock</option>
              {livestockList.map((animal) => (
                <option key={animal.id} value={animal.tag_id}>
                  {animal.tag_id} - {animal.species_name}
                </option>
              ))}
            </select>
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
              {submitting ? 'Updating...' : 'Update Vaccination'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditVaccinationForm;
