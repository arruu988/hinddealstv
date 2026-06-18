export interface User {
  id: string | number;
  user_id: number;
  username: string | null;
  plan: string;
  key: string;
  expiry_date: string;
  is_active: number;
  created_at: string;
}

export interface Content {
  id: string | number;
  title: string;
  description: string;
  category: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  media_type: string;
  views: number;
  is_active: number;
  uploaded_at: string;
}
