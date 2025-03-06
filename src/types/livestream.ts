
export interface Livestream {
  id: string;
  title: string;
  description: string | null;
  host_id: string;
  status: 'scheduled' | 'live' | 'ended' | 'canceled';
  stream_key: string;
  scheduled_start: string | null;
  actual_start: string | null;
  actual_end: string | null;
  recording_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  host?: {
    name: string;
    avatar: string;
  };
}

export interface LivestreamCamera {
  id: string;
  livestream_id: string;
  user_id: string;
  camera_label: string;
  join_token: string;
  is_active: boolean;
  joined_at: string | null;
  left_at: string | null;
  created_at: string;
  user?: {
    name: string;
    avatar: string;
  };
}

export interface StreamSettings {
  video: boolean;
  audio: boolean;
  quality: 'low' | 'medium' | 'high';
  cameraId: string | null;
  microphoneId: string | null;
}
