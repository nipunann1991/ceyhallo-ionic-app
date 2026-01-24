export interface Event {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  date: Date;
  location: string;
  category: string;
  organizer: string;
  isFeatured?: boolean;
}