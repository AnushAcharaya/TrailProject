// src/pages/AddLivestockPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LivestockForm from "../../components/livestockCrud/LivestockForm";
import { createLivestock } from "../../services/livestockCrudApi";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

const AddLivestockPage = () => {
  const { t } = useTranslation('livestock');
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }

  const handleAdd = async (formData) => {
    setSubmitting(true);
    setNotification(null); // Clear previous notifications
    
    const result = await createLivestock(formData);
    
    if (result.success) {
      setNotification({
        type: 'success',
        message: t('form.notifications.addSuccess')
      });
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/livestock");
      }, 2000);
    } else {
      // Extract error message from response
      let errorMessage = t('form.notifications.addError');
      
      if (result.error) {
        // Handle different error formats
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error.message) {
          errorMessage = result.error.message;
        } else if (result.error.detail) {
          errorMessage = result.error.detail;
        } else {
          // Handle field-specific errors
          const fieldErrors = [];
          for (const [field, errors] of Object.entries(result.error)) {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              fieldErrors.push(`${field}: ${errors}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(' | ');
          }
        }
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
      setSubmitting(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="form-page-container">
      <div className="max-w-4xl mx-auto p-6">
        {/* Notification Card */}
        {notification && (
          <div className={`notification-card ${notification.type === 'success' ? 'notification-success' : 'notification-error'}`}>
            <div className="notification-icon">
              {notification.type === 'success' ? (
                <FaCheckCircle size={24} />
              ) : (
                <FaExclamationCircle size={24} />
              )}
            </div>
            <div className="notification-content">
              <p className="notification-message">{notification.message}</p>
            </div>
            <button 
              onClick={closeNotification}
              className="notification-close"
              aria-label="Close notification"
            >
              <FaTimes size={18} />
            </button>
          </div>
        )}

        {/* Submitting Indicator */}
        {submitting && !notification && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
            {t('form.messages.saving')}
          </div>
        )}

        <LivestockForm onSubmit={handleAdd} isEditing={false} />
      </div>
    </div>
  );
};

export default AddLivestockPage;