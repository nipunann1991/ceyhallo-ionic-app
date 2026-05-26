
export interface Offer {
  id: string;
  title: string;
  targetName: string;
  offerBy?: string;
  discount: string;
  description?: string;
  content?: string;
  image: string;
  expiryDate: Date;
  endDate?: Date;
  businessId?: string;
  targetId?: string;
  color?: string;
  order?: number;
  isSectionBanner?: boolean;
  linkType?: string;
  isHomeBanner?: boolean;
  cityCode?: string;
  countryCode?: string;
  generalCategory?: string;
  categories?: string[];
}
