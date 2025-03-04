import React from "react";

function SelectComponent({ options, handleChange, label, value }) {
  return (
    <div className="form-control">
      <label className="mb-2">{label}</label>
      <select className="form-select" onChange={handleChange} value={value}>
        {options.map((option, index) => (
          <option value={option} key={index}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectComponent;
