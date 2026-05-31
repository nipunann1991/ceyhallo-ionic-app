import { BannerNavigationType, BannerTargetType } from '../enums/banner.enum';

export interface Banner {
  id: string;
  category: string;
  title: string;
  description?: string;
  image: string;
  active?: boolean;
  targetId?: string;
  targetType?: BannerTargetType;
  navigationType?: BannerNavigationType;
  order?: number;
}
