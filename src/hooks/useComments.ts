
import { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockComments } from '@/data/index';

export const useComments = (eventId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // For now, we'll use mock comments until we create a comments table in Supabase
  useEffect(() => {
    setComments(mockComments);
    setIsLoading(false);
  }, [eventId]);

  const addComment = (content: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
        variant: "destructive"
      });
      return;
    }

    const newComment: Comment = {
      id: `new-${Date.now()}`,
      userId: user.id,
      username: user.email?.split('@')[0] || 'user',
      avatar: `https://i.pravatar.cc/150?u=${user.id}`,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    setComments(prev => [newComment, ...prev]);
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added successfully",
    });

    // Here you would usually add a Supabase call to save the comment
    // We'll implement this once we have a comments table
  };

  const likeComment = (commentId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like comments",
        variant: "destructive"
      });
      return;
    }

    setComments(prev => 
      prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes: comment.likes + 1 };
        }
        return comment;
      })
    );
    
    toast({
      title: "Liked comment",
      description: "You liked this comment",
    });
  };

  const replyToComment = (commentId: string, content: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to reply",
        variant: "destructive"
      });
      return;
    }

    const newReply: Comment = {
      id: `reply-${Date.now()}`,
      userId: user.id,
      username: user.email?.split('@')[0] || 'user',
      avatar: `https://i.pravatar.cc/150?u=${user.id}`,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    setComments(prev => 
      prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        } else if (comment.replies) {
          const foundInReplies = comment.replies.some(reply => reply.id === commentId);
          if (foundInReplies) {
            return {
              ...comment,
              replies: [...comment.replies, newReply],
            };
          }
        }
        return comment;
      })
    );
  };

  return {
    comments,
    isLoading,
    addComment,
    likeComment,
    replyToComment
  };
};
