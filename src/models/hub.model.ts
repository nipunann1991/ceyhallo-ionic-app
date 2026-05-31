
import { HubActionType, HubLayout } from '../enums/hub.enum';

export interface HubItem {
  id?: string;
  label: string;
  subLabel?: string;
  icon: string;
  iconUrl?: string; // For image logos
  actionType: HubActionType;
  actionValue: string;
  colorClass?: string;
  order?: number;
}

export interface HubSection {
  id: string;
  title: string;
  subTitle?: string;
  order: number;
  layout: HubLayout;
  items: HubItem[];
  enabled: boolean;
  isTitleVisible: boolean;
}
