
import { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useComments = (eventId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch comments from Supabase
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        // Fetch main comments (those without parent_id)
        const { data: mainComments, error: mainError } = await supabase
          .from('comments')
          .select(`
            id, 
            content, 
            timestamp, 
            likes, 
            user_id,
            profiles:user_id (username, avatar_url)
          `)
          .eq('event_id', eventId)
          .is('parent_id', null)
          .order('timestamp', { ascending: false });

        if (mainError) throw mainError;

        // Fetch replies (comments with parent_id)
        const { data: replies, error: repliesError } = await supabase
          .from('comments')
          .select(`
            id, 
            content, 
            timestamp, 
            likes, 
            user_id,
            parent_id,
            profiles:user_id (username, avatar_url)
          `)
          .eq('event_id', eventId)
          .not('parent_id', 'is', null)
          .order('timestamp', { ascending: true });

        if (repliesError) throw repliesError;

        // Format main comments
        const formattedComments: Comment[] = mainComments.map((comment) => ({
          id: comment.id,
          userId: comment.user_id,
          username: comment.profiles?.username || 'user',
          avatar: comment.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${comment.user_id}`,
          content: comment.content,
          timestamp: comment.timestamp,
          likes: comment.likes,
          replies: []
        }));

        // Add replies to their parent comments
        const commentsWithReplies = formattedComments.map(comment => {
          const commentReplies = replies
            .filter(reply => reply.parent_id === comment.id)
            .map(reply => ({
              id: reply.id,
              userId: reply.user_id,
              username: reply.profiles?.username || 'user',
              avatar: reply.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${reply.user_id}`,
              content: reply.content,
              timestamp: reply.timestamp,
              likes: reply.likes
            }));
          return { ...comment, replies: commentReplies };
        });

        setComments(commentsWithReplies);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Failed to load comments",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchComments();
    }
  }, [eventId, toast]);

  const addComment = async (content: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          event_id: eventId,
          user_id: user.id,
          content
        })
        .select(`
          id, 
          content, 
          timestamp, 
          likes, 
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .single();

      if (error) throw error;

      const newComment: Comment = {
        id: data.id,
        userId: data.user_id,
        username: data.profiles?.username || user.email?.split('@')[0] || 'user',
        avatar: data.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
        content: data.content,
        timestamp: data.timestamp,
        likes: data.likes || 0,
        replies: []
      };

      setComments(prev => [newComment, ...prev]);
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Failed to add comment",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like comments",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current likes count
      const { data: currentComment, error: fetchError } = await supabase
        .from('comments')
        .select('likes')
        .eq('id', commentId)
        .single();

      if (fetchError) throw fetchError;

      // Update likes count
      const newLikes = (currentComment.likes || 0) + 1;
      const { error: updateError } = await supabase
        .from('comments')
        .update({ likes: newLikes })
        .eq('id', commentId);

      if (updateError) throw updateError;

      // Update local state
      setComments(prev => 
        prev.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, likes: newLikes };
          } else if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId ? { ...reply, likes: (reply.likes || 0) + 1 } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
      
      toast({
        title: "Liked comment",
        description: "You liked this comment",
      });
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: "Failed to like comment",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const replyToComment = async (commentId: string, content: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to reply",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          event_id: eventId,
          user_id: user.id,
          content,
          parent_id: commentId
        })
        .select(`
          id, 
          content, 
          timestamp, 
          likes, 
          user_id,
          parent_id,
          profiles:user_id (username, avatar_url)
        `)
        .single();

      if (error) throw error;

      const newReply: Comment = {
        id: data.id,
        userId: data.user_id,
        username: data.profiles?.username || user.email?.split('@')[0] || 'user',
        avatar: data.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
        content: data.content,
        timestamp: data.timestamp,
        likes: data.likes || 0,
      };

      // Update local state
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

      toast({
        title: "Reply added",
        description: "Your reply has been added successfully",
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Failed to add reply",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return {
    comments,
    isLoading,
    addComment,
    likeComment,
    replyToComment
  };
};
