
export interface Business {
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
  cityCode?: string;
  countryCode?: string;
  description: string;
  phone: string;       // Primary phone for backward compatibility
  phones?: string[];   // Multiple phones
  email: string;       // Primary email for backward compatibility
  emails?: string[];   // Multiple emails
  website: string;
  priceRange?: string;
  openingHours?: { days: string; time: string; }[];
  gallery?: string[];
  menuUrl?: string;
  actionType?: string;
  actionTarget?: string;
  actionLabel?: string;
}
