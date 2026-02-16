// src/components/LivestockForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaImage } from "react-icons/fa";
import { getAllSpecies, getAllBreeds } from "../../services/livestockCrudApi";

const LivestockForm = ({ initialData = null, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();

  // Initialize form state
  const getInitialFormState = () => {
    if (initialData) {
      return {
        tag_id: initialData.tag_id || "",
        species: initialData.species || "",
        breed: initialData.breed || "",
        date_of_birth: initialData.date_of_birth || "",
        gender: initialData.gender || "",
        color: initialData.color || "",
        weight: initialData.weight || "",
        health_status: initialData.health_status || "",
        purchase_date: initialData.purchase_date || "",
        purchase_price: initialData.purchase_price || "",
        remarks: initialData.remarks || "",
        pen_location: initialData.pen_location || "",
        image: null,
        imagePreview: initialData.image_preview || null,
      };
    }
    return {
      tag_id: "",
      species: "",
      breed: "",
      date_of_birth: "",
      gender: "",
      color: "",
      weight: "",
      health_status: "",
      purchase_date: "",
      purchase_price: "",
      remarks: "",
      pen_location: "",
      image: null,
      imagePreview: null,
    };
  };

  const [formData, setFormData] = useState(getInitialFormState());
  const [speciesList, setSpeciesList] = useState([]);
  const [breedsList, setBreedsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch species and breeds on mount
  useEffect(() => {
    fetchSpeciesAndBreeds();
  }, []);

  // Fetch breeds when species changes
  useEffect(() => {
    if (formData.species) {
      fetchBreedsBySpecies(formData.species);
    } else {
      setBreedsList([]);
    }
  }, [formData.species]);

  const fetchSpeciesAndBreeds = async () => {
    setLoading(true);
    const speciesResult = await getAllSpecies();
    
    if (speciesResult.success) {
      setSpeciesList(speciesResult.data);
    }
    
    // If editing and has species, fetch breeds for that species
    if (initialData && initialData.species) {
      await fetchBreedsBySpecies(initialData.species);
    }
    
    setLoading(false);
  };

  const fetchBreedsBySpecies = async (speciesId) => {
    const breedsResult = await getAllBreeds(speciesId);
    if (breedsResult.success) {
      setBreedsList(breedsResult.data);
    }
  };

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
    onSubmit(formData);
  };

  // Cancel handler
  const handleCancel = () => {
    navigate("/livestock");
  };

  if (loading) {
    return (
      <div className="livestock-form-card">
        <p className="text-center text-gray-600">Loading form...</p>
      </div>
    );
  }

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
            name="tag_id"
            value={formData.tag_id}
            onChange={handleChange}
            required
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Species */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Species</label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          >
            <option value="">Select Species</option>
            {speciesList.map((species) => (
              <option key={species.id} value={species.id}>
                {species.name}
              </option>
            ))}
          </select>
        </div>

        {/* Breed */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Breed</label>
          <select
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            required
            disabled={!formData.species}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition disabled:bg-gray-100"
          >
            <option value="">Select Breed</option>
            {breedsList.map((breed) => (
              <option key={breed.id} value={breed.id}>
                {breed.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date of Birth */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">DOB</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
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
          <label className="block text-sm font-medium w-24">Weight (kg)</label>
          <input
            type="number"
            step="0.01"
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
            name="health_status"
            value={formData.health_status}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          >
            <option value="">Select</option>
            <option value="Healthy">Healthy</option>
            <option value="Under Treatment">Under Treatment</option>
            <option value="Critical">Critical</option>
            <option value="Deceased">Deceased</option>
          </select>
        </div>

        {/* Purchase Date */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Purchase</label>
          <input
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Purchase Price */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Price</label>
          <input
            type="number"
            step="0.01"
            name="purchase_price"
            value={formData.purchase_price}
            onChange={handleChange}
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
          />
        </div>

        {/* Pen Location */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Pen Location</label>
          <input
            type="text"
            name="pen_location"
            value={formData.pen_location}
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
