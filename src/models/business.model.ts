
export interface BusinessOpeningHour {
  days?: string;
  time?: string;
  // Backward/alternate shapes seen in some docs/UI.
  day?: string;
  hours?: string;
}

export interface BusinessLocation {
  isPrimary?: boolean;
  label?: string;
  address?: string;
  city?: string;
  country?: string;
  cityCode?: string;
  countryCode?: string;
  googlePlaceId?: string;
  rating?: number;
  reviews?: number;
  latitude?: number;
  longitude?: number;
  mapIframe?: string;
  mapQuery?: string;
  phones?: string[];
  emails?: string[];
  website?: string;
  openingHours?: BusinessOpeningHour[];
}

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
  openingHours?: BusinessOpeningHour[];
  locations?: BusinessLocation[];
  gallery?: string[];
  menuUrl?: string;
  actionType?: string;
  actionTarget?: string;
  actionLabel?: string;
}
