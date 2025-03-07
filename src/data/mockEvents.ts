
export const mockEvents = [
  {
    id: "1",
    title: "Summer Music Festival",
    description: "A three-day music festival featuring top artists from around the world.",
    media_type: "image",
    media_url: "https://placehold.co/600x400?text=Festival",
    thumbnail_url: "https://placehold.co/600x400?text=Festival",
    location: "Central Park, New York",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    time: "14:00",
    price: 75,
    category: "Music",
    organizer_id: "1",
    tags: ["music", "festival", "outdoor"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Tech Conference 2023",
    description: "Annual conference for developers and tech enthusiasts.",
    media_type: "image",
    media_url: "https://placehold.co/600x400?text=Tech",
    thumbnail_url: "https://placehold.co/600x400?text=Tech",
    location: "Convention Center, San Francisco",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    time: "09:00",
    price: 150,
    category: "Technology",
    organizer_id: "1",
    tags: ["tech", "conference", "networking"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Art Exhibition",
    description: "Featuring works from contemporary artists around the globe.",
    media_type: "image",
    media_url: "https://placehold.co/600x400?text=Art",
    thumbnail_url: "https://placehold.co/600x400?text=Art",
    location: "Downtown Gallery, Chicago",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    time: "10:00",
    price: 25,
    category: "Art",
    organizer_id: "1",
    tags: ["art", "exhibition", "culture"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];
