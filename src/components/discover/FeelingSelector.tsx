
import React, { useState } from "react";
import { Search } from "lucide-react";

interface FeelingSelectorProps {
  onSelectFeeling: (feeling: string) => void;
  selectedFeeling: string;
}

const FeelingSelector: React.FC<FeelingSelectorProps> = ({ 
  onSelectFeeling, 
  selectedFeeling 
}) => {
  const [searchInput, setSearchInput] = useState("");
  
  const feelings = [
    "Music", "Jazz", "Seminar", "Party", "Workshop", 
    "Conference", "Art", "Sports", "Food", "Festival"
  ];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectFeeling(searchInput);
      setSearchInput("");
    }
  };
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-white">What are you feeling like?</h2>
      
      {/* Search input */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for an interest..."
          className="w-full bg-darkbg-lighter border border-white/10 rounded-full py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-yellow"
        />
      </form>
      
      {/* Quick feeling buttons */}
      <div className="flex flex-wrap gap-2">
        {feelings.map((feeling) => (
          <button
            key={feeling}
            onClick={() => onSelectFeeling(feeling)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedFeeling === feeling
                ? "bg-neon-yellow text-black font-medium"
                : "bg-darkbg-lighter text-gray-300 border border-white/10"
            }`}
          >
            {feeling}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeelingSelector;
