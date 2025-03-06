
import React from "react";
import { Button } from "@/components/ui/button";
import { EventFormProps } from "@/types/event-form";
import BasicInfoSection from "./EventFormSections/BasicInfoSection";
import DateTimeSection from "./EventFormSections/DateTimeSection";
import LocationSection from "./EventFormSections/LocationSection";
import PriceSection from "./EventFormSections/PriceSection";
import TagInput from "./TagInput";
import EventImageUploader from "./EventImageUploader";

const EventForm: React.FC<EventFormProps> = ({
  isLoading,
  formData,
  setFormData,
  handleSubmit,
  previewUrl,
  setPreviewUrl,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  handleTagKeyDown,
  handleFileChange,
}) => {
  const updateFormData = <K extends keyof typeof formData>(
    key: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Determine if this is an edit or create form based on whether title exists
  const isEditMode = formData.title !== "";
  const buttonText = isLoading 
    ? (isEditMode ? "Updating..." : "Creating...") 
    : (isEditMode ? "Update Event" : "Create Event");

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-xl mx-auto">
      <BasicInfoSection 
        formData={formData}
        updateFormData={updateFormData}
      />
      
      <DateTimeSection 
        formData={formData}
        updateFormData={updateFormData}
      />
      
      <LocationSection 
        formData={formData}
        updateFormData={updateFormData}
      />
      
      <PriceSection
        formData={formData}
        updateFormData={updateFormData}
      />
      
      <EventImageUploader
        mediaFile={formData.mediaFile}
        setMediaFile={(file) => updateFormData("mediaFile", file)}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
      />
      
      <TagInput
        tags={formData.tags}
        setTags={(tags) => updateFormData("tags", tags)}
        tagInput={tagInput}
        setTagInput={setTagInput}
        addTag={addTag}
        removeTag={removeTag}
        handleTagKeyDown={handleTagKeyDown}
      />
      
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-neon-yellow text-black hover:bg-neon-yellow/90"
          disabled={isLoading}
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
