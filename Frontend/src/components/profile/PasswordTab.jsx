// PasswordTab.jsx
import React, { useState } from "react";
import { changePassword } from "../../services/profileApi";

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

const PasswordTab = () => {
  const [data, setData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (data.new_password.length < 8) {
      return "New password must be at least 8 characters.";
    }
    if (data.new_password !== data.confirm_password) {
      return "New password and confirm password do not match.";
    }
    if (data.new_password === data.old_password) {
      return "New password must be different from current password.";
    }
    return null;
  };

  const handlePasswordChange = async () => {
    const err = validatePassword();
    if (err) {
      setError(err);
      setStatus("");
      return;
    }
    
    setLoading(true);
    setError("");
    setStatus("");
    
    const result = await changePassword(data);
    
    if (result.success) {
      setStatus(result.message || "Password changed successfully!");
      // Clear form
      setData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTimeout(() => setStatus(""), 3000);
    } else {
      const errorMsg = result.error?.old_password?.[0] || 
                       result.error?.new_password?.[0] || 
                       result.error?.confirm_password?.[0] ||
                       result.error?.error ||
                       result.error?.message || 
                       "Failed to change password.";
      setError(errorMsg);
    }
    
    setLoading(false);
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
        Change password
      </h3>
      <p className="text-xs mb-4" style={{ color: BRAND.textLight }}>
        Update your password. Make sure it's at least 8 characters long.
      </p>

      <div className="space-y-3 mb-3">
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: BRAND.textMedium }}
          >
            Current password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={data.old_password}
            onChange={(e) =>
              setData({ ...data, old_password: e.target.value })
            }
            className="w-full rounded-md px-3 py-2 text-sm outline-none transition-all duration-200"
            style={{
              border: `1px solid ${BRAND.border}`,
              backgroundColor: "#FFFFFF",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = BRAND.primaryLight;
              e.target.style.boxShadow = `0 0 0 2px ${BRAND.hoverLight || "#C8E6C9"}`;
              e.target.style.backgroundColor = BRAND.bgLight;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = BRAND.border;
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = "#FFFFFF";
            }}
            onMouseEnter={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.backgroundColor = BRAND.bgLight;
              }
            }}
            onMouseLeave={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.backgroundColor = "#FFFFFF";
              }
            }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: BRAND.textMedium }}
          >
            New password
          </label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={data.new_password}
            onChange={(e) =>
              setData({ ...data, new_password: e.target.value })
            }
            className="w-full rounded-md px-3 py-2 text-sm outline-none transition-all duration-200"
            style={{
              border: `1px solid ${BRAND.border}`,
              backgroundColor: "#FFFFFF",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = BRAND.primaryLight;
              e.target.style.boxShadow = `0 0 0 2px ${BRAND.hoverLight || "#C8E6C9"}`;
              e.target.style.backgroundColor = BRAND.bgLight;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = BRAND.border;
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = "#FFFFFF";
            }}
            onMouseEnter={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.backgroundColor = BRAND.bgLight;
              }
            }}
            onMouseLeave={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.backgroundColor = "#FFFFFF";
              }
            }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: BRAND.textMedium }}
          >
            Confirm new password
          </label>
          <input
            type="password"
            placeholder="Repeat new password"
            value={data.confirm_password}
            onChange={(e) =>
              setData({ ...data, confirm_password: e.target.value })
            }
            className="w-full rounded-md px-3 py-2 text-sm outline-none transition-all duration-200"
            style={{
              border: `1px solid ${BRAND.border}`,
              backgroundColor: "#FFFFFF",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = BRAND.primaryLight;
              e.target.style.boxShadow = `0 0 0 2px ${BRAND.hoverLight || "#C8E6C9"}`;
              e.target.style.backgroundColor = BRAND.bgLight;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = BRAND.border;
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = "#FFFFFF";
            }}
            onMouseEnter={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.backgroundColor = BRAND.bgLight;
              }
            }}
            onMouseLeave={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.backgroundColor = "#FFFFFF";
              }
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs mb-2 rounded-md px-3 py-2"
           style={{
             color: "#C62828",
             backgroundColor: "#FFEBEE",
             border: "1px solid #FFCDD2",
           }}
        >
          {error}
        </p>
      )}
      {status && (
        <p className="text-xs mb-2 rounded-md px-3 py-2"
           style={{
             color: BRAND.primaryDark,
             backgroundColor: "#C8E6C9",
             border: `1px solid ${BRAND.primaryLight}`,
           }}
        >
          {status}
        </p>
      )}

      <button
        onClick={handlePasswordChange}
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
        {loading ? "Updating..." : "Update password"}
      </button>
    </div>
  );
};

export default PasswordTab;
