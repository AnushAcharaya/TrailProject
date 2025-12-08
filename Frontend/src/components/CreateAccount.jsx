import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Upload, LogIn, Mail, Phone, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { registerUser, verifyEmailOTP, verifyPhoneOTP, resendEmailOTP, resendPhoneOTP } from "../services/api";

const CreateAccount = () => {
  const [step, setStep] = useState(1); // 1: Registration, 2: Success Message, 3: OTP Verification
  const [registeredUser, setRegisteredUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  const [otpData, setOtpData] = useState({
    emailOtp: "",
    phoneOtp: "",
  });
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Call the registration API
    const result = await registerUser(formData);
    
    if (result.success) {
      // Store user data and show success message
      setRegisteredUser({
        email: formData.email,
        phone: formData.phone,
      });
      setStep(2); // Show success message
      
      // Auto-move to OTP verification after 5 seconds
      setTimeout(() => {
        setStep(3);
      }, 5000);
    } else {
      // Handle registration error
      const errorMessage = result.error.message || JSON.stringify(result.error);
      alert(`Registration failed: ${errorMessage}`);
    }
  };

  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtpData({ ...otpData, [name]: value });
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    
    const result = await verifyEmailOTP(registeredUser.email, otpData.emailOtp);
    
    if (result.success) {
      setEmailVerified(true);
      alert('Email verified successfully!');
    } else {
      const errorMessage = result.error.message || JSON.stringify(result.error);
      alert(`Email verification failed: ${errorMessage}`);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    
    const result = await verifyPhoneOTP(registeredUser.phone, otpData.phoneOtp);
    
    if (result.success) {
      setPhoneVerified(true);
      alert('Phone verified successfully!');
    } else {
      const errorMessage = result.error.message || JSON.stringify(result.error);
      alert(`Phone verification failed: ${errorMessage}`);
    }
  };

  const handleResendOtp = async (type) => {
    let result;
    
    if (type === 'Email') {
      result = await resendEmailOTP(registeredUser.email);
    } else {
      result = await resendPhoneOTP(registeredUser.phone);
    }
    
    if (result.success) {
      alert(`${type} OTP has been resent!`);
    } else {
      const errorMessage = result.error.message || JSON.stringify(result.error);
      alert(`Failed to resend ${type} OTP: ${errorMessage}`);
    }
  };

  const handleGoogleLogin = () => {
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
          {step === 1 ? (
            <>
              <UserPlus className="text-primary-dark w-10 h-10 sm:w-8 sm:h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark text-center">
                Create Account
              </h1>
            </>
          ) : (
            <>
              <CheckCircle className="text-green-600 w-10 h-10 sm:w-8 sm:h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark text-center">
                Verify Your Account
              </h1>
            </>
          )}
        </div>

        {/* Step 1: Registration Form */}
        {step === 1 && (
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
                  <div className="w-1/2">
                    <label className="upload-box flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                      <Upload className="text-green-700" />
                      <span>{formData.nidPhoto ? formData.nidPhoto.name : 'Choose File'}</span>
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
                  <div className="w-1/2">
                    <label className="upload-box flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                      <Upload className="text-green-700" />
                      <span>{formData.certificatePhoto ? formData.certificatePhoto.name : 'Choose File'}</span>
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
        )}

        {/* Step 2: Success Message */}
        {step === 2 && registeredUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
              <p className="font-bold text-xl">Registration Completed!</p>
              <p className="text-base mt-2">Please verify your account.</p>
            </div>
            <div className="text-gray-600">
              <p className="text-sm">OTP codes have been sent to:</p>
              <p className="font-semibold mt-2">{registeredUser.email}</p>
              <p className="font-semibold">{registeredUser.phone}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span>Redirecting to verification page...</span>
            </div>
          </motion.div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && registeredUser && (
          <div className="space-y-6">
            <div className="text-center text-gray-700 mb-4">
              <p className="text-lg font-semibold">Verify Your Account</p>
              <p className="text-sm mt-2">Enter the OTP codes sent to:</p>
              <p className="font-semibold text-blue-600">{registeredUser.email}</p>
              <p className="font-semibold text-green-600">{registeredUser.phone}</p>
            </div>

            {/* Email OTP Verification */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-6 rounded-xl space-y-4 ${emailVerified ? 'bg-green-100 border-2 border-green-500' : 'bg-blue-50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className={`w-6 h-6 ${emailVerified ? 'text-green-600' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-semibold ${emailVerified ? 'text-green-900' : 'text-blue-900'}`}>
                    Email Verification
                  </h3>
                </div>
                {emailVerified && <CheckCircle className="w-6 h-6 text-green-600" />}
              </div>
              
              {!emailVerified ? (
                <>
                  <input
                    type="text"
                    name="emailOtp"
                    value={otpData.emailOtp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit email OTP"
                    maxLength="6"
                    className="w-full input-field py-2 px-4 border rounded-lg text-center text-2xl tracking-widest"
                  />
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleVerifyEmail}
                      disabled={otpData.emailOtp.length !== 6}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify Email
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleResendOtp('Email')}
                      className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                    >
                      Resend
                    </motion.button>
                  </div>
                </>
              ) : (
                <p className="text-green-700 font-semibold text-center">✓ Email Verified Successfully!</p>
              )}
            </motion.div>

            {/* Phone OTP Verification */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-6 rounded-xl space-y-4 ${phoneVerified ? 'bg-green-100 border-2 border-green-500' : 'bg-green-50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="text-green-600 w-6 h-6" />
                  <h3 className="text-lg font-semibold text-green-900">Phone Verification</h3>
                </div>
                {phoneVerified && <CheckCircle className="w-6 h-6 text-green-600" />}
              </div>
              
              {!phoneVerified ? (
                <>
                  <input
                    type="text"
                    name="phoneOtp"
                    value={otpData.phoneOtp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit phone OTP"
                    maxLength="6"
                    className="w-full input-field py-2 px-4 border rounded-lg text-center text-2xl tracking-widest"
                  />
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleVerifyPhone}
                      disabled={otpData.phoneOtp.length !== 6}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify Phone
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleResendOtp('Phone')}
                      className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                    >
                      Resend
                    </motion.button>
                  </div>
                </>
              ) : (
                <p className="text-green-700 font-semibold text-center">✓ Phone Verified Successfully!</p>
              )}
            </motion.div>

            {/* Success and Login Link */}
            {(emailVerified || phoneVerified) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center space-y-4"
              >
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <p className="font-bold text-xl">Account Verified Successfully!</p>
                <p className="text-sm">
                  {emailVerified && phoneVerified 
                    ? "Both email and phone verified! You can now login."
                    : emailVerified 
                    ? "Email verified! You can now login."
                    : "Phone verified! You can now login."}
                </p>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Go to Login Page
                  </motion.button>
                </Link>
              </motion.div>
            )}

            <p className="text-center text-sm text-gray-500 mt-4">
              Verify either email or phone to complete registration.
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default CreateAccount;
