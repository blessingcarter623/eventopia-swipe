
import React from 'react';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { LivestreamGrid } from '@/components/livestream/LivestreamGrid';
import { Button } from '@/components/ui/button';
import { Plus, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLivestreams } from '@/hooks/useLivestreams';
import { useAuth } from '@/context/AuthContext';

const LivestreamsList = () => {
  const { profile } = useAuth();
  const { 
    livestreams, 
    hostedLivestreams,
    isLoadingLivestreams,
    isLoadingHosted
  } = useLivestreams();

  const liveLivestreams = livestreams.filter(stream => stream.status === 'live');
  const upcomingLivestreams = livestreams.filter(stream => stream.status === 'scheduled');

  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        <div className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Livestreams</h1>
            {profile?.role === 'organizer' && (
              <Button
                variant="default"
                className="bg-neon-yellow text-black hover:bg-neon-yellow/90"
                asChild
              >
                <Link to="/create-livestream">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Livestream
                </Link>
              </Button>
            )}
          </div>

          {/* Live Now Section */}
          {isLoadingLivestreams ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-gray-800 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-video bg-gray-800 rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <LivestreamGrid
              livestreams={liveLivestreams}
              title="Live Now"
              emptyMessage="No live streams at the moment"
            />
          )}

          {/* Upcoming Section */}
          {isLoadingLivestreams ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-gray-800 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-video bg-gray-800 rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <LivestreamGrid
              livestreams={upcomingLivestreams}
              title="Upcoming"
              emptyMessage="No upcoming streams scheduled"
            />
          )}

          {/* My Streams Section (for organizers) */}
          {profile?.role === 'organizer' && (
            isLoadingHosted ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-48 bg-gray-800 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-video bg-gray-800 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : (
              <LivestreamGrid
                livestreams={hostedLivestreams}
                title="My Streams"
                emptyMessage="You haven't created any streams yet"
              />
            )
          )}
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default LivestreamsList;
