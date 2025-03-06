
import { useState } from "react";
import { EventFormData } from "@/types/event-form";

export interface FileHandlingResult {
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useFileHandling = (formData: EventFormData, setFormData: React.Dispatch<React.SetStateAction<EventFormData>>): FileHandlingResult => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        mediaFile: file
      }));
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  return {
    previewUrl,
    setPreviewUrl,
    handleFileChange
  };
};
