
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Image } from "lucide-react";
import { EventImageUploaderProps } from "@/types/event-form";

const EventImageUploader: React.FC<EventImageUploaderProps> = ({
  mediaFile,
  setMediaFile,
  previewUrl,
  setPreviewUrl,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image" className="text-white">Event Image</Label>
      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload')?.click()}
          className="bg-darkbg-lighter border-gray-700 text-white"
        >
          <Image className="mr-2 h-4 w-4" />
          Choose Image
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 border-none text-white hover:bg-red-600"
              onClick={() => {
                setMediaFile(null);
                setPreviewUrl(null);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventImageUploader;
