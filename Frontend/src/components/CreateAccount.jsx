import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Upload, LogIn, Mail, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerUser, verifyEmailOTP, resendEmailOTP } from "../services/api";

const CreateAccount = () => {
  const { t } = useTranslation('auth');
  const [step, setStep] = useState(1); // 1: Registration, 2: Success Message, 3: OTP Verification
  const [registeredUser, setRegisteredUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  
  const [otpData, setOtpData] = useState({
    emailOtp: "",
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
    setErrorMessage(""); // Clear previous errors
    
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
      // Handle registration error - show as red text
      const errorMsg = result.error.message || result.error.error || JSON.stringify(result.error);
      setErrorMessage(errorMsg);
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
    setEmailOtpError(""); // Clear previous errors
    
    const result = await verifyEmailOTP(registeredUser.email, otpData.emailOtp);
    
    if (result.success) {
      setEmailVerified(true);
    } else {
      const errorMsg = result.error.message || result.error.error || JSON.stringify(result.error);
      setEmailOtpError(errorMsg);
    }
  };

  const handleResendOtp = async () => {
    const result = await resendEmailOTP(registeredUser.email);
    
    if (result.success) {
      alert('Email OTP has been resent!');
    } else {
      const errorMessage = result.error.message || JSON.stringify(result.error);
      alert(`Failed to resend Email OTP: ${errorMessage}`);
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
                {t('register.title')}
              </h1>
            </>
          ) : (
            <>
              <CheckCircle className="text-green-600 w-10 h-10 sm:w-8 sm:h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark text-center">
                {t('register.verifyYourAccount')}
              </h1>
            </>
          )}
        </div>

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Helper to create horizontal label + input */}
          {[
            { label: t('register.username'), name: "username", type: "text", placeholder: t('register.username') },
            { label: t('register.fullName'), name: "fullName", type: "text", placeholder: t('register.fullName') },
            { label: t('register.address'), name: "address", type: "text", placeholder: t('register.address') },
            { label: t('register.phone'), name: "phone", type: "text", placeholder: t('register.phone') },
            { label: t('register.email'), name: "email", type: "email", placeholder: t('register.email') },
            { label: t('register.password'), name: "password", type: "password", placeholder: t('register.password') },
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
            <label className="w-1/4 text-right font-medium">{t('register.role')}:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-1/2 input-field py-1 px-2 border rounded bg-white"
            >
              <option value="">{t('register.selectRole')}</option>
              <option value="farmer">{t('roles.farmer')}</option>
              <option value="vet">{t('roles.vet')}</option>
              <option value="admin">{t('roles.admin')}</option>
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
                  <label className="w-1/4 text-right font-medium">{t('register.farmName')}:</label>
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    required
                    placeholder={t('register.farmName')}
                    className="w-1/2 input-field py-1 px-2 border rounded"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 w-full">
                  <label className="w-1/4 text-right font-medium">{t('register.nidPhoto')}:</label>
                  <div className="w-1/2">
                    <label className="upload-box flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                      <Upload className="text-green-700" />
                      <span>{formData.nidPhoto ? formData.nidPhoto.name : t('register.chooseFile')}</span>
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
                  <label className="w-1/4 text-right font-medium">{t('register.specialization')}:</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder={t('register.specialization')}
                    className="w-1/2 input-field py-1 px-2 border rounded"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 w-full">
                  <label className="w-1/4 text-right font-medium">{t('register.certificatePhoto')}:</label>
                  <div className="w-1/2">
                    <label className="upload-box flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                      <Upload className="text-green-700" />
                      <span>{formData.certificatePhoto ? formData.certificatePhoto.name : t('register.chooseFile')}</span>
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
                  {t('register.adminNote')}
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
            {t('register.loginWithGoogle')}
          </motion.button>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-600 text-sm mt-3 text-center">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="btn-primary mx-auto block py-2 px-6 mt-4 text-sm sm:text-base"
          >
            {t('register.createAccount')}
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
              <p className="font-bold text-xl">{t('register.registrationComplete')}</p>
              <p className="text-base mt-2">{t('register.verifyEmail')}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span>{t('register.redirectingToVerification')}</span>
            </div>
          </motion.div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && registeredUser && (
          <div className="space-y-6">
            {/* Email OTP Verification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl space-y-4 ${emailVerified ? 'bg-green-100 border-2 border-green-500' : 'bg-blue-50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className={`w-6 h-6 ${emailVerified ? 'text-green-600' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-semibold ${emailVerified ? 'text-green-900' : 'text-blue-900'}`}>
                    {t('register.emailVerification')}
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
                    placeholder={t('register.enterEmailOTP')}
                    maxLength="6"
                    className="w-full input-field py-2 px-4 border rounded-lg text-center text-2xl tracking-widest"
                  />
                  {emailOtpError && (
                    <div className="text-red-600 text-sm text-center">
                      {emailOtpError}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleVerifyEmail}
                      disabled={otpData.emailOtp.length !== 6}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('register.verifyEmailButton')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResendOtp}
                      className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                    >
                      {t('register.resend')}
                    </motion.button>
                  </div>
                </>
              ) : (
                <p className="text-green-700 font-semibold text-center">✓ {t('register.emailVerifiedSuccess')}</p>
              )}
            </motion.div>

            {/* Success and Login Link */}
            {emailVerified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center space-y-4"
              >
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <p className="font-bold text-xl">{t('register.accountVerifiedSuccess')}</p>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    {t('register.goToLogin')}
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default CreateAccount;
