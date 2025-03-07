
import { Comment } from "../types";

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
