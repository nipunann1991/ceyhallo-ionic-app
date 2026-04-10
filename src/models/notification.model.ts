export type NotificationType = 'info' | 'success' | 'warning' | 'alert';
export type NotificationSource = 'feed' | 'queue';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: NotificationType;
  source: NotificationSource;
  sourceLabel: string;
  status?: string;
  statusLabel?: string;
  link?: string;
}
