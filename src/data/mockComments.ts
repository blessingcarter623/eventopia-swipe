
export const mockComments = [
  {
    id: "1",
    userId: "2",
    username: "user1",
    avatar: "https://placehold.co/100?text=User",
    content: "This event looks amazing! Can't wait to attend.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 12,
  },
  {
    id: "2",
    userId: "3",
    username: "follower1",
    avatar: "https://placehold.co/100?text=F1",
    content: "I attended last year and it was incredible. Highly recommend!",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 8,
    replies: [
      {
        id: "2-1",
        userId: "4",
        username: "follower2",
        avatar: "https://placehold.co/100?text=F2",
        content: "I agree! The performances were outstanding.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        likes: 3,
      },
    ],
  },
  {
    id: "3",
    userId: "5",
    username: "follower3",
    avatar: "https://placehold.co/100?text=F3",
    content: "Will there be food vendors at the event?",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes: 2,
    replies: [
      {
        id: "3-1",
        userId: "1",
        username: "organizer1",
        avatar: "https://placehold.co/100?text=Org",
        content: "Yes! We'll have a variety of food trucks and vendors available throughout the event.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 5,
      },
    ],
  },
];
