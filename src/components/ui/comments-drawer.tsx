
import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { Comment as CommentComponent } from "./comment";
import { Comment } from "@/types";
import { cn } from "@/lib/utils";

interface CommentsDrawerProps {
  eventId: string;
  comments: Comment[];
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (eventId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onReplyComment: (commentId: string, content: string) => void;
}

export function CommentsDrawer({
  eventId,
  comments,
  isOpen,
  onClose,
  onAddComment,
  onLikeComment,
  onReplyComment,
}: CommentsDrawerProps) {
  const [newComment, setNewComment] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(eventId, newComment);
      setNewComment("");
    }
  };
  
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-darkbg-lighter rounded-t-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Comments ({comments.length})</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4 scrollbar-none">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                onLike={onLikeComment}
                onReply={onReplyComment}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-darkbg rounded-full px-4 py-3 text-white border border-white/10 focus:outline-none focus:border-neon-yellow"
          />
          <button 
            type="submit"
            className="bg-neon-yellow text-black rounded-full w-12 h-12 flex items-center justify-center"
            disabled={!newComment.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
