
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
  organizerId?: string;
  isFeatured?: boolean;
  gallery?: string[];
  actionType?: string;
  actionTarget?: string;
  actionLabel?: string;
  countryCode?: string;
  cityCode?: string;
  isExpired?: boolean;
  isArchived?: boolean;
}
