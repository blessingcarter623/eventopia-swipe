
import React from 'react';
import { LivestreamCard } from './LivestreamCard';
import { Livestream } from '@/types/livestream';

interface LivestreamGridProps {
  livestreams: Livestream[];
  title: string;
  emptyMessage: string;
}

export const LivestreamGrid: React.FC<LivestreamGridProps> = ({
  livestreams,
  title,
  emptyMessage,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      
      {livestreams.length === 0 ? (
        <div className="text-center py-12 bg-darkbg-lighter rounded-lg border border-gray-800">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {livestreams.map((livestream) => (
            <LivestreamCard
              key={livestream.id}
              livestream={livestream}
            />
          ))}
        </div>
      )}
    </div>
  );
};
