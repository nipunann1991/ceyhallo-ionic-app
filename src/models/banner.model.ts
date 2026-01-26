export interface Banner {
  id: string;
  category: string;
  title: string;
  description?: string;
  image: string;
  active?: boolean;
  targetId?: string;
  targetType?: 'news' | 'business' | 'restaurant' | 'event' | 'job';
  navigationType?: 'none' | 'internal' | 'external' | 'share';
  order?: number;
}