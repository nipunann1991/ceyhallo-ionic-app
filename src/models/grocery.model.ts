
export interface Grocery {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  logo?: string;
  isPromoted: boolean;
  isVerified?: boolean;
  description: string;
  phone: string;
  phones?: string[];
  email: string;
  emails?: string[];
  website: string;
  openingHours?: { days: string; time: string; }[];
  gallery?: string[];
  actionType?: string;
  actionTarget?: string;
  actionLabel?: string;
}
