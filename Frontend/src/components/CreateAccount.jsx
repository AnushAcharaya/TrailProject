import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Upload, LogIn } from "lucide-react";

const CreateAccount = () => {
  
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    address: "",
    email: "",
    password: "",
    role: "",
    farmName: "",
    nidPhoto: null,
    certificatePhoto: null,
    specialization: "",
    phone: "",
  });




  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    alert("Account creation request submitted successfully!");
  };

  const handleGoogleLogin = () => {
    // Redirect to Django backend Google OAuth endpoint
    window.location.href = 'http://localhost:8000/auth/login/google-oauth2/';
  };

  const formVariant = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="section-bg w-full flex justify-center px-4 sm:px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 sm:p-10"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-6 justify-center">
          <UserPlus className="text-primary-dark w-10 h-10 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark text-center">
            Create Account
          </h1>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Helper to create horizontal label + input */}
          {[
            { label: "Username", name: "username", type: "text", placeholder: "Username" },
            { label: "Full Name", name: "fullName", type: "text", placeholder: "Full Name" },
            { label: "Address", name: "address", type: "text", placeholder: "Address" },
            { label: "Phone", name: "phone", type: "text", placeholder: "Phone" },
            { label: "Email", name: "email", type: "email", placeholder: "Email" },
            { label: "Password", name: "password", type: "password", placeholder: "Password" },
          ].map((field) => (
            <div key={field.name} className="flex items-center justify-between gap-4 w-full">
              <label className="w-1/4 text-right font-medium">{field.label}:</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                placeholder={field.placeholder}
                className="w-1/2 input-field py-1 px-2 border rounded"
              />
            </div>
          ))}

          {/* Role Selector */}
          <div className="flex items-center justify-between gap-4 w-full">
            <label className="w-1/4 text-right font-medium">Role:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-1/2 input-field py-1 px-2 border rounded bg-white"
            >
              <option value="">Select your role</option>
              <option value="farmer">Farmer</option>
              <option value="vet">Veterinarian</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Conditional Fields */}
          <AnimatePresence mode="wait">
            {formData.role === "farmer" && (
              <motion.div
                key="farmerFields"
                variants={formVariant}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.4 }}
                className="space-y-4 bg-green-50 p-4 rounded-xl"
              >
                <div className="flex items-center justify-between gap-4 w-full">
                  <label className="w-1/4 text-right font-medium">Farm Name:</label>
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    required
                    placeholder="Farm Name"
                    className="w-1/2 input-field py-1 px-2 border rounded"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 w-full">
                  <label className="w-1/4 text-right font-medium">NID Photo:</label>
                  <label className="upload-box flex items-center gap-2 p-2 border rounded-lg cursor-pointer w-1/2">
                    <Upload className="text-green-700" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      name="nidPhoto"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {formData.role === "vet" && (
              <motion.div
                key="vetFields"
                variants={formVariant}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.4 }}
                className="space-y-4 bg-green-50 p-4 rounded-xl"
              >
                <div className="flex items-center justify-between gap-4 w-full">
                  <label className="w-1/4 text-right font-medium">Specialization:</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder="Specialization"
                    className="w-1/2 input-field py-1 px-2 border rounded"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 w-full">
                  <label className="w-1/4 text-right font-medium">Certificate:</label>
                  <label className="upload-box flex items-center gap-2 p-2 border rounded-lg cursor-pointer w-1/2">
                    <Upload className="text-green-700" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      name="certificatePhoto"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {formData.role === "admin" && (
              <motion.div
                key="adminFields"
                variants={formVariant}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.4 }}
                className="bg-green-50 p-4 rounded-xl text-center"
              >
                <p className="text-sm sm:text-base text-gray-700 italic">
                  Admin accounts have system-level access. Proceed carefully.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Login Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleGoogleLogin}
            className="btn-google mx-auto block py-2 px-4 mt-4 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            <LogIn className="inline w-4 h-4 mr-2" />
            Login with Google
          </motion.button>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="btn-primary mx-auto block py-2 px-6 mt-4 text-sm sm:text-base"
          >
            Create Account
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
};

export default CreateAccount;
