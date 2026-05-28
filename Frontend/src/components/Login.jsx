import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { sendLoginOTP, verifyLoginOTP, loginWithGoogle } from "../services/api";
import BrandLogo from "./common/BrandLogo";
import GoogleSignInButton from "./common/GoogleSignInButton";

const Login = () => {
    const { t } = useTranslation('auth');
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Login Form, 2: OTP Verification
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        password: "",
        role: "",
    });
    const [otpData, setOtpData] = useState({
        emailOtp: "",
    });
    const [emailVerified, setEmailVerified] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        
        // Clear API error when user types
        if (apiError) {
            setApiError("");
        }
    };

    const validate = () => {
        const newErrors = {};

        // Role validation
        if (!formData.role) {
            newErrors.role = t('errors.roleRequired');
            setErrors(newErrors);
            return false;
        }

        // Email validation for all roles
        if (!formData.email) {
            newErrors.email = t('errors.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('errors.emailInvalid');
        }

        // Phone validation for farmer/vet
        if (formData.role !== "admin") {
            if (!formData.phone) {
                newErrors.phone = t('errors.phoneRequired');
            } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
                newErrors.phone = t('errors.phoneInvalid');
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = t('errors.passwordRequired');
        } else if (formData.password.length < 6) {
            newErrors.password = t('errors.passwordMinLength');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiError("");

        if (validate()) {
            const response = await sendLoginOTP(formData);
            
            if (response.success) {
                setStep(2); // Move to OTP verification
            } else {
                const errorMessage = response.error.error || response.error.message || "Login failed. Please check your credentials.";
                setApiError(errorMessage);
            }
        }
        setIsSubmitting(false);
    };

    const handleOtpChange = (e) => {
        const { name, value } = e.target;
        // Only allow numbers and limit to 6 digits
        if (/^\d{0,6}$/.test(value)) {
            setOtpData({ ...otpData, [name]: value });
        }
        
        // Clear API error when user types
        if (apiError) {
            setApiError("");
        }
    };

    const handleVerifyEmailOtp = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiError("");

        // Only verify email OTP - phone OTP is commented out in backend
        const response = await verifyLoginOTP(formData.email, otpData.emailOtp, '', formData.role);
        
        if (response.success) {
            // Store tokens and user info synchronously
            try {
                // Use sessionStorage instead of localStorage to keep tabs independent
                sessionStorage.setItem('token', response.data.access);
                sessionStorage.setItem('refresh_token', response.data.refresh);
                sessionStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Also store in localStorage as backup (but sessionStorage takes priority)
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Clear any cached profile data from previous user
                localStorage.removeItem('cachedProfile');
                sessionStorage.removeItem('cachedProfile');
                
                // Create a unique tab ID for this session
                const tabId = Date.now() + '_' + Math.random();
                sessionStorage.setItem('tabId', tabId);
                
                // Trigger profile refresh event for layouts (only for this tab)
                window.dispatchEvent(new Event('userLoggedIn'));
                
                // Verify token was stored
                const storedToken = sessionStorage.getItem('token');
                console.log('[Login] Token stored successfully:', storedToken ? 'Yes' : 'No');
                console.log('[Login] User logged in:', response.data.user.username, 'Role:', response.data.user.role);
                console.log('[Login] Tab ID:', tabId);
                
                setEmailVerified(true);
                
                // Redirect based on role with a slight delay for UI feedback
                setTimeout(() => {
                    if (formData.role === 'admin') {
                        navigate('/adminpage');
                    } else if (formData.role === 'vet') {
                        navigate('/vet/dashboard');
                    } else if (formData.role === 'farmer') {
                        navigate('/farmerpage');
                    } else {
                        navigate('/landing');
                    }
                }, 1500);
            } catch (error) {
                console.error('Error storing authentication data:', error);
                setApiError('Failed to store authentication data. Please try again.');
            }
        } else {
            const errorMessage = response.error.error || response.error.message || "Verification failed. Please check your OTP.";
            setApiError(errorMessage);
        }
        
        setIsSubmitting(false);
    };

    const handleGoogleSuccess = async (idToken) => {
        setApiError("");
        const result = await loginWithGoogle(idToken, formData.role || 'farmer');
        if (!result.success) {
            setApiError(result.error?.error || result.error?.message || "Google sign-in failed.");
            return;
        }
        const data = result.data;
        sessionStorage.setItem('token', data.access);
        sessionStorage.setItem('refresh_token', data.refresh);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('tabId', Date.now() + '_' + Math.random());
        window.dispatchEvent(new Event('userLoggedIn'));

        // Redirect to complete-profile if profile is incomplete
        if (data.profile_incomplete) {
            navigate('/complete-profile');
            return;
        }

        const role = data.user.role;
        if (role === 'admin') navigate('/adminpage');
        else if (role === 'vet') navigate('/vet/dashboard');
        else navigate('/farmerpage');
    };

    const handleGoogleError = (err) => {
        console.error('[Google sign-in]', err);
        setApiError(err?.message || "Couldn't complete Google sign-in.");
    };

    const handleResendOtp = async () => {
        setApiError("");
        setSuccessMessage("");
        
        const response = await sendLoginOTP(formData);
        
        if (response.success) {
            setSuccessMessage('Email OTP has been resent successfully!');
            setTimeout(() => setSuccessMessage(""), 5000);
        } else {
            const errorMessage = response.error.error || response.error.message || "Failed to resend OTP. Please try again.";
            setApiError(errorMessage);
        }
    };

    return (
        <section className="section-bg w-full">
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="card w-full max-w-md"
            >
                {/* Brand Logo */}
                <div className="flex justify-center mb-4">
                    <BrandLogo size="md" />
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-6 justify-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark text-center">
                        {step === 1 ? t('login.title') : t('login.verifyOTP')}
                    </h1>
                </div>

                {/* Step 1: Login Form */}
                {step === 1 && (
                <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
                    {/* API Error Message */}
                    {apiError && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                            <p className="font-semibold">{apiError}</p>
                        </div>
                    )}
                    
                    {/* Role Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('login.role')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            autoComplete="off"
                            className={`input-field bg-white w-full ${errors.role ? "border-red-400 focus:outline-red-400" : ""}`}
                        >
                            <option value="">{t('login.selectRole')}</option>
                            <option value="farmer">{t('roles.farmer')}</option>
                            <option value="vet">{t('roles.vet')}</option>
                            <option value="admin">{t('roles.admin')}</option>
                        </select>
                        {errors.role && (
                            <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                        )}
                    </div>

                    {/* Phone - Only for Farmer/Vet */}
                    {formData.role && formData.role !== "admin" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('login.phone')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                autoComplete="off"
                                className={`input-field w-full ${errors.phone ? "border-red-400 focus:outline-red-400" : ""}`}
                                placeholder={t('login.enterPhone')}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    {formData.role && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('login.email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="off"
                                className={`input-field w-full ${errors.email ? "border-red-400 focus:outline-red-400" : ""}`}
                                placeholder={t('login.enterEmail')}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>
                    )}

                    {/* Password */}
                    {formData.role && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('login.password')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    className={`input-field w-full pr-10 ${errors.password ? "border-red-400 focus:outline-red-400" : ""}`}
                                    placeholder={t('login.enterPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>
                    )}

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-green-600 hover:text-green-700 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded transition-colors"
                        >
                            {t('login.forgotPassword')}
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isSubmitting}
                        className={`btn-primary w-full py-3 mt-2 text-base sm:text-lg ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                            }`}
                    >
                        {isSubmitting ? t('login.sendingOTP') : t('login.sendOTP')}
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-2">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="text-gray-500 text-xs">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Google Sign-In */}
                    <GoogleSignInButton
                        text="signin_with"
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <div className="space-y-6">
                        {/* API Error Message */}
                        {apiError && (
                            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                                <p className="font-semibold">{apiError}</p>
                            </div>
                        )}
                        
                        {/* Success Message */}
                        {successMessage && (
                            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
                                <p className="font-semibold">{successMessage}</p>
                            </div>
                        )}
                        
                        {/* Email OTP Verification */}
                        <div className={`p-6 rounded-xl space-y-4 ${emailVerified ? 'bg-green-100 border-2 border-green-500' : 'bg-blue-50'}`}>
                            <div className="flex items-center justify-between">
                                <h3 className={`text-lg font-semibold ${emailVerified ? 'text-green-900' : 'text-blue-900'}`}>
                                    {t('login.emailVerification')}
                                </h3>
                                {emailVerified && <span className="text-green-600">✓ {t('login.verified')}</span>}
                            </div>
                            
                            {!emailVerified ? (
                                <>
                                    <input
                                        type="text"
                                        name="emailOtp"
                                        value={otpData.emailOtp}
                                        onChange={handleOtpChange}
                                        placeholder={t('login.enterEmailOTP')}
                                        maxLength="6"
                                        className="w-full input-field py-2 px-4 border rounded-lg text-center text-2xl tracking-widest"
                                    />
                                    <div className="flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleVerifyEmailOtp}
                                            disabled={otpData.emailOtp.length !== 6}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('login.verifyEmail')}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleResendOtp}
                                            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                                        >
                                            {t('login.resend')}
                                        </motion.button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-green-700 font-semibold text-center">✓ {t('login.emailVerifiedSuccess')}</p>
                            )}
                        </div>

                        {/* Success Message */}
                        {emailVerified && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center">
                                <p className="font-bold text-xl">{t('login.loginSuccess')}</p>
                                <p className="text-sm mt-2">{t('login.redirecting')}</p>
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-gray-600 hover:text-gray-700 hover:underline"
                            >
                                {t('login.backToLogin')}
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </section>
    );
};

export default Login;