
import { useState } from "react";
import { EventFormData } from "@/types/event-form";

export interface TagManagementResult {
  tagInput: string;
  setTagInput: (input: string) => void;
  addTag: () => void;
  removeTag: (tagToRemove: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent) => void;
}

export const useTagManagement = (formData: EventFormData, setFormData: React.Dispatch<React.SetStateAction<EventFormData>>): TagManagementResult => {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (tagInput.trim() !== "" && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return {
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagKeyDown
  };
};
