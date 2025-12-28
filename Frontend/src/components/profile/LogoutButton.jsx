// LogoutButton.jsx
import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

const LogoutButton = () => {
  const logout = () => {
    // Demo only: clear dummy token if present
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  return (
    <button
      onClick={logout}
      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md w-full mt-2 transition-colors shadow-sm"
    >
      <FaSignOutAlt />
      Logout
    </button>
  );
};

export default LogoutButton;
