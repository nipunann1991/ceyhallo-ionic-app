
export interface City {
  code: string;
  name: string;
}

export interface Country {
  id: string; // The document ID, e.g., 'AE'
  name: string;
  flagUrl: string;
  cities: City[];
  isActive?: boolean;
}
