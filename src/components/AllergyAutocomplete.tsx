
import React, { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { COMMON_ALLERGIES } from "@/lib/allergiesList";

interface AllergyAutocompleteProps {
  value: string[];
  onChange: (newAllergies: string[]) => void;
  disabled?: boolean;
}

export default function AllergyAutocomplete({
  value,
  onChange,
  disabled = false,
}: AllergyAutocompleteProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const inputLow = input.toLowerCase();
    const filtered = COMMON_ALLERGIES
      .filter(
        (item) =>
          item.toLowerCase().startsWith(inputLow) &&
          !value.map(v => v.toLowerCase()).includes(item.toLowerCase())
      )
      .sort();
    setSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  }, [input, value]);

  const handleSelect = (item: string) => {
    if (!value.includes(item)) {
      onChange([...value, item]);
    }
    setInput("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleAddCustom = () => {
    const val = input.trim();
    if (val && !value.some(a => a.toLowerCase() === val.toLowerCase())) {
      onChange([...value, val]);
    }
    setInput("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleRemove = (toRemove: string) => {
    onChange(value.filter(a => a !== toRemove));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If a suggestion is available, pick first, else add custom
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else {
        handleAddCustom();
      }
    }
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      handleRemove(value[value.length - 1]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1 mb-1">
        {value.map((allergy) => (
          <div
            key={allergy}
            className="flex items-center px-2 py-0.5 bg-accent text-sm rounded-full mr-1 mb-1"
          >
            {allergy}
            <button
              type="button"
              className="ml-1 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(allergy)}
              disabled={disabled}
              aria-label="Remove"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          disabled={disabled}
          type="text"
          className="w-full border rounded px-3 py-2 outline-none focus:ring-2 ring-blue-200"
          placeholder="Type to search or add allergies"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowDropdown(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
          onKeyDown={handleKeyDown}
        />
        {showDropdown && (
          <div
            className="absolute z-50 left-0 right-0 bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto"
            style={{ minWidth: "100%" }}
          >
            {suggestions.map((item) => (
              <div
                key={item}
                className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                onMouseDown={() => handleSelect(item)}
                tabIndex={-1}
              >
                <Plus size={16} className="mr-2 text-muted-foreground" />
                {item}
              </div>
            ))}
            {suggestions.length === 0 &&
              !!input.trim() &&
              !value.some(a => a.toLowerCase() === input.trim().toLowerCase()) && (
                <div
                  className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                  onMouseDown={handleAddCustom}
                  tabIndex={-1}
                >
                  <Plus size={16} className="mr-2 text-muted-foreground" />
                  Add "{input}"
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
