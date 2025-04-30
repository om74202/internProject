import React, { useState, useRef, useEffect } from "react";

const MultiSelectDropdown = ({ options, onChange,preSelected=[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (preSelected) {
      setSelected(preSelected);
    }
  }, [preSelected]);

  const handleSelect = (option) => {
    const isSelected = selected.includes(option);
    let newSelected;
    if (isSelected) {
      newSelected = selected.filter((item) => item !== option);
    } else {
      newSelected = [...selected, option];
    }
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <div
        className="border p-2 rounded cursor-pointer bg-white shadow"
        onClick={toggleDropdown}
      >
        {selected.length > 0
          ? selected.join(", ")
          : "Select components"}
      </div>

      {isOpen && (
        <ul className="absolute z-10 bg-white w-full border mt-1 rounded shadow max-h-60 overflow-y-auto">
          {options.map((option) => (
            <li
              key={option}
              className={`p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                selected.includes(option) ? "bg-blue-100" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              <span>{option}</span>
              {selected.includes(option) && (
                <span className="text-blue-500">✔</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
