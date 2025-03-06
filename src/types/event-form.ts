
export interface EventFormData {
  title: string;
  description: string;
  category: string;
  eventDate: Date | undefined;
  eventTime: string;
  location: string;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  price: string;
  tags: string[];
  mediaFile: File | null;
}

export interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export interface EventImageUploaderProps {
  mediaFile: File | null;
  setMediaFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}

export interface EventFormProps {
  isLoading: boolean;
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  tagInput: string;
  setTagInput: (input: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
