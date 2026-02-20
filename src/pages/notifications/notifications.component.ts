
import { Component, ChangeDetectionStrategy, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { Notification } from '../../models/notification.model';

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
    
    @if (notifications().length > 0) {
      <div class="flex flex-col gap-3">
        @for (item of notifications(); track item.id) {
          <div 
            (click)="handleNotificationClick(item)"
            class="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E8EEF7] active:scale-[0.98] transition-all relative overflow-hidden group">
             
             <!-- Unread Indicator -->
             @if (!isRead(item)) {
                <div class="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm animate-pulse"></div>
             }

             <div class="flex gap-4">
                <!-- Icon -->
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" [class]="getColorForType(item.type)">
                   <ion-icon [name]="getIconForType(item.type)" class="text-xl"></ion-icon>
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

  </div>

</ion-content>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class NotificationsComponent {
  notifications: Signal<Notification[]>;
  
  // Local state for read status for UI feedback
  readState = signal<Set<string>>(new Set());

  constructor(
    private dataService: DataService,
    private navCtrl: NavController,
    private router: Router
  ) {
    this.notifications = this.dataService.getNotifications();
  }

  goBack() {
    this.navCtrl.back();
  }

  markAsRead(id: string) {
    this.readState.update(state => {
        const newState = new Set(state);
        newState.add(id);
        return newState;
    });
  }

  isRead(notification: any) {
      return notification.read || this.readState().has(notification.id);
  }

  handleNotificationClick(notification: any) {
      this.markAsRead(notification.id);
      
      if (notification.link) {
          this.router.navigateByUrl(notification.link);
      }
  }

  getIconForType(type: string): string {
      switch (type) {
          case 'success': return 'checkmark-circle';
          case 'warning': return 'warning';
          case 'alert': return 'alert-circle';
          default: return 'information-circle';
      }
  }

  getColorForType(type: string): string {
      switch (type) {
          case 'success': return 'text-green-500 bg-green-50';
          case 'warning': return 'text-amber-500 bg-amber-50';
          case 'alert': return 'text-red-500 bg-red-50';
          default: return 'text-blue-500 bg-blue-50';
      }
  }
}
