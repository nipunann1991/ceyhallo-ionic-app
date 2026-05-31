import { Component, ChangeDetectionStrategy, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, InfiniteScrollCustomEvent, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { Notification } from '../../models/notification.model';
import { LocalNotificationStateService } from '../../services/local-notification-state.service';
import { normalizeNotificationLink } from '../../utils/notification.utils';
import { AuthService } from '../../services/auth.service';

type FirestoreLikeTimestamp = {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
};

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class NotificationsComponent {
  notifications: Signal<Notification[]>;
  visibleNotifications: Signal<Notification[]>;
  displayedNotifications: Signal<Notification[]>;
  limit = signal(10);

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private localNotificationState: LocalNotificationStateService
    ) {
    this.notifications = this.dataService.getNotifications();
    this.visibleNotifications = computed(() => {
      const profileCreatedAt = this.resolveProfileCreatedAt();

      if (!profileCreatedAt) {
        return [];
      }

      return this.notifications().filter((notification) => notification.date.getTime() >= profileCreatedAt.getTime());
    });
    this.displayedNotifications = computed(() => this.visibleNotifications().slice(0, this.limit()));
  }

  ionViewWillEnter() {
    this.limit.set(10);
    const notificationIds = this.visibleNotifications().map((notification) => notification.id);
    this.localNotificationState.markAllAsRead(notificationIds);
  }

  goBack() {
    this.navCtrl.back();
  }

  markAsRead(id: string) {
    this.localNotificationState.markAsRead(id);
  }

  isRead(notification: Notification) {
    return this.localNotificationState.isRead(notification);
  }

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification.id);

    const link = normalizeNotificationLink(notification.link);
    if (link) {
      if (/^(https?:|mailto:|tel:)/i.test(link)) {
        window.open(link, '_system');
        return;
      }

      void this.router.navigateByUrl(link);
    }
  }

  onIonInfinite(ev: Event) {
    const infiniteScroll = ev as InfiniteScrollCustomEvent;
    setTimeout(() => {
      this.limit.update((currentLimit) => currentLimit + 10);
      infiniteScroll.target.complete();
    }, 500);
  }

  private resolveProfileCreatedAt(): Date | null {
    const profileCreatedAt = this.authService.userProfile()?.createdAt;
    const authCreatedAt = this.authService.currentUser()?.metadata?.creationTime;

    return this.toValidDate(profileCreatedAt) || this.toValidDate(authCreatedAt);
  }

  private toValidDate(value: unknown): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof (value as FirestoreLikeTimestamp).toDate === 'function') {
      const date = (value as FirestoreLikeTimestamp).toDate?.();
      return date && !Number.isNaN(date.getTime()) ? date : null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const ms = value > 1_000_000_000_000 ? value : value * 1000;
      const date = new Date(ms);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof value === 'string') {
      const numericValue = Number(value);
      if (!Number.isNaN(numericValue) && value.trim() !== '') {
        return this.toValidDate(numericValue);
      }

      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof (value as FirestoreLikeTimestamp).seconds === 'number') {
      return this.toValidDate((value as FirestoreLikeTimestamp).seconds);
    }

    return null;
  }
}
