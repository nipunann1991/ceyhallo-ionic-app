import { Component, ChangeDetectionStrategy, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, InfiniteScrollCustomEvent, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { Notification } from '../../models/notification.model';
import { LocalNotificationStateService } from '../../services/local-notification-state.service';
import { normalizeNotificationLink } from '../../utils/notification.utils';

@Component({
  selector: 'app-notifications',
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]" [forceOverscroll]="false">
  
  <!-- Custom Header -->
  <div class="relative bg-[#083594] pb-16 rounded-b-[2.5rem] px-5 text-white shadow-sm pt-[calc(4rem+env(safe-area-inset-top))]">
    <div class="flex items-center justify-between relative z-10 mb-2">
      <!-- Back Button -->
      <button (click)="goBack()" class="p-2 -ml-2 active:opacity-70 transition-opacity text-white">
         <ion-icon name="arrow-back" class="text-2xl"></ion-icon>
      </button>
      
      <!-- Title -->
      <h1 class="text-lg font-bold absolute left-1/2 -translate-x-1/2 tracking-tight">Notifications</h1>
      
      <div class="w-8"></div>
    </div>
  </div>

  <!-- Notification List -->
  <div class="px-5 -mt-8 relative z-10 pb-[calc(2rem+env(safe-area-inset-bottom))]">
    
    @if (displayedNotifications().length > 0) {
      <div class="flex flex-col gap-3">
        @for (item of displayedNotifications(); track item.id) {
          <div 
            (click)="handleNotificationClick(item)"
            class="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E8EEF7] active:scale-[0.98] transition-all relative overflow-hidden group">

             <div class="flex gap-4">
                <!-- Icon -->
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#EAF2FF] text-[#083594]">
                   <ion-icon name="notifications-outline" class="text-xl"></ion-icon>
                </div>
                
                <!-- Content -->
                <div class="flex-1 pr-4">
                   <h3 class="text-sm font-bold text-[#1A1C1E] mb-1" [class.font-extrabold]="!isRead(item)">{{ item.title }}</h3>
                   <p class="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{{ item.message }}</p>
                   <p class="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide">{{ item.date | date:'mediumDate' }} • {{ item.date | date:'shortTime' }}</p>
                </div>
             </div>
          </div>
        }
      </div>
    } @else {
      <!-- Empty State -->
      <div class="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[50vh]">
         <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <ion-icon name="notifications-off" class="text-4xl"></ion-icon>
         </div>
         <h2 class="text-lg font-bold text-[#1A1C1E] mb-2">No Notifications</h2>
         <p class="text-sm text-gray-500">You're all caught up! Check back later for updates.</p>
      </div>
    }

    <ion-infinite-scroll (ionInfinite)="onIonInfinite($event)" [disabled]="displayedNotifications().length >= notifications().length">
      <ion-infinite-scroll-content loadingSpinner="bubbles" loadingText="Loading more notifications..."></ion-infinite-scroll-content>
    </ion-infinite-scroll>

  </div>

</ion-content>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class NotificationsComponent {
  notifications: Signal<Notification[]>;
  displayedNotifications: Signal<Notification[]>;
  limit = signal(10);

  constructor(
    private dataService: DataService,
    private navCtrl: NavController,
    private router: Router,
    private localNotificationState: LocalNotificationStateService
  ) {
    this.notifications = this.dataService.getNotifications();
    this.displayedNotifications = computed(() => this.notifications().slice(0, this.limit()));
  }

  ionViewWillEnter() {
    this.limit.set(10);
    const notificationIds = this.notifications().map((notification) => notification.id);
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
}
