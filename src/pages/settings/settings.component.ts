import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { PushNotificationService } from '../../services/push-notifications.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class SettingsComponent {
  pushService = inject(PushNotificationService);
  private toastCtrl: ToastController = inject(ToastController);

  async copyToken() {
    const token = this.pushService.fcmToken();
    if (token) {
      try {
         await navigator.clipboard.writeText(token);
         const toast = await this.toastCtrl.create({
            message: 'Token copied to clipboard!',
            duration: 1500,
            color: 'success',
            position: 'top',
            icon: 'checkmark-circle'
         });
         await toast.present();
      } catch (err) {
         console.error('Could not copy text: ', err);
         const toast = await this.toastCtrl.create({
            message: 'Failed to copy token.',
            duration: 1500,
            color: 'danger',
            position: 'top'
         });
         await toast.present();
      }
    }
  }
}