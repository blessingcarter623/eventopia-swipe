
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Tags } from "lucide-react";
import { TagInputProps } from "@/types/event-form";

interface TagDisplayProps {
  tag: string;
  onRemove: (tag: string) => void;
}

const TagItem: React.FC<TagDisplayProps> = ({ tag, onRemove }) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-neon-blue rounded-full text-sm">
      <span>{tag}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-4 w-4 hover:bg-transparent p-0"
        onClick={() => onRemove(tag)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

interface TagListProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

const TagList: React.FC<TagListProps> = ({ tags, onRemoveTag }) => {
  if (tags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag) => (
        <TagItem key={tag} tag={tag} onRemove={onRemoveTag} />
      ))}
    </div>
  );
};

interface TagInputFieldProps {
  tagInput: string;
  setTagInput: (input: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onAddTag: () => void;
}

const TagInputField: React.FC<TagInputFieldProps> = ({ 
  tagInput, 
  setTagInput, 
  onKeyDown, 
  onAddTag 
}) => {
  return (
    <div className="flex">
      <div className="relative flex-1">
        <Input
          id="tags"
          placeholder="Add tags (press Enter)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="bg-darkbg-lighter border-gray-700 text-white pl-10"
        />
        <Tags className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>
      <Button
        type="button"
        className="ml-2 bg-neon-blue text-white hover:bg-neon-blue/80"
        onClick={onAddTag}
      >
        Add
      </Button>
    </div>
  );
};

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
      
      <TagInputField
        tagInput={tagInput}
        setTagInput={setTagInput}
        onKeyDown={handleTagKeyDown}
        onAddTag={addTag}
      />
      
      <TagList 
        tags={tags} 
        onRemoveTag={removeTag} 
      />
    </div>
  );
};

export default TagInput;
