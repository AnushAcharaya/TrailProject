import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { sendLoginOTP, verifyLoginOTP } from "../services/api";

const Login = () => {
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
    };

    const validate = () => {
        const newErrors = {};

        // Role validation
        if (!formData.role) {
            newErrors.role = "Please select your role";
            setErrors(newErrors);
            return false;
        }

        // Email validation for all roles
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email address is invalid";
        }

        // Phone validation for farmer/vet
        if (formData.role !== "admin") {
            if (!formData.phone) {
                newErrors.phone = "Phone number is required";
            } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
                newErrors.phone = "Phone number is invalid";
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (validate()) {
            const response = await sendLoginOTP(formData);
            
            if (response.success) {
                setStep(2); // Move to OTP verification
            } else {
                const errorMessage = response.error.error || response.error.message || JSON.stringify(response.error);
                alert(`Login failed: ${errorMessage}`);
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
    };

    const handleVerifyEmailOtp = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Only verify email OTP - phone OTP is commented out in backend
        const response = await verifyLoginOTP(formData.email, otpData.emailOtp, '', formData.role);
        
        if (response.success) {
            // Store tokens and user info
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setEmailVerified(true);
            
            // Redirect based on role
            setTimeout(() => {
                if (formData.role === 'admin') {
                    navigate('/adminpage');
                } else {
                    navigate('/landing');
                }
            }, 1500);
        } else {
            const errorMessage = response.error.error || response.error.message || JSON.stringify(response.error);
            alert(`Verification failed: ${errorMessage}`);
        }
        
        setIsSubmitting(false);
    };

    const handleResendOtp = async () => {
        const response = await sendLoginOTP(formData);
        
        if (response.success) {
            alert('Email OTP has been resent!');
        } else {
            const errorMessage = response.error.error || response.error.message || JSON.stringify(response.error);
            alert(`Failed to resend OTP: ${errorMessage}`);
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
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-6 justify-center">
                    <LogIn className="text-primary-dark w-10 h-10 sm:w-8 sm:h-8" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark text-center">
                        {step === 1 ? "Login" : "Verify OTP"}
                    </h1>
                </div>

                {/* Step 1: Login Form */}
                {step === 1 && (
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Role Selector - First */}
                    <div className="form-row">
                        <label className="label">Role</label>
                        <div className="w-full">
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={`input-field bg-white ${errors.role ? "border-red-400 focus:outline-red-400" : ""}`}
                            >
                                <option value="">Select your role</option>
                                <option value="farmer">Farmer</option>
                                <option value="vet">Veterinarian</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && (
                                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                            )}
                        </div>
                    </div>

                    {/* Email - Always visible after role selection */}
                    {formData.role && (
                        <div className="form-row">
                            <label className="label">Email</label>
                            <div className="w-full">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`input-field ${errors.email ? "border-red-400 focus:outline-red-400" : ""}`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Phone - Only for Farmer/Vet */}
                    {formData.role && formData.role !== "admin" && (
                        <div className="form-row">
                            <label className="label">Phone</label>
                            <div className="w-full">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`input-field ${errors.phone ? "border-red-400 focus:outline-red-400" : ""}`}
                                    placeholder="Enter your phone number"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Password */}
                    {formData.role && (
                        <div className="form-row">
                            <label className="label">Password</label>
                            <div className="w-full">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`input-field ${errors.password ? "border-red-400 focus:outline-red-400" : ""}`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-green-600 hover:text-green-700 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded transition-colors"
                        >
                            Forgot Password?
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
                        {isSubmitting ? "Sending OTP..." : "Send OTP"}
                    </motion.button>
                </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <div className="space-y-6">
                        {/* Email OTP Verification */}
                        <div className={`p-6 rounded-xl space-y-4 ${emailVerified ? 'bg-green-100 border-2 border-green-500' : 'bg-blue-50'}`}>
                            <div className="flex items-center justify-between">
                                <h3 className={`text-lg font-semibold ${emailVerified ? 'text-green-900' : 'text-blue-900'}`}>
                                    Email Verification
                                </h3>
                                {emailVerified && <span className="text-green-600">✓ Verified</span>}
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
                                            onClick={handleVerifyEmailOtp}
                                            disabled={otpData.emailOtp.length !== 6}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Verify Email
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleResendOtp}
                                            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                                        >
                                            Resend
                                        </motion.button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-green-700 font-semibold text-center">✓ Email Verified Successfully!</p>
                            )}
                        </div>

                        {/* Success Message */}
                        {emailVerified && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center">
                                <p className="font-bold text-xl">Login Successful!</p>
                                <p className="text-sm mt-2">Redirecting...</p>
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-gray-600 hover:text-gray-700 hover:underline"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </section>
    );
};

export default Login;