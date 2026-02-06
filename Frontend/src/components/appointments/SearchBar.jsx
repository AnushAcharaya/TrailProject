import React from "react";
import "../../styles/appointments.css";

const SearchBar = ({ placeholder }) => {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder={placeholder}
        className="app-search"
      />
    </div>
  );
};

export default SearchBar;
