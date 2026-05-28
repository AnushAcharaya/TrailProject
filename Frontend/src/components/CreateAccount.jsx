import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle, Hourglass, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerUser, loginWithGoogle } from "../services/api";
import BrandLogo from "./common/BrandLogo";
import GoogleSignInButton from "./common/GoogleSignInButton";

// Map backend / state field names → human labels for the generic banner
const FIELD_LABELS = {
  username: "Username",
  full_name: "Full name",
  fullName: "Full name",
  address: "Address",
  phone: "Phone",
  email: "Email",
  password: "Password",
  role: "Role",
  farm_name: "Farm name",
  farmName: "Farm name",
  nid_photo: "NID photo",
  nidPhoto: "NID photo",
  specialization: "Specialization",
  certificate_photo: "Certificate photo",
  certificatePhoto: "Certificate photo",
};

// Convert DRF error payload into per-field strings.
const parseFieldErrors = (err) => {
  if (!err) return { _general: "Something went wrong. Please try again." };
  if (typeof err === "string") return { _general: err };
  if (err.error && !err.errors) return { _general: err.error };
  if (err.message && !err.errors) return { _general: err.message };

  const source = err.errors && typeof err.errors === "object" ? err.errors : err;
  const out = {};
  for (const [k, v] of Object.entries(source || {})) {
    if (k === "success" || k === "errors") continue;
    if (Array.isArray(v)) out[k] = v.join(" ");
    else if (typeof v === "string") out[k] = v;
  }
  if (Object.keys(out).length === 0) {
    out._general = "Registration failed. Please check your details.";
  }
  return out;
};

const InlineError = ({ msg }) =>
  msg ? (
    <p className="text-red-600 text-xs mt-1 leading-snug" role="alert">
      {msg}
    </p>
  ) : null;

const inputClass = (hasError) =>
  `w-full bg-white border rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none transition-colors ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-gray-200 focus:border-emerald-600"
  }`;

const CreateAccount = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = form, 2 = pending admin approval
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    role: "",
    farmName: "",
    nidPhoto: null,
    specialization: "",
    certificatePhoto: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((p) => ({ ...p, [name]: files ? files[0] : value }));

    // Clear that field's error as user fixes it
    setFieldErrors((p) => {
      if (!p[name] && !p[name.replace(/[A-Z]/g, m => "_" + m.toLowerCase())] && !p._general) return p;
      const n = { ...p };
      delete n[name];
      delete n[name.replace(/[A-Z]/g, m => "_" + m.toLowerCase())];
      delete n._general;
      return n;
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.username.trim())           errors.username      = "Username is required.";
    if (!formData.fullName.trim())           errors.fullName      = "Full name is required.";
    if (!formData.address.trim())            errors.address       = "Address is required.";
    if (!formData.phone.trim())              errors.phone         = "Phone number is required.";
    else if (!/^\d{10}$/.test(formData.phone.trim()))
                                             errors.phone         = "Phone must be 10 digits.";
    if (!formData.email.trim())              errors.email         = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
                                             errors.email         = "Enter a valid email address.";
    if (!formData.password)                  errors.password      = "Password is required.";
    else if (formData.password.length < 8)   errors.password      = "Password must be at least 8 characters.";
    if (!formData.role)                      errors.role          = "Please select a role.";

    if (formData.role === "farmer") {
      if (!formData.farmName.trim())         errors.farmName      = "Farm name is required.";
      if (!formData.nidPhoto)                errors.nidPhoto      = "NID photo is required.";
    }
    if (formData.role === "vet") {
      if (!formData.specialization.trim())   errors.specialization  = "Specialization is required.";
      if (!formData.certificatePhoto)        errors.certificatePhoto = "Certificate photo is required.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    const result = await registerUser(formData);

    if (result.success) {
      setRegisteredEmail(formData.email);
      setStep(2);
    } else {
      setFieldErrors(parseFieldErrors(result.error));
    }
    setSubmitting(false);
  };

  // ---- Google one-click signup (the button at the bottom) ----
  const handleGoogleSuccess = async (idToken) => {
    setFieldErrors({});
    const result = await loginWithGoogle(idToken, "farmer");
    if (!result.success) {
      setFieldErrors({
        _general:
          result.error?.error ||
          result.error?.message ||
          "Couldn't complete Google sign-up.",
      });
      return;
    }
    const data = result.data;
    sessionStorage.setItem("token", data.access);
    sessionStorage.setItem("refresh_token", data.refresh);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    sessionStorage.setItem("tabId", Date.now() + "_" + Math.random());
    window.dispatchEvent(new Event("userLoggedIn"));

    // Always redirect to complete-profile for Google signups
    navigate("/complete-profile");
  };

  const handleGoogleError = (err) => {
    setFieldErrors({ _general: err?.message || "Google sign-in failed." });
  };

  // Helper to look up an error whether the backend keyed it snake_case or camelCase
  const errFor = (camel) => {
    const snake = camel.replace(/[A-Z]/g, m => "_" + m.toLowerCase());
    return fieldErrors[camel] || fieldErrors[snake];
  };

  return (
    <section className="section-bg w-full">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-10"
      >
        {/* Brand */}
        <div className="flex justify-center mb-4">
          <BrandLogo size="md" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 text-center mb-6">
                Create Account
              </h1>

              {fieldErrors._general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
                  {fieldErrors._general}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className={inputClass(!!errFor("username"))}
                  />
                  <InlineError msg={errFor("username")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={inputClass(!!errFor("fullName"))}
                  />
                  <InlineError msg={errFor("fullName")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    className={inputClass(!!errFor("address"))}
                  />
                  <InlineError msg={errFor("address")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    className={inputClass(!!errFor("phone"))}
                  />
                  <InlineError msg={errFor("phone")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={inputClass(!!errFor("email"))}
                  />
                  <InlineError msg={errFor("email")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className={inputClass(!!errFor("password")) + " pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <InlineError msg={errFor("password")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClass(!!errFor("role")) + " text-gray-700"}
                  >
                    <option value="">Select your role</option>
                    <option value="farmer">Farmer</option>
                    <option value="vet">Veterinarian</option>
                    <option value="admin">Admin</option>
                  </select>
                  <InlineError msg={errFor("role")} />
                </div>

                {/* Farmer-only block */}
                {formData.role === "farmer" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farm Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="farmName"
                        value={formData.farmName}
                        onChange={handleChange}
                        placeholder="Enter your farm name"
                        className={inputClass(!!errFor("farmName"))}
                      />
                      <InlineError msg={errFor("farmName")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NID Photo <span className="text-red-500">*</span>
                      </label>
                      <label className={`flex items-center justify-center gap-2 cursor-pointer bg-white rounded-xl px-4 py-3 transition-colors border-2 border-dashed ${errFor("nidPhoto") ? "border-red-400" : "border-emerald-300 hover:border-emerald-500"}`}>
                        <Upload size={18} className="text-emerald-600" />
                        <span className="text-sm text-gray-700 truncate">
                          {formData.nidPhoto ? formData.nidPhoto.name : "Upload NID photo"}
                        </span>
                        <input
                          type="file"
                          name="nidPhoto"
                          onChange={handleChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                      <InlineError msg={errFor("nidPhoto")} />
                    </div>
                  </motion.div>
                )}

                {/* Vet-only block */}
                {formData.role === "vet" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g. Large Animal Medicine"
                        className={inputClass(!!errFor("specialization"))}
                      />
                      <InlineError msg={errFor("specialization")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Photo <span className="text-red-500">*</span>
                      </label>
                      <label className={`flex items-center justify-center gap-2 cursor-pointer bg-white rounded-xl px-4 py-3 transition-colors border-2 border-dashed ${errFor("certificatePhoto") ? "border-red-400" : "border-emerald-300 hover:border-emerald-500"}`}>
                        <Upload size={18} className="text-emerald-600" />
                        <span className="text-sm text-gray-700 truncate">
                          {formData.certificatePhoto ? formData.certificatePhoto.name : "Upload certificate photo"}
                        </span>
                        <input
                          type="file"
                          name="certificatePhoto"
                          onChange={handleChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                      <InlineError msg={errFor("certificatePhoto")} />
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? "Creating account…" : "Create Account"}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Google sign-up button (real Google icon) — width matches inputs */}
              <GoogleSignInButton
                text="signup_with"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width={400}
              />

              {/* Sign-in link */}
              <p className="text-center text-gray-600 text-sm mt-6">
                I'm already a member!{" "}
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-6 space-y-6"
            >
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-60"></div>
                <div className="relative bg-emerald-100 rounded-full p-5">
                  <CheckCircle className="w-16 h-16 text-emerald-600" strokeWidth={2.2} />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-700">
                  Registration successful!
                </h2>
                <p className="text-gray-700 text-base">
                  Please wait for admin approval before signing in.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mx-auto max-w-md text-left flex items-start gap-3">
                <Hourglass size={18} className="text-amber-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">
                    Pending admin approval
                  </p>
                  <p className="text-sm text-gray-800 font-semibold mt-0.5 break-all">
                    {registeredEmail}
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed mt-2">
                    An administrator will review your account shortly. You'll
                    be able to sign in once your account is approved.
                  </p>
                </div>
              </div>

              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                >
                  Go to Sign In
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default CreateAccount;
