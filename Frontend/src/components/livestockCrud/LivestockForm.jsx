// src/components/LivestockForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaImage, FaChevronDown } from "react-icons/fa";
import { getAllSpecies, getAllBreeds, previewNextTagId } from "../../services/livestockCrudApi";

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
        remarks: initialData.remarks || "",
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
      remarks: "",
      image: null,
      imagePreview: null,
    };
  };

  const [formData, setFormData] = useState(getInitialFormState());
  const [speciesList, setSpeciesList] = useState([]);
  const [breedsList, setBreedsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [speciesInput, setSpeciesInput] = useState("");
  const [breedInput, setBreedInput] = useState("");
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);

  // Fetch species and breeds on mount
  useEffect(() => {
    fetchSpeciesAndBreeds();
    // Fetch preview tag ID only when adding new livestock (not editing)
    if (!isEditing) {
      fetchPreviewTagId();
    }
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
      // Ensure data is an array
      const speciesData = Array.isArray(speciesResult.data) ? speciesResult.data : [];
      setSpeciesList(speciesData);
      console.log('Species loaded:', speciesData);
      
      // Set initial species input if editing
      if (initialData && initialData.species) {
        const selectedSpecies = speciesData.find(s => s.id === initialData.species);
        if (selectedSpecies) {
          setSpeciesInput(selectedSpecies.name);
        }
      }
    } else {
      console.error('Failed to load species:', speciesResult.error);
      setSpeciesList([]);
    }
    
    // If editing and has species, fetch breeds for that species
    if (initialData && initialData.species) {
      await fetchBreedsBySpecies(initialData.species);
    }
    
    setLoading(false);
  };

  const fetchPreviewTagId = async () => {
    const result = await previewNextTagId();
    if (result.success && result.data.tag_id) {
      setFormData(prev => ({ ...prev, tag_id: result.data.tag_id }));
      console.log('Preview Tag ID:', result.data.tag_id);
    }
  };

  const fetchBreedsBySpecies = async (speciesId) => {
    const breedsResult = await getAllBreeds(speciesId);
    if (breedsResult.success) {
      // Ensure data is an array
      const breedsData = Array.isArray(breedsResult.data) ? breedsResult.data : [];
      setBreedsList(breedsData);
      console.log('Breeds loaded for species', speciesId, ':', breedsData);
      
      // Set initial breed input if editing
      if (initialData && initialData.breed) {
        const selectedBreed = breedsData.find(b => b.id === initialData.breed);
        if (selectedBreed) {
          setBreedInput(selectedBreed.name);
        }
      }
    } else {
      console.error('Failed to load breeds:', breedsResult.error);
      setBreedsList([]);
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

  // Handle species input change (for typing/searching)
  const handleSpeciesInputChange = (e) => {
    const value = e.target.value;
    setSpeciesInput(value);
    setShowSpeciesDropdown(true);
    
    // Clear species selection if user is typing
    if (formData.species) {
      setFormData({ ...formData, species: "", breed: "" });
      setBreedsList([]);
      setBreedInput("");
    }
  };

  // Handle species selection from dropdown
  const handleSpeciesSelect = (species) => {
    setSpeciesInput(species.name);
    setFormData({ ...formData, species: species.id, breed: "" });
    setShowSpeciesDropdown(false);
    setBreedInput("");
    fetchBreedsBySpecies(species.id);
  };

  // Handle breed input change (for typing/searching)
  const handleBreedInputChange = (e) => {
    const value = e.target.value;
    setBreedInput(value);
    setShowBreedDropdown(true);
    
    // Clear breed selection if user is typing
    if (formData.breed) {
      setFormData({ ...formData, breed: "" });
    }
  };

  // Handle breed selection from dropdown
  const handleBreedSelect = (breed) => {
    setBreedInput(breed.name);
    setFormData({ ...formData, breed: breed.id });
    setShowBreedDropdown(false);
  };

  // Filter species based on input
  const filteredSpecies = speciesList.filter(species =>
    species.name.toLowerCase().includes(speciesInput.toLowerCase())
  );

  // Filter breeds based on input
  const filteredBreeds = breedsList.filter(breed =>
    breed.name.toLowerCase().includes(breedInput.toLowerCase())
  );

  // Toggle dropdown for species
  const toggleSpeciesDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle species dropdown clicked');
    console.log('Current showSpeciesDropdown:', showSpeciesDropdown);
    console.log('Species list length:', speciesList.length);
    console.log('Species list:', speciesList);
    const newState = !showSpeciesDropdown;
    setShowSpeciesDropdown(newState);
    console.log('New showSpeciesDropdown state:', newState);
  };

  // Toggle dropdown for breed
  const toggleBreedDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle breed dropdown clicked');
    console.log('Current showBreedDropdown:', showBreedDropdown);
    console.log('Breed list length:', breedsList.length);
    console.log('Breed list:', breedsList);
    console.log('Has species selected:', !!formData.species);
    if (formData.species) {
      const newState = !showBreedDropdown;
      setShowBreedDropdown(newState);
      console.log('New showBreedDropdown state:', newState);
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
    
    // Prepare form data with proper species/breed handling
    const submitData = { ...formData };
    
    // If species is not selected but user typed something, use the typed value
    if (!submitData.species && speciesInput.trim()) {
      submitData.species = speciesInput.trim();
    }
    
    // If breed is not selected but user typed something, use the typed value
    if (!submitData.breed && breedInput.trim()) {
      submitData.breed = breedInput.trim();
    }
    
    onSubmit(submitData);
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
        {/* Tag ID - Auto-generated, Read-only */}
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium w-24">Tag ID</label>
          <input
            type="text"
            name="tag_id"
            value={formData.tag_id || "Auto-generated"}
            readOnly
            disabled
            className="flex-1 border rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            placeholder="Will be auto-generated"
          />
        </div>

        {/* Species - Searchable Dropdown */}
        <div className="flex items-center space-x-3 relative">
          <label className="block text-sm font-medium w-24">Species</label>
          <div className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                value={speciesInput}
                onChange={handleSpeciesInputChange}
                onFocus={() => setShowSpeciesDropdown(true)}
                onBlur={() => setTimeout(() => setShowSpeciesDropdown(false), 300)}
                placeholder="Type or select species"
                required
                className="w-full border rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition"
              />
              <button
                type="button"
                onMouseDown={toggleSpeciesDropdown}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition"
              >
                <FaChevronDown className={`transition-transform ${showSpeciesDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {showSpeciesDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {speciesList.length > 0 ? (
                  filteredSpecies.length > 0 ? (
                    filteredSpecies.map((species) => (
                      <div
                        key={species.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSpeciesSelect(species);
                        }}
                        className="px-4 py-2 hover:bg-green-50 cursor-pointer transition"
                      >
                        {species.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-center">
                      No species found matching "{speciesInput}"
                    </div>
                  )
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center">
                    Loading species...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Breed - Searchable Dropdown */}
        <div className="flex items-center space-x-3 relative">
          <label className="block text-sm font-medium w-24">Breed</label>
          <div className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                value={breedInput}
                onChange={handleBreedInputChange}
                onFocus={() => setShowBreedDropdown(true)}
                onBlur={() => setTimeout(() => setShowBreedDropdown(false), 300)}
                placeholder={formData.species ? "Type or select breed" : "Select species first"}
                required
                disabled={!formData.species}
                className="w-full border rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onMouseDown={toggleBreedDropdown}
                disabled={!formData.species}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <FaChevronDown className={`transition-transform ${showBreedDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {showBreedDropdown && formData.species && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {breedsList.length > 0 ? (
                  filteredBreeds.length > 0 ? (
                    filteredBreeds.map((breed) => (
                      <div
                        key={breed.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleBreedSelect(breed);
                        }}
                        className="px-4 py-2 hover:bg-green-50 cursor-pointer transition"
                      >
                        {breed.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-center">
                      No breeds found matching "{breedInput}"
                    </div>
                  )
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center">
                    Loading breeds...
                  </div>
                )}
              </div>
            )}
          </div>
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
