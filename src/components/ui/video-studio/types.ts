
export interface EventVideo {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  event_price: string;
  media_url: string;
  thumbnail_url: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}
