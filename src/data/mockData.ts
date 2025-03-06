
import { Event, User, Comment } from "../types";

export const mockUsers: User[] = [
  {
    id: "1",
    username: "minainbaski",
    displayName: "Minain Baski",
    avatar: "/lovable-uploads/283ce6b6-82be-431d-8719-76ccea6a2b32.png",
    bio: "Event promoter & concert organizer",
    followers: 14900,
    following: 378,
    posts: 264,
    isVerified: true,
  },
  {
    id: "2",
    username: "eventmaster",
    displayName: "Event Master",
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "Creating unforgettable experiences",
    followers: 34500,
    following: 215,
    posts: 189,
    isVerified: true,
  },
  {
    id: "3",
    username: "musiclover",
    displayName: "Music Lover",
    avatar: "https://i.pravatar.cc/150?img=3",
    followers: 2300,
    following: 450,
    posts: 87,
  },
  {
    id: "4",
    username: "partyplanner",
    displayName: "Party Planner",
    avatar: "https://i.pravatar.cc/150?img=4",
    bio: "Your go-to party planner!",
    followers: 8900,
    following: 320,
    posts: 156,
    isVerified: true,
  },
  {
    id: "5",
    username: "festivalgoer",
    displayName: "Festival Goer",
    avatar: "https://i.pravatar.cc/150?img=5",
    followers: 1200,
    following: 643,
    posts: 78,
  },
];

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Neon Nights Music Festival",
    description: "The biggest electronic music festival of the year with top DJs from around the world. Experience incredible light shows and unforgettable music in this all-night event.",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    location: "Sunset Arena, Miami",
    date: "2023-11-25",
    time: "22:00 - 06:00",
    price: 89.99,
    category: "Music",
    organizer: {
      id: "1",
      name: "Minain Baski",
      avatar: "/lovable-uploads/283ce6b6-82be-431d-8719-76ccea6a2b32.png",
      isVerified: true,
    },
    stats: {
      likes: 8200,
      comments: 743,
      shares: 434,
      views: 29300,
    },
    tags: ["music", "electronic", "festival", "dj"],
  },
  {
    id: "2",
    title: "Urban Art Exhibition",
    description: "Discover the works of emerging street artists in this unique exhibition that explores urban culture and contemporary art trends.",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    location: "Modern Gallery, New York",
    date: "2023-11-15",
    time: "10:00 - 20:00",
    price: "Free",
    category: "Art",
    organizer: {
      id: "2",
      name: "Event Master",
      avatar: "https://i.pravatar.cc/150?img=2",
      isVerified: true,
    },
    stats: {
      likes: 3450,
      comments: 156,
      shares: 287,
      views: 12400,
    },
    tags: ["art", "exhibition", "street art", "culture"],
  },
  {
    id: "3",
    title: "Tech Innovation Summit",
    description: "Join industry leaders and innovators for a day of inspiring talks, workshops and networking focused on the future of technology.",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    location: "Tech Hub, San Francisco",
    date: "2023-11-30",
    time: "09:00 - 18:00",
    price: 199.99,
    category: "Business",
    organizer: {
      id: "4",
      name: "Party Planner",
      avatar: "https://i.pravatar.cc/150?img=4",
      isVerified: true,
    },
    stats: {
      likes: 2100,
      comments: 89,
      shares: 321,
      views: 8100,
    },
    tags: ["technology", "innovation", "business", "networking"],
  },
  {
    id: "4",
    title: "Yoga & Wellness Retreat",
    description: "A weekend of relaxation, yoga and mindfulness practices to rejuvenate your body and mind in a beautiful natural setting.",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    location: "Serenity Lodge, Aspen",
    date: "2023-12-10",
    time: "All day",
    price: 349.99,
    category: "Wellness",
    organizer: {
      id: "5",
      name: "Festival Goer",
      avatar: "https://i.pravatar.cc/150?img=5",
      isVerified: false,
    },
    stats: {
      likes: 1800,
      comments: 76,
      shares: 123,
      views: 5600,
    },
    tags: ["yoga", "wellness", "retreat", "mindfulness"],
  },
  {
    id: "5",
    title: "Indie Film Festival",
    description: "Celebrate independent cinema with screenings of award-winning films from around the world, director Q&As and industry workshops.",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    location: "Arts Cinema, Portland",
    date: "2023-12-05",
    time: "14:00 - 23:00",
    price: 65,
    category: "Film",
    organizer: {
      id: "3",
      name: "Music Lover",
      avatar: "https://i.pravatar.cc/150?img=3",
      isVerified: false,
    },
    stats: {
      likes: 2400,
      comments: 132,
      shares: 187,
      views: 7800,
    },
    tags: ["film", "cinema", "indie", "festival"],
  },
];

export const mockComments: Comment[] = [
  {
    id: "1",
    userId: "3",
    username: "musiclover",
    avatar: "https://i.pravatar.cc/150?img=3",
    content: "Can't wait for this event! The lineup looks amazing!",
    timestamp: "2023-11-01T14:23:00Z",
    likes: 24,
    replies: [
      {
        id: "1-1",
        userId: "5",
        username: "festivalgoer",
        avatar: "https://i.pravatar.cc/150?img=5",
        content: "Same here! Are you coming from out of town?",
        timestamp: "2023-11-01T15:01:00Z",
        likes: 8,
      },
      {
        id: "1-2",
        userId: "3",
        username: "musiclover",
        avatar: "https://i.pravatar.cc/150?img=3",
        content: "Yes, flying in from Chicago. So excited!",
        timestamp: "2023-11-01T15:30:00Z",
        likes: 5,
      },
    ],
  },
  {
    id: "2",
    userId: "4",
    username: "partyplanner",
    avatar: "https://i.pravatar.cc/150?img=4",
    content: "I attended last year and it was incredible. Highly recommend VIP tickets!",
    timestamp: "2023-11-01T12:45:00Z",
    likes: 42,
  },
  {
    id: "3",
    userId: "2",
    username: "eventmaster",
    avatar: "https://i.pravatar.cc/150?img=2",
    content: "Does anyone know if there's parking nearby?",
    timestamp: "2023-11-02T09:15:00Z",
    likes: 7,
    replies: [
      {
        id: "3-1",
        userId: "1",
        username: "minainbaski",
        avatar: "/lovable-uploads/283ce6b6-82be-431d-8719-76ccea6a2b32.png",
        content: "Yes, there's a large parking garage across the street. We also have shuttle services from downtown!",
        timestamp: "2023-11-02T10:20:00Z",
        likes: 19,
      },
    ],
  },
  {
    id: "4",
    userId: "5",
    username: "festivalgoer",
    avatar: "https://i.pravatar.cc/150?img=5",
    content: "Will there be food vendors at the event?",
    timestamp: "2023-11-03T17:05:00Z",
    likes: 11,
  },
];
