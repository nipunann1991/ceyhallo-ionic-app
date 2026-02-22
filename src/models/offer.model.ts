
export interface Offer {
  id: string;
  title: string;
  targetName: string;
  discount: string;
  description?: string;
  image: string;
  expiryDate: Date;
  businessId?: string;
  targetId?: string;
  color?: string;
  order?: number;
  isSectionBanner?: boolean;
  linkType?: string;
  isHomeBanner?: boolean;
  cityCode?: string;
  countryCode?: string;
}
