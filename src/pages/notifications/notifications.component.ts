
import { Component, ChangeDetectionStrategy, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
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
