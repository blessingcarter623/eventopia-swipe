
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  isVerified?: boolean;
  role: 'user' | 'organizer';
  savedEvents?: string[];
  tickets?: Ticket[];
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  location: string;
  date: string;
  time: string;
  price: number | string;
  category: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  tags: string[];
  isSaved?: boolean;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  purchaseDate: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  qrCode: string;
  price: number;
  currency: string;
}
