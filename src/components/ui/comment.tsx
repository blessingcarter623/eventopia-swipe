
import React, { useState } from "react";
import { Comment as CommentType } from "@/types";
import { Heart, ChevronDown, ChevronUp, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CommentProps {
  comment: CommentType;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
}

export function Comment({ comment, onLike, onReply }: CommentProps) {
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
    onLike(comment.id);
  };
  
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText("");
      setIsReplying(false);
    }
  };
  
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  return (
    <div className="mb-4">
      <div className="flex gap-3">
        <img 
          src={comment.avatar} 
          alt={comment.username} 
          className="w-8 h-8 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="glass-card rounded-xl p-3">
            <div className="flex justify-between items-start">
              <span className="font-medium text-white">@{comment.username}</span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-200 mt-1">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 px-2">
            <button 
              className={cn("flex items-center gap-1", liked ? "text-neon-red" : "")} 
              onClick={handleLike}
            >
              <Heart className={cn("w-3 h-3", liked ? "fill-neon-red" : "")} />
              <span>{liked ? comment.likes + 1 : comment.likes}</span>
            </button>
            
            <button 
              className="flex items-center gap-1" 
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
            
            {hasReplies && (
              <button 
                className="flex items-center gap-1 ml-auto" 
                onClick={() => setShowReplies(!showReplies)}
              >
                <span>{showReplies ? "Hide replies" : `View ${comment.replies!.length} replies`}</span>
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
          
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-darkbg-lighter rounded-full px-4 py-2 text-sm border border-white/10 focus:outline-none focus:border-neon-yellow"
              />
              <button 
                type="submit"
                className="bg-neon-yellow text-black font-medium px-4 py-1 rounded-full text-sm"
              >
                Send
              </button>
            </form>
          )}
          
          {hasReplies && showReplies && (
            <div className="pl-4 mt-3 border-l border-white/10">
              {comment.replies!.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
