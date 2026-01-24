// src/components/vaccination/AddVaccinationForm.jsx
import { useState } from "react";
import { FaSyringe, FaCalendar } from "react-icons/fa";
import "./../../styles/vaccination.css";

const AddVaccinationForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    livestock: "",
    vaccineName: "",
    vaccineType: "",
    dateGiven: "",
    nextDueDate: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-body mb-1">Livestock</label>
            <select
              name="livestock"
              value={formData.livestock}
              onChange={handleChange}
              required
              className="w-full p-2 border border-light rounded"
            >
              <option value="">Select livestock</option>
              <option value="COW-001">COW-001 - Bessie</option>
              <option value="COW-002">COW-002 - Daisy</option>
              <option value="COW-003">COW-003 - Molly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">Vaccine Name</label>
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
            <label className="block text-sm font-medium text-body mb-1">Vaccine Type</label>
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
              <label className="block text-sm font-medium text-body mb-1">Date Given</label>
              <div className="relative">
                <input
                  type="date"
                  name="dateGiven"
                  value={formData.dateGiven}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-light rounded"
                />
                <FaCalendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Next Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="nextDueDate"
                  value={formData.nextDueDate}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-light rounded"
                />
                <FaCalendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              </div>
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
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-green-800"
            >
              Save Vaccination
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddVaccinationForm;