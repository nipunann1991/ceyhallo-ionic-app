export interface Category {
  id: string;
  label: string;
  icon: string;
  hasNotification: boolean;
  order: number;
  path?: string;
}