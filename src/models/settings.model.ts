
export interface HomeSection {
  id: string;
  template: string; // 'banners' | 'categories' | 'latest_offers' | 'featured_businesses' | 'news_feed'
  dataSource: string; // 'banners' | 'categories' | 'offers' | 'restaurants' | 'businesses' | 'news'
  label?: string;
  title: string;
  subTitle?: string;
  enabled: boolean;
  order?: number;
  filterType?: string;
  filterValue?: string;
  limit?: number;
  type?: string;
}

export interface AppConfig {
  showSocialLogin: boolean;
  maintenanceMode?: boolean;
  showAiBot?: boolean;
  homeSections: HomeSection[];
}

export interface Settings {
  app_config: AppConfig;
}
