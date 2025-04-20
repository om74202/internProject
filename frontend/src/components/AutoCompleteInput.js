import { useState, useRef, useEffect } from 'react';

const AutocompleteInput = ({placeholder, suggestions = [] , onSelect ,setEmpty , value}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      setFilteredSuggestions(
        suggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase())
      ))
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    onSelect(suggestion);
    setInputValue(suggestion);
    setShowSuggestions(false);
    if(setEmpty===true){
      setInputValue('');
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="autocomplete-input  bg-slate-200 border rounded-lg h-9 border-gray-300  max-w-1/2"
      />
      {/* //bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500
       */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((suggestion, index) => (
            <li 
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item mouse-pointer hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {showSuggestions && filteredSuggestions.length == 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item mouse-pointer hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;  