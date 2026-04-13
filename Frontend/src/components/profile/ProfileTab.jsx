// ProfileTab.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { updateProfile } from "../../services/profileApi";

const BRAND = {
  primary: "#2E7D32",
  primaryDark: "#1B5E20",
  primaryLight: "#4CAF50",
  bgLight: "#F1F8E9",
  cardBg: "#F9FAFB",
  border: "#E0E0E0",
  textDark: "#212121",
  textMedium: "#424242",
  textLight: "#757575",
};

const ProfileTab = ({ user, onUpdate }) => {
  const { t } = useTranslation('profile');
  const [form, setForm] = useState({
    location: "",
    bio: "",
    gender: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        location: user.location || "",
        bio: user.bio || "",
        gender: user.gender || "",
      });
      // Use profile_image_url if available (full URL from backend), otherwise construct it
      const imageUrl = user.profile_image_url || (user.profile_image ? `http://localhost:8000${user.profile_image}` : null);
      setImagePreview(imageUrl);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    
    console.log('[ProfileTab] Saving profile changes...');
    
    const profileData = {
      bio: form.bio,
      location: form.location,
      gender: form.gender,
    };
    
    // Add image file if selected
    if (profileImage) {
      console.log('[ProfileTab] Including profile image in update');
      profileData.profile_image = profileImage;
    }
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      console.log('[ProfileTab] Profile updated successfully:', result.data);
      onUpdate(result.data);
      setStatus(t('profileTab.messages.success'));
      setProfileImage(null); // Clear selected file
      
      // Dispatch event to notify other components (like FarmerLayout/VetLayout)
      console.log('[ProfileTab] Dispatching profileUpdated event');
      window.dispatchEvent(new Event('profileUpdated'));
      
      // Also trigger storage event as a backup communication method
      console.log('[ProfileTab] Setting profileUpdateTrigger in localStorage');
      localStorage.setItem('profileUpdateTrigger', Date.now().toString());
      
      setTimeout(() => setStatus(null), 3000);
    } else {
      console.error('[ProfileTab] Profile update failed:', result.error);
      const errorMsg = result.error?.bio?.[0] || 
                       result.error?.location?.[0] || 
                       result.error?.gender?.[0] || 
                       result.error?.profile_image?.[0] ||
                       result.error?.message || 
                       t('profileTab.messages.error');
      setError(errorMsg);
    }
    
    setLoading(false);
  };

  // helper to attach same hover/focus styles to all inputs
  const attachInteractiveStyles = (e) => {
    e.target.style.borderColor = BRAND.primaryLight;
    e.target.style.boxShadow = `0 0 0 2px #C8E6C9`;
    e.target.style.backgroundColor = BRAND.bgLight;
  };
  const resetInteractiveStyles = (e) => {
    e.target.style.borderColor = BRAND.border;
    e.target.style.boxShadow = "none";
    e.target.style.backgroundColor = "#FFFFFF";
  };
  const hoverOn = (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.backgroundColor = BRAND.bgLight;
    }
  };
  const hoverOff = (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.backgroundColor = "#FFFFFF";
    }
  };

  return (
    <div
      className="rounded-xl p-4 md:p-5"
      style={{
        background: `linear-gradient(135deg, ${BRAND.bgLight}, #FFFFFF)`,
      }}
    >
      <h3
        className="text-lg font-semibold mb-1"
        style={{ color: BRAND.textDark }}
      >
        {t('profileTab.title')}
      </h3>
      <p className="text-xs mb-4" style={{ color: BRAND.textLight }}>
        {t('profileTab.subtitle')}
      </p>

      {/* Profile Photo Upload */}
      <div className="mb-4">
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: BRAND.textMedium }}
        >
          {t('profileTab.photo.label')}
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-20 h-20 rounded-full object-cover border-2"
                style={{ borderColor: BRAND.primary }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: BRAND.border, backgroundColor: BRAND.bgLight }}
              >
                <span className="text-2xl" style={{ color: BRAND.textLight }}>👤</span>
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              id="profile-photo"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="profile-photo"
              className="cursor-pointer inline-block text-xs px-4 py-2 rounded-md transition-all duration-200"
              style={{
                backgroundColor: BRAND.primary,
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BRAND.primaryLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = BRAND.primary;
              }}
            >
              {t('profileTab.photo.upload')}
            </label>
            <p className="text-[10px] mt-1" style={{ color: BRAND.textLight }}>
              {t('profileTab.photo.format')}
            </p>
          </div>
        </div>
      </div>

      {/* Read-only fields from registration */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "#F5F5F5", border: `1px solid ${BRAND.border}` }}>
        <p className="text-xs font-medium mb-2" style={{ color: BRAND.textMedium }}>
          {t('profileTab.registration.title')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <span style={{ color: BRAND.textLight }}>{t('profileTab.registration.fullName')}</span>
            <span className="ml-2 font-medium" style={{ color: BRAND.textDark }}>{user?.full_name || "N/A"}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textLight }}>{t('profileTab.registration.username')}</span>
            <span className="ml-2 font-medium" style={{ color: BRAND.textDark }}>{user?.username || "N/A"}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textLight }}>{t('profileTab.registration.email')}</span>
            <span className="ml-2 font-medium" style={{ color: BRAND.textDark }}>{user?.email || "N/A"}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textLight }}>{t('profileTab.registration.phone')}</span>
            <span className="ml-2 font-medium" style={{ color: BRAND.textDark }}>{user?.phone || "N/A"}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textLight }}>{t('profileTab.registration.role')}</span>
            <span className="ml-2 font-medium capitalize" style={{ color: BRAND.textDark }}>{user?.role || "N/A"}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textLight }}>{t('profileTab.registration.address')}</span>
            <span className="ml-2 font-medium" style={{ color: BRAND.textDark }}>{user?.address || "N/A"}</span>
          </div>
          {user?.role === 'farmer' && user?.farm_name && (
            <div>
              <span style={{ color: BRAND.textLight }}>{t('profileTab.registration.farmName')}</span>
              <span className="ml-2 font-medium" style={{ color: BRAND.textDark }}>{user.farm_name}</span>
            </div>
          )}
          {user?.role === 'vet' && user?.specialization && (
            <div>
              <span style={{ color: BRAND.textLight }}>{t('profileTab.registration.specialization')}</span>
              <span className="ml-2 font-medium" style={{ color: BRAND.textDark }}>{user.specialization}</span>
            </div>
          )}
        </div>
      </div>

      {/* Editable fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: BRAND.textMedium }}
          >
            {t('profileTab.fields.location')}
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-md px-3 py-2 text-sm outline-none transition-all duration-200"
            style={{
              border: `1px solid ${BRAND.border}`,
              backgroundColor: "#FFFFFF",
            }}
            placeholder={t('profileTab.fields.locationPlaceholder')}
            onFocus={attachInteractiveStyles}
            onBlur={resetInteractiveStyles}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          />
        </div>
      </div>

      {/* Gender Selection */}
      <div className="mb-4">
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: BRAND.textMedium }}
        >
          {t('profileTab.fields.gender')}
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={form.gender === "male"}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: BRAND.primary }}
            />
            <span className="text-sm" style={{ color: BRAND.textMedium }}>
              {t('profileTab.fields.male')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={form.gender === "female"}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: BRAND.primary }}
            />
            <span className="text-sm" style={{ color: BRAND.textMedium }}>
              {t('profileTab.fields.female')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="other"
              checked={form.gender === "other"}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: BRAND.primary }}
            />
            <span className="text-sm" style={{ color: BRAND.textMedium }}>
              {t('profileTab.fields.other')}
            </span>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label
          className="block text-xs font-medium mb-1"
          style={{ color: BRAND.textMedium }}
        >
          {t('profileTab.fields.bio')}
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full rounded-md px-3 py-2 text-sm outline-none transition-all duration-200 min-h-[80px]"
          style={{
            border: `1px solid ${BRAND.border}`,
            backgroundColor: "#FFFFFF",
          }}
          placeholder={t('profileTab.fields.bioPlaceholder')}
          onFocus={attachInteractiveStyles}
          onBlur={resetInteractiveStyles}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 p-3 rounded-md text-xs" style={{ backgroundColor: "#FFEBEE", color: "#C62828", border: "1px solid #FFCDD2" }}>
          {error}
        </div>
      )}

      {/* Success message */}
      {status && (
        <div className="mb-3 p-3 rounded-md text-xs" style={{ backgroundColor: "#C8E6C9", color: BRAND.primaryDark, border: `1px solid ${BRAND.primaryLight}` }}>
          {status}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-sm px-4 py-2 rounded-md transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundImage: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.primaryLight})`,
            color: "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          }}
        >
          {loading ? t('profileTab.buttons.saving') : t('profileTab.buttons.save')}
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
