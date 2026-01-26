export interface Business {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isPromoted: boolean;
  description: string;
  phone: string;
  email: string;
  website: string;
  priceRange?: string;
  openingHours?: { days: string; time: string; }[];
  gallery?: string[];
  menuUrl?: string;
}