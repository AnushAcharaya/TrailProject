import React from "react";
import "../../styles/appointments.css";

const SearchBar = ({ placeholder, value, onChange, onSearch }) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(e);
    }
    if (onSearch) {
      onSearch(newValue);
    }
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder={placeholder}
        className="app-search"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
