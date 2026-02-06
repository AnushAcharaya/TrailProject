import React, { useState } from "react";
import { FiCalendar, FiUser, FiFileText, FiClock } from "react-icons/fi";
import { MdPets } from "react-icons/md";
import "../../styles/appointments.css";

const AppointmentRequestForm = () => {
  const [formData, setFormData] = useState({
    veterinarian: "",
    animalType: "",
    reason: "",
    preferredDate: "",
    preferredTime: "",
  });

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeSelect = (time) => {
    setFormData((prev) => ({
      ...prev,
      preferredTime: time,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add API call here
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Select Veterinarian */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FiUser className="text-green-600" size={20} />
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Select Veterinarian <span className="text-red-500">*</span>
          </label>
        </div>
        <select
          name="veterinarian"
          value={formData.veterinarian}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
        >
          <option value="">Choose a veterinarian</option>
          <option value="dr-smith">Dr. John Smith</option>
          <option value="dr-jones">Dr. Sarah Jones</option>
          <option value="dr-wilson">Dr. Michael Wilson</option>
        </select>
      </div>

      {/* Animal Type and Reason */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdPets className="text-blue-600" size={22} />
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Animal Type <span className="text-red-500">*</span>
            </label>
          </div>
          <select
            name="animalType"
            value={formData.animalType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
          >
            <option value="">Select animal type</option>
            <option value="cattle">Cattle</option>
            <option value="sheep">Sheep</option>
            <option value="goat">Goat</option>
            <option value="pig">Pig</option>
            <option value="poultry">Poultry</option>
          </select>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiFileText className="text-purple-600" size={20} />
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
          </div>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe the issue or reason for the appointment..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-gray-700"
          />
        </div>
      </div>

      {/* Preferred Date and Time */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferred Date */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-orange-600" size={20} />
              </div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Date <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
            </div>
          </div>

          {/* Preferred Time */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <FiClock className="text-teal-600" size={20} />
              </div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Time <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    formData.preferredTime === time
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-green-500"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          Request Appointment
        </button>
      </div>
    </form>
  );
};

export default AppointmentRequestForm;
