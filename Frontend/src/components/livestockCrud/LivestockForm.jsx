// src/components/LivestockForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaImage } from "react-icons/fa";

const LivestockForm = ({ initialData = null, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();

  // Initialize form state
  const getInitialFormState = () => {
    if (initialData) {
      return {
        ...initialData,
        image: null, // We don't store File object, so reset file input
        imagePreview: initialData.imagePreview || null,
      };
    }
    return {
      tagId: "",
      livestockType: "",
      breed: "",
      dateOfBirth: "",
      age: "",
      gender: "",
      color: "",
      weight: "",
      healthStatus: "",
      purchaseDate: "",
      purchasePrice: "",
      remarks: "",
      image: null,
      imagePreview: null,
    };
  };

  const [formData, setFormData] = useState(getInitialFormState());

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({
            ...formData,
            image: file,
            imagePreview: reader.result,
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle drag & drop
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Parent handles saving
  };

  // Cancel handler
  const handleCancel = () => {
    navigate("/livestock");
  };

  return (
    <div className="livestock-form-card">
      <h2 className="text-2xl font-semibold mb-6 text-green-700">
        {isEditing ? "Edit Livestock" : "Add Livestock"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tag ID */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Tag ID</label>
          <input
            type="text"
            name="tagId"
            value={formData.tagId}
            onChange={handleChange}
            required
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Livestock Type */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Type</label>
          <input
            type="text"
            name="livestockType"
            value={formData.livestockType}
            onChange={handleChange}
            required
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Breed */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Breed</label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Date of Birth */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">DOB</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Age */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Gender */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Color */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Weight */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Weight</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Health Status */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Health</label>
          <select
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          >
            <option value="">Select</option>
            <option value="Healthy">Healthy</option>
            <option value="Under Treatment">Under Treatment</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Purchase Date */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Purchase</label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Purchase Price */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Price</label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Livestock Image</label>
          <div
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              formData.imagePreview
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-green-400"
            }`}
            onClick={() => document.getElementById("image-upload").click()}
          >
            {formData.imagePreview ? (
              <div>
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="mx-auto max-h-40 rounded object-cover"
                />
                <p className="mt-2 text-xs text-gray-500">Click to change image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FaImage className="text-4xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click or drag to upload</p>
                <p className="text-xs text-gray-400">JPG, PNG, GIF (max 5MB)</p>
              </div>
            )}
            <input
              id="image-upload"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Action Buttons - Cancel (Left) and Submit (Right) */}
        <div className="md:col-span-2 flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="form-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="form-submit-btn"
          >
            {isEditing ? "Update Livestock" : "Add Livestock"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LivestockForm;