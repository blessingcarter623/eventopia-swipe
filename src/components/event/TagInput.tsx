
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Tags } from "lucide-react";
import { TagInputProps } from "@/types/event-form";

const TagInput: React.FC<TagInputProps & {
  tagInput: string;
  setTagInput: (input: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent) => void;
}> = ({ 
  tags, 
  tagInput, 
  setTagInput, 
  addTag, 
  removeTag, 
  handleTagKeyDown 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="tags" className="text-white">Tags</Label>
      <div className="flex">
        <div className="relative flex-1">
          <Input
            id="tags"
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="bg-darkbg-lighter border-gray-700 text-white pl-10"
          />
          <Tags className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
        <Button
          type="button"
          className="ml-2 bg-neon-blue text-white hover:bg-neon-blue/80"
          onClick={addTag}
        >
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 px-2 py-1 bg-neon-blue rounded-full text-sm"
            >
              <span>{tag}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent p-0"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
