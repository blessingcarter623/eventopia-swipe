
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { Livestream } from '@/types/livestream';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface LivestreamCardProps {
  livestream: Livestream;
  onJoin?: () => void;
}

export const LivestreamCard: React.FC<LivestreamCardProps> = ({ 
  livestream,
  onJoin
}) => {
  const isLive = livestream.status === 'live';
  const formattedDate = livestream.scheduled_start 
    ? formatDistanceToNow(new Date(livestream.scheduled_start), { addSuffix: true })
    : 'Date not set';

  return (
    <Card className="overflow-hidden bg-darkbg-lighter border-gray-800 hover:border-gray-700 transition-all duration-300">
      <div className="relative aspect-video overflow-hidden bg-gray-900">
        {livestream.thumbnail_url ? (
          <img 
            src={livestream.thumbnail_url} 
            alt={livestream.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
            <Video className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {isLive && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="bg-red-600 hover:bg-red-700">
              LIVE
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 text-white">{livestream.title}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={livestream.host?.avatar} alt={livestream.host?.name} />
            <AvatarFallback>
              {livestream.host?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-300">{livestream.host?.name}</span>
        </div>
        
        {livestream.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {livestream.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
          {livestream.scheduled_start && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          )}
          
          {isLive && livestream.actual_start && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                Started {formatDistanceToNow(new Date(livestream.actual_start), { addSuffix: true })}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>0 viewers</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-darkbg border-t border-gray-800 flex justify-between">
        {isLive ? (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full bg-neon-yellow text-black hover:bg-neon-yellow/90"
            onClick={onJoin}
            asChild
          >
            <Link to={`/livestream/${livestream.id}`}>
              Watch Now
            </Link>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-neon-yellow text-neon-yellow hover:bg-neon-yellow/10"
            onClick={onJoin}
            asChild
          >
            <Link to={`/livestream/${livestream.id}`}>
              View Details
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
