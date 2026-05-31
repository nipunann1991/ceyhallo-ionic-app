import { NotificationSource, NotificationType } from '../enums/notification.enum';

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
