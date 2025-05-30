
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Livestream, LivestreamCamera } from '@/types/livestream';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useLivestreams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active and scheduled livestreams
  const { 
    data: livestreams = [], 
    isLoading: isLoadingLivestreams,
    error: livestreamsError,
    refetch: refetchLivestreams
  } = useQuery({
    queryKey: ['livestreams'],
    queryFn: async () => {
      // First fetch livestreams
      const { data: streamsData, error: streamsError } = await supabase
        .from('livestreams')
        .select(`*`)
        .in('status', ['scheduled', 'live'])
        .order('scheduled_start', { ascending: true });

      if (streamsError) throw streamsError;

      // Then fetch profiles for each host
      const livestreamsWithHosts = await Promise.all(
        streamsData.map(async (stream) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', stream.host_id)
            .single();

          if (profileError) {
            console.error('Error fetching host profile:', profileError);
            return {
              ...stream,
              host: {
                name: 'Unknown Host',
                avatar: `https://i.pravatar.cc/150?u=${stream.host_id}`,
              }
            };
          }

          return {
            ...stream,
            host: {
              name: profileData.display_name || 'Unknown Host',
              avatar: profileData.avatar_url || `https://i.pravatar.cc/150?u=${stream.host_id}`,
            }
          };
        })
      );

      return livestreamsWithHosts as Livestream[];
    },
  });

  // Fetch user's hosted livestreams
  const { 
    data: hostedLivestreams = [], 
    isLoading: isLoadingHosted,
    error: hostedError,
  } = useQuery({
    queryKey: ['hostedLivestreams', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('livestreams')
        .select(`*`)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Livestream[];
    },
    enabled: !!user,
  });

  // Create a new livestream
  const createLivestream = useMutation({
    mutationFn: async (newStream: Partial<Livestream>) => {
      if (!user) throw new Error('You must be logged in to create a livestream');

      const streamKey = uuidv4();
      
      const { data, error } = await supabase
        .from('livestreams')
        .insert({
          title: newStream.title,
          description: newStream.description,
          host_id: user.id,
          status: 'scheduled',
          stream_key: streamKey,
          scheduled_start: newStream.scheduled_start,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Livestream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestreams'] });
      queryClient.invalidateQueries({ queryKey: ['hostedLivestreams', user?.id] });
      
      toast({
        title: 'Livestream created',
        description: 'Your livestream has been scheduled successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating livestream',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update a livestream
  const updateLivestream = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Livestream> & { id: string }) => {
      const { data, error } = await supabase
        .from('livestreams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Livestream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestreams'] });
      queryClient.invalidateQueries({ queryKey: ['hostedLivestreams', user?.id] });
      
      toast({
        title: 'Livestream updated',
        description: 'Your livestream has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating livestream',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add a camera to a livestream
  const addCamera = useMutation({
    mutationFn: async ({ 
      livestreamId, 
      userId, 
      cameraLabel 
    }: { 
      livestreamId: string; 
      userId: string; 
      cameraLabel: string;
    }) => {
      const joinToken = uuidv4();
      
      const { data, error } = await supabase
        .from('livestream_cameras')
        .insert({
          livestream_id: livestreamId,
          user_id: userId,
          camera_label: cameraLabel,
          join_token: joinToken,
        })
        .select()
        .single();

      if (error) throw error;
      return data as LivestreamCamera;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['livestreamCameras', data.livestream_id] });
      
      toast({
        title: 'Camera added',
        description: 'The camera has been added to your livestream',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error adding camera',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fetch cameras for a specific livestream
  const getLivestreamCameras = async (livestreamId: string) => {
    // First fetch camera entries
    const { data: camerasData, error: camerasError } = await supabase
      .from('livestream_cameras')
      .select(`*`)
      .eq('livestream_id', livestreamId);

    if (camerasError) throw camerasError;

    // Then fetch profiles for each camera operator
    const camerasWithProfiles = await Promise.all(
      camerasData.map(async (camera) => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', camera.user_id)
          .single();

        if (profileError) {
          console.error('Error fetching camera operator profile:', profileError);
          return {
            ...camera,
            user: {
              name: 'Unknown User',
              avatar: `https://i.pravatar.cc/150?u=${camera.user_id}`,
            }
          };
        }

        return {
          ...camera,
          user: {
            name: profileData.display_name || 'Unknown User',
            avatar: profileData.avatar_url || `https://i.pravatar.cc/150?u=${camera.user_id}`,
          }
        };
      })
    );

    return camerasWithProfiles as LivestreamCamera[];
  };

  // Start a livestream
  const startLivestream = async (livestreamId: string) => {
    const { data, error } = await supabase
      .from('livestreams')
      .update({
        status: 'live',
        actual_start: new Date().toISOString(),
      })
      .eq('id', livestreamId)
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['livestreams'] });
    queryClient.invalidateQueries({ queryKey: ['hostedLivestreams', user?.id] });
    
    return data as Livestream;
  };

  // End a livestream
  const endLivestream = async (livestreamId: string, recordingUrl?: string) => {
    const { data, error } = await supabase
      .from('livestreams')
      .update({
        status: 'ended',
        actual_end: new Date().toISOString(),
        recording_url: recordingUrl || null,
      })
      .eq('id', livestreamId)
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['livestreams'] });
    queryClient.invalidateQueries({ queryKey: ['hostedLivestreams', user?.id] });
    
    return data as Livestream;
  };

  return {
    livestreams,
    isLoadingLivestreams,
    livestreamsError,
    refetchLivestreams,
    hostedLivestreams,
    isLoadingHosted,
    hostedError,
    createLivestream,
    updateLivestream,
    addCamera,
    getLivestreamCameras,
    startLivestream,
    endLivestream,
  };
};
