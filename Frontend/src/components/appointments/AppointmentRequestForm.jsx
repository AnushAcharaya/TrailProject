import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiCalendar, FiUser, FiFileText, FiClock } from "react-icons/fi";
import { MdPets } from "react-icons/md";
import { getAllVets } from "../../services/profileApi";
import { createAppointment, formatAppointmentData } from "../../services/appointmentApi";
import { initiatePayment, redirectToEsewa } from "../../services/paymentApi";
import PaymentMethodModal from "./PaymentMethodModal";
import "../../styles/appointments.css";

const AppointmentRequestForm = () => {
  const { t } = useTranslation('appointments');
  const navigate = useNavigate();
  const [vets, setVets] = useState([]);
  const [isLoadingVets, setIsLoadingVets] = useState(true);
  const [vetSearchQuery, setVetSearchQuery] = useState("");
  const [showVetDropdown, setShowVetDropdown] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  
  const [formData, setFormData] = useState({
    veterinarian: "",
    animalType: "",
    reason: "",
    preferredDate: "",
    preferredTime: "",
  });

  // Load vets and check for pre-selected vet from card
  useEffect(() => {
    loadVets();
    
    // Check if vet was selected from card
    const preSelectedVetName = localStorage.getItem("selectedVetName");
    const preSelectedVetId = localStorage.getItem("selectedVetId");
    
    if (preSelectedVetName && preSelectedVetId) {
      setVetSearchQuery(preSelectedVetName);
      setFormData(prev => ({ ...prev, veterinarian: preSelectedVetId }));
      setSelectedVet({ full_name: preSelectedVetName, username: preSelectedVetId });
      
      // Clear from localStorage after using
      localStorage.removeItem("selectedVetName");
      localStorage.removeItem("selectedVetId");
    }
  }, []);

  const loadVets = async () => {
    setIsLoadingVets(true);
    const result = await getAllVets();
    
    if (result.success) {
      setVets(result.data);
    } else {
      console.error("Failed to load vets:", result.error);
    }
    
    setIsLoadingVets(false);
  };

  // Filter vets based on search query
  const filteredVets = vets.filter(vet => {
    const query = vetSearchQuery.toLowerCase();
    return (
      vet.full_name?.toLowerCase().includes(query) ||
      vet.username?.toLowerCase().includes(query) ||
      vet.specialization?.toLowerCase().includes(query)
    );
  });

  const handleVetSearch = (value) => {
    setVetSearchQuery(value);
    setShowVetDropdown(true);
    
    // Clear selection if user is typing
    if (selectedVet) {
      setSelectedVet(null);
      setFormData(prev => ({ ...prev, veterinarian: "" }));
    }
  };

  const handleVetSelect = (vet) => {
    setSelectedVet(vet);
    setVetSearchQuery(vet.full_name || vet.username);
    setFormData(prev => ({ ...prev, veterinarian: vet.username }));
    setShowVetDropdown(false);
  };

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeSelect = (time) => {
    setFormData((prev) => ({
      ...prev,
      preferredTime: time,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Format data for API
      const appointmentData = formatAppointmentData(formData);
      
      // Create appointment
      const response = await createAppointment(appointmentData);
      
      console.log("Appointment created successfully:", response);
      
      // Store appointment data for payment
      setCreatedAppointment(response);
      
      // Check if payment is required
      if (response.appointment_fee && response.appointment_fee > 0) {
        // Show payment method selection modal
        setShowPaymentModal(true);
        setIsSubmitting(false);
      } else {
        // No payment required, show success and redirect
        setSuccess(true);
        setTimeout(() => {
          navigate('/appointments', { state: { appointmentCreated: true } });
        }, 2000);
      }
      
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(err.response?.data?.message || err.response?.data?.detail || t('form.messages.error'));
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodSelect = async (paymentMethod) => {
    if (paymentMethod === 'cash') {
      // Cash payment - just show success and redirect
      setShowPaymentModal(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/appointments', { 
          state: { 
            appointmentCreated: true,
            message: t('payment.messages.cashSuccess')
          } 
        });
      }, 2000);
    } else if (paymentMethod === 'esewa') {
      // eSewa payment - initiate payment
      try {
        const paymentData = {
          amount: createdAppointment.appointment_fee,
          product_code: 'APPOINTMENT_FEE',
          product_description: `Appointment #${createdAppointment.id} with ${selectedVet?.full_name || 'Veterinarian'}`,
          tax_amount: 0
        };

        const result = await initiatePayment(paymentData);

        if (result.success) {
          // Redirect to eSewa
          redirectToEsewa(result.payment_data, result.esewa_url);
        } else {
          throw new Error('Failed to initiate payment');
        }
      } catch (err) {
        console.error('Payment initiation error:', err);
        setError(t('payment.messages.paymentFailed'));
        setShowPaymentModal(false);
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              {t('form.messages.success')}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

      {/* Select Veterinarian */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FiUser className="text-green-600" size={20} />
          </div>
          <label className="block text-sm font-medium text-gray-700">
            {t('form.selectVet')} <span className="text-red-500">{t('form.required')}</span>
          </label>
        </div>
        
        {/* Searchable Vet Input */}
        <div className="relative">
          <input
            type="text"
            value={vetSearchQuery}
            onChange={(e) => handleVetSearch(e.target.value)}
            onFocus={() => setShowVetDropdown(true)}
            placeholder={t('form.vetSearch')}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
          />
          
          {/* Vet Dropdown */}
          {showVetDropdown && !isLoadingVets && filteredVets.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredVets.map((vet) => (
                <div
                  key={vet.username}
                  onClick={() => handleVetSelect(vet)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {vet.full_name || vet.username}
                  </div>
                  {vet.specialization && (
                    <div className="text-sm text-gray-600">
                      Specialization: {vet.specialization}
                    </div>
                  )}
                  {vet.address && (
                    <div className="text-xs text-gray-500">
                      {vet.address}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* No Results Message */}
          {showVetDropdown && !isLoadingVets && vetSearchQuery && filteredVets.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <p className="text-gray-500 text-sm">{t('form.vetNoResults', { query: vetSearchQuery })}</p>
            </div>
          )}
          
          {/* Loading Message */}
          {isLoadingVets && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <p className="text-gray-500 text-sm">{t('form.vetLoading')}</p>
            </div>
          )}
        </div>
        
        {/* Selected Vet Info */}
        {selectedVet && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              {t('form.vetSelected', { name: selectedVet.full_name || selectedVet.username })}
              {selectedVet.specialization && ` - ${selectedVet.specialization}`}
            </p>
          </div>
        )}
      </div>

      {/* Animal Type and Reason */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdPets className="text-blue-600" size={22} />
            </div>
            <label className="block text-sm font-medium text-gray-700">
              {t('form.animalType')} <span className="text-red-500">{t('form.required')}</span>
            </label>
          </div>
          <select
            name="animalType"
            value={formData.animalType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
          >
            <option value="">{t('form.selectAnimal')}</option>
            <option value="cattle">{t('form.animals.cattle')}</option>
            <option value="sheep">{t('form.animals.sheep')}</option>
            <option value="goat">{t('form.animals.goat')}</option>
            <option value="pig">{t('form.animals.pig')}</option>
            <option value="poultry">{t('form.animals.poultry')}</option>
          </select>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiFileText className="text-purple-600" size={20} />
            </div>
            <label className="block text-sm font-medium text-gray-700">
              {t('form.reason')} <span className="text-red-500">{t('form.required')}</span>
            </label>
          </div>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows="4"
            placeholder={t('form.reasonPlaceholder')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-gray-700"
          />
        </div>
      </div>

      {/* Preferred Date and Time */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferred Date */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-orange-600" size={20} />
              </div>
              <label className="block text-sm font-medium text-gray-700">
                {t('form.preferredDate')} <span className="text-red-500">{t('form.required')}</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
            </div>
          </div>

          {/* Preferred Time */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <FiClock className="text-teal-600" size={20} />
              </div>
              <label className="block text-sm font-medium text-gray-700">
                {t('form.preferredTime')} <span className="text-red-500">{t('form.required')}</span>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    formData.preferredTime === time
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-green-500"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('form.buttons.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('form.buttons.submitting') : t('form.buttons.submit')}
        </button>
      </div>
    </form>

    {/* Payment Method Modal */}
    <PaymentMethodModal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      appointmentData={createdAppointment}
      onPaymentMethodSelect={handlePaymentMethodSelect}
    />
    </>
  );
};

export default AppointmentRequestForm;
