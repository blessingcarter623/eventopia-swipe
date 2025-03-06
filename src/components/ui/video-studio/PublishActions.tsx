
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Image, Loader2 } from "lucide-react";

interface PublishActionsProps {
  isSaving: boolean;
  isUploading: boolean;
  publishStatus: 'draft' | 'published';
  handleSaveDraft: () => void;
  handlePublish: () => void;
}

export const PublishActions = ({
  isSaving,
  isUploading,
  publishStatus,
  handleSaveDraft,
  handlePublish
}: PublishActionsProps) => {
  return (
    <div className="p-4 bg-darkbg-lighter border-t border-white/10">
      <div className="flex justify-between items-center">
        <Button variant="outline" className="text-white border-white/20">
          <Image className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            className="border-white/20 text-white"
            onClick={handleSaveDraft}
            disabled={isSaving || isUploading}
          >
            {(isSaving || isUploading) && publishStatus === 'draft' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Save Draft
          </Button>
          <Button 
            className="bg-neon-yellow hover:bg-neon-yellow/90 text-black"
            onClick={handlePublish}
            disabled={isSaving || isUploading}
          >
            {(isSaving || isUploading) && publishStatus === 'published' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Publish Event
          </Button>
        </div>
      </div>
    </div>
  );
};
