import React from "react";
import { FaUserMd, FaMapMarkerAlt, FaStethoscope } from "react-icons/fa";

const VetProfileCard = ({ vet, onAppointVet }) => {
  // Get profile image URL or use default avatar
  const profileImageUrl = vet.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.full_name || vet.username)}&background=059669&color=fff&size=200`;

  return (
    <div className="vet-profile-card">
      {/* Profile Image */}
      <div className="vet-profile-image-container">
        <img
          src={profileImageUrl}
          alt={vet.full_name || vet.username}
          className="vet-profile-image"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.full_name || vet.username)}&background=059669&color=fff&size=200`;
          }}
        />
      </div>

      {/* Vet Information */}
      <div className="vet-profile-info">
        <h3 className="vet-profile-name">
          <FaUserMd className="inline mr-2 text-emerald-600" />
          {vet.full_name || vet.username}
        </h3>

        {/* Address */}
        {vet.address && (
          <p className="vet-profile-detail">
            <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
            <span className="text-gray-700">{vet.address}</span>
          </p>
        )}

        {/* Specialization */}
        {vet.specialization && (
          <p className="vet-profile-detail">
            <FaStethoscope className="inline mr-2 text-gray-500" />
            <span className="text-gray-700">{vet.specialization}</span>
          </p>
        )}

        {/* Bio (if available) */}
        {vet.bio && (
          <p className="vet-profile-bio">{vet.bio}</p>
        )}

        {/* Appoint Vet Button */}
        <button
          onClick={() => onAppointVet(vet)}
          className="btn-appoint-vet"
        >
          Appoint Vet
        </button>
      </div>
    </div>
  );
};

export default VetProfileCard;
