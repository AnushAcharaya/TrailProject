import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle, Hourglass } from "lucide-react";
import { completeProfile } from "../services/api";
import BrandLogo from "../components/common/BrandLogo";

const inputClass = (hasError) =>
  `w-full bg-white border rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none transition-colors ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-gray-200 focus:border-emerald-600"
  }`;

const InlineError = ({ msg }) =>
  msg ? (
    <p className="text-red-600 text-xs mt-1 leading-snug" role="alert">
      {msg}
    </p>
  ) : null;

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    role: "",
    phone: "",
    farm_name: "",
    nid_photo: null,
    specialization: "",
    certificate_photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((p) => ({ ...p, [name]: files ? files[0] : value }));
    setErrors((p) => {
      const n = { ...p };
      delete n[name];
      delete n._general;
      return n;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const data = new FormData();
    data.append("role", formData.role);
    data.append("phone", formData.phone);

    if (formData.role === "farmer") {
      data.append("farm_name", formData.farm_name);
      if (formData.nid_photo) data.append("nid_photo", formData.nid_photo);
    } else if (formData.role === "vet") {
      data.append("specialization", formData.specialization);
      if (formData.certificate_photo)
        data.append("certificate_photo", formData.certificate_photo);
    }

    const result = await completeProfile(data);

    if (result.success) {
      // Update stored user role
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.role = formData.role;
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("user", JSON.stringify(user));
      } catch (_) {}
      setStep(2);
    } else {
      const err = result.error?.errors || result.error || {};
      if (typeof err === "string") {
        setErrors({ _general: err });
      } else {
        setErrors(err);
      }
    }
    setSubmitting(false);
  };

  const errFor = (field) => errors[field];

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-10"
      >
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
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 text-center mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-500 text-sm text-center mb-6">
                One more step before your account goes to admin for approval.
              </p>

              {errors._general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
                  {errors._general}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Role */}
                <div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClass(!!errFor("role")) + " text-gray-700"}
                  >
                    <option value="">Select your role</option>
                    <option value="farmer">Farmer</option>
                    <option value="vet">Veterinarian</option>
                  </select>
                  <InlineError msg={errFor("role")} />
                </div>

                {/* Phone */}
                <div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className={inputClass(!!errFor("phone"))}
                  />
                  <InlineError msg={errFor("phone")} />
                </div>

                {/* Farmer fields */}
                {formData.role === "farmer" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3"
                  >
                    <div>
                      <input
                        name="farm_name"
                        value={formData.farm_name}
                        onChange={handleChange}
                        placeholder="Farm name"
                        className={inputClass(!!errFor("farm_name"))}
                      />
                      <InlineError msg={errFor("farm_name")} />
                    </div>
                    <div>
                      <label className="flex items-center justify-center gap-2 cursor-pointer bg-white border-2 border-dashed border-emerald-300 rounded-xl px-4 py-3 hover:border-emerald-500 transition-colors">
                        <Upload size={18} className="text-emerald-600" />
                        <span className="text-sm text-gray-700 truncate">
                          {formData.nid_photo
                            ? formData.nid_photo.name
                            : "Upload NID photo"}
                        </span>
                        <input
                          type="file"
                          name="nid_photo"
                          onChange={handleChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                      <InlineError msg={errFor("nid_photo")} />
                    </div>
                  </motion.div>
                )}

                {/* Vet fields */}
                {formData.role === "vet" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3"
                  >
                    <div>
                      <input
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="Specialization"
                        className={inputClass(!!errFor("specialization"))}
                      />
                      <InlineError msg={errFor("specialization")} />
                    </div>
                    <div>
                      <label className="flex items-center justify-center gap-2 cursor-pointer bg-white border-2 border-dashed border-emerald-300 rounded-xl px-4 py-3 hover:border-emerald-500 transition-colors">
                        <Upload size={18} className="text-emerald-600" />
                        <span className="text-sm text-gray-700 truncate">
                          {formData.certificate_photo
                            ? formData.certificate_photo.name
                            : "Upload certificate photo"}
                        </span>
                        <input
                          type="file"
                          name="certificate_photo"
                          onChange={handleChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                      <InlineError msg={errFor("certificate_photo")} />
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting || !formData.role}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? "Submitting…" : "Submit Profile"}
                </motion.button>
              </form>
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
                <h2 className="text-2xl font-bold text-emerald-700">
                  Profile submitted!
                </h2>
                <p className="text-gray-600 text-sm">
                  Your profile is under review by the admin.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mx-auto max-w-md text-left flex items-start gap-3">
                <Hourglass size={18} className="text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">
                    Pending admin approval
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed mt-1">
                    You will receive an email once your account is approved.
                    Then you can sign in normally.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                Go to Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default CompleteProfile;
