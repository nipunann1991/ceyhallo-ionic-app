import { Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification.model';

const READ_NOTIFICATION_IDS_KEY = 'ceyhallo_read_notification_ids';

@Injectable({
  providedIn: 'root',
})
export class LocalNotificationStateService {
  readonly readNotificationIds = signal<Set<string>>(this.loadReadIds());

  isRead(notification: Notification): boolean {
    return notification.read || this.readNotificationIds().has(notification.id);
  }

  markAsRead(id: string): void {
    this.readNotificationIds.update((currentIds) => {
      if (currentIds.has(id)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.add(id);
      this.persistReadIds(nextIds);
      return nextIds;
    });
  }

  hasUnread(notifications: Notification[]): boolean {
    return notifications.some((notification) => !this.isRead(notification));
  }

  private loadReadIds(): Set<string> {
    try {
      const rawValue = localStorage.getItem(READ_NOTIFICATION_IDS_KEY);
      if (!rawValue) {
        return new Set<string>();
      }

      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        return new Set<string>();
      }

      return new Set<string>(parsed.filter((value): value is string => typeof value === 'string'));
    } catch {
      return new Set<string>();
    }
  }

  private persistReadIds(ids: Set<string>): void {
    try {
      localStorage.setItem(READ_NOTIFICATION_IDS_KEY, JSON.stringify([...ids]));
    } catch {
      // Ignore storage failures and keep in-memory state.
    }
  }
}
