
import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { Comment as CommentComponent } from "./comment";
import { cn } from "@/lib/utils";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "./skeleton";

interface CommentsDrawerProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsDrawer({
  eventId,
  isOpen,
  onClose,
}: CommentsDrawerProps) {
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading, addComment, likeComment, replyToComment } = useComments(eventId);
  const { user } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(newComment);
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
          {isLoading ? (
            <div className="space-y-4">
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                onLike={likeComment}
                onReply={replyToComment}
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
            placeholder={user ? "Add a comment..." : "Sign in to comment"}
            className="flex-1 bg-darkbg rounded-full px-4 py-3 text-white border border-white/10 focus:outline-none focus:border-neon-yellow"
            disabled={!user}
          />
          <button 
            type="submit"
            className={cn(
              "rounded-full w-12 h-12 flex items-center justify-center",
              user && newComment.trim() 
                ? "bg-neon-yellow text-black" 
                : "bg-white/10 text-gray-400 cursor-not-allowed"
            )}
            disabled={!newComment.trim() || !user}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Comment skeleton loader component
function CommentSkeleton() {
  return (
    <div className="flex gap-3 mb-4">
      <Skeleton className="w-8 h-8 rounded-full bg-white/10" />
      <div className="flex-1">
        <div className="glass-card rounded-xl p-3">
          <div className="flex justify-between">
            <Skeleton className="w-24 h-4 bg-white/10" />
            <Skeleton className="w-16 h-3 bg-white/10" />
          </div>
          <Skeleton className="w-full h-4 mt-2 bg-white/10" />
          <Skeleton className="w-3/4 h-4 mt-1 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
