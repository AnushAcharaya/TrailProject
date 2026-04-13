import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Key, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forgotPassword, verifyResetToken, resetPassword } from "../services/api";

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const [step, setStep] = useState(1); // 1: Email, 2: Token, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateEmail = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.emailFormat');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateToken = () => {
    const newErrors = {};
    
    if (!formData.token.trim()) {
      newErrors.token = t('errors.tokenRequired');
    } else if (formData.token.length !== 6) {
      newErrors.token = t('errors.tokenLength');
    } else if (!/^\d{6}$/.test(formData.token)) {
      newErrors.token = t('errors.tokenNumeric');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswords = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = t('errors.passwordRequired');
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('errors.passwordMinLength');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordRequired');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordsDoNotMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    
    try {
      const result = await forgotPassword(formData.email);
      
      if (result.success) {
        console.log("Reset token sent to:", formData.email);
        setStep(2);
      } else {
        setErrors({ email: result.error.error || "Failed to send reset token. Please try again." });
      }
    } catch (error) {
      setErrors({ email: "Failed to send reset token. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateToken()) return;
    
    setIsLoading(true);
    
    try {
      const result = await verifyResetToken(formData.email, formData.token);
      
      if (result.success) {
        console.log("Token verified successfully");
        setStep(3);
      } else {
        setErrors({ token: result.error.error || "Invalid or expired token. Please try again." });
      }
    } catch (error) {
      setErrors({ token: "Invalid or expired token. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;
    
    setIsLoading(true);
    
    try {
      const result = await resetPassword(
        formData.email,
        formData.token,
        formData.newPassword,
        formData.confirmPassword
      );
      
      if (result.success) {
        console.log("Password reset successful for:", formData.email);
        setStep(4); // Success step
      } else {
        setErrors({ newPassword: result.error.error || "Failed to reset password. Please try again." });
      }
    } catch (error) {
      setErrors({ newPassword: "Failed to reset password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="email-step"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('forgotPassword.title')}</h2>
              <p className="text-gray-600">
                {t('forgotPassword.subtitle')}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="label">{t('forgotPassword.emailAddress')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder={t('forgotPassword.enterEmail')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('forgotPassword.sendingToken')}
                  </div>
                ) : (
                  t('forgotPassword.sendResetToken')
                )}
              </button>
            </form>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="token-step"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('forgotPassword.enterResetToken')}</h2>
              <p className="text-gray-600">
                {t('forgotPassword.tokenSentTo')} <strong>{formData.email}</strong>
              </p>
            </div>

            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label className="label">{t('forgotPassword.resetToken')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  className={`input-field text-center tracking-widest ${errors.token ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder={t('forgotPassword.enterToken')}
                  maxLength="6"
                />
                {errors.token && (
                  <p className="text-red-500 text-sm mt-1">{errors.token}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('forgotPassword.back')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('forgotPassword.verifying')}
                    </div>
                  ) : (
                    t('forgotPassword.verifyToken')
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="password-step"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('forgotPassword.resetPassword')}</h2>
              <p className="text-gray-600">
                {t('forgotPassword.enterNewPassword')}
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label">{t('forgotPassword.newPassword')}</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.newPassword ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder={t('forgotPassword.enterNewPasswordPlaceholder')}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="label">{t('forgotPassword.confirmPassword')}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder={t('forgotPassword.confirmPasswordPlaceholder')}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('forgotPassword.back')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('forgotPassword.resetting')}
                    </div>
                  ) : (
                    t('forgotPassword.resetPasswordButton')
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="success-step"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('forgotPassword.passwordResetSuccess')}</h2>
            <p className="text-gray-600 mb-6">
              {t('forgotPassword.passwordResetMessage')}
            </p>
            <Link
              to="/login"
              className="btn-primary inline-block px-8 py-3 text-center"
            >
              {t('forgotPassword.goToLogin')}
            </Link>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="section-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {step < 4 && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-800 transition"
            >
              {t('forgotPassword.rememberPassword')}
            </Link>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ForgotPassword;