// ProfileCard.jsx
import React from "react";
import { FaUserCircle, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const BRAND = {
  primary: "#2E7D32",
  primaryLight: "#4CAF50",
  bgLight: "#F1F8E9",
  cardBg: "#F9FAFB",
  border: "#E0E0E0",
  textDark: "#212121",
  textMedium: "#424242",
  textLight: "#757575",
};

const ProfileCard = ({ user }) => {
  return (
    <div
      className="rounded-lg shadow-sm border p-5 text-center transition-all duration-200"
      style={{
        background: `linear-gradient(135deg, ${BRAND.bgLight}, #FFFFFF)`,
        borderColor: BRAND.border,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Avatar */}
      <div className="relative inline-block">
        {user?.profile_image_url ? (
          <img
            src={user.profile_image_url}
            className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white shadow"
            alt="profile"
          />
        ) : (
          <FaUserCircle className="w-28 h-28 mx-auto text-gray-300" />
        )}
        <span className="absolute bottom-1 right-1 inline-flex h-4 w-4">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ backgroundColor: BRAND.primaryLight }}
          ></span>
          <span
            className="relative inline-flex rounded-full h-4 w-4 border-2 border-white"
            style={{ backgroundColor: BRAND.primary }}
          ></span>
        </span>
      </div>

      {/* Name / role */}
      <h2
        className="text-xl font-semibold mt-3"
        style={{ color: BRAND.textDark }}
      >
        {user?.full_name || "Loading..."}
      </h2>
      <h4
        className="text-sm font-semibold mt-1 capitalize"
        style={{ color: BRAND.primary }}
      >
        {user?.role || "Loading..."}
      </h4>
      <p className="text-xs" style={{ color: BRAND.textLight }}>
        @{user?.username}
      </p>
      {/* Gender Display */}
      {user?.gender && (
        <p className="text-xs mt-1" style={{ color: BRAND.textMedium }}>
          <span className="font-medium">Gender:</span> {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
        </p>
      )}
      <p className="mt-2 text-sm" style={{ color: BRAND.textMedium }}>
        {user?.bio || "No bio yet"}
      </p>

      {/* Info */}
      <div className="mt-4 space-y-1 text-xs" style={{ color: BRAND.textLight }}>
        <p>{user?.email}</p>
        <p>{user?.phone}</p>
        <div className="flex items-center justify-center gap-2">
          <FaMapMarkerAlt style={{ color: "#E53935" }} />
          <span>{user?.location || "No location set"}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <FaCalendarAlt style={{ color: BRAND.primaryLight }} />
          <span>Joined {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
