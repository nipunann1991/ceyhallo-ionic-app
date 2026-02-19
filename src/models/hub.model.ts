
export interface HubItem {
  id?: string;
  label: string;
  subLabel?: string;
  icon: string;
  iconUrl?: string; // For image logos
  actionType: 'url' | 'call' | 'route' | 'email';
  actionValue: string;
  colorClass?: string;
  order?: number;
}

export interface HubSection {
  id: string;
  title: string;
  subTitle?: string;
  order: number;
  layout: 'list' | 'grid' | 'row';
  items: HubItem[];
  enabled: boolean;
  isTitleVisible: boolean;
}
