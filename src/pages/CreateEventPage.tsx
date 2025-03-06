
import React from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import EventForm from "@/components/event/EventForm";
import { useEventForm } from "@/hooks/useEventForm";

const CreateEventPage = () => {
  const {
    isLoading,
    formData,
    setFormData,
    previewUrl,
    setPreviewUrl,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleFileChange,
    handleSubmit,
  } = useEventForm();

  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Create Event</h1>
        </div>
        
        <EventForm
          isLoading={isLoading}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          tagInput={tagInput}
          setTagInput={setTagInput}
          addTag={addTag}
          removeTag={removeTag}
          handleTagKeyDown={handleTagKeyDown}
          handleFileChange={handleFileChange}
        />
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default CreateEventPage;
