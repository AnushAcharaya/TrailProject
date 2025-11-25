import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "",
    });

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

        // Email validation
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email address is invalid";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = "Please select your role";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Small delay to show loading state (optional)
        setTimeout(() => {
            if (validate()) {
                console.log("Login Data:", formData);
                alert("Login successful!");
                // TODO: Replace with actual auth logic
            }
            setIsSubmitting(false);
        }, 400);
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
                        Login
                    </h1>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Email */}
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

                    {/* Password */}
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

                    {/* Role Selector */}
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
                        {isSubmitting ? "Signing In..." : "Sign In"}
                    </motion.button>
                </form>
            </motion.div>
        </section>
    );
};

export default Login;