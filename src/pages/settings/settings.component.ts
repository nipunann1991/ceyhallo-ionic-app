
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { PushNotificationService } from '../../services/push-notifications.service';

@Component({
  selector: 'app-settings',
  template: `
<ion-header class="ion-no-border">
  <ion-toolbar class="bg-white text-black border-b border-gray-200">
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/tabs/profile"></ion-back-button>
    </ion-buttons>
    <ion-title class="font-bold">
      Settings
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="[--background:#F2F4F7]">
  <div class="px-5 py-6 space-y-6">
    
    <!-- Push Notification Debug Section -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 class="font-bold text-[#1A1C1E] mb-3">Push Notifications</h3>
        
        @if (pushService.fcmToken()) {
            <div class="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-200">
                <p class="text-xs text-gray-500 font-mono break-all line-clamp-3">
                    {{ pushService.fcmToken() }}
                </p>
            </div>
            <button (click)="copyToken()" class="text-sm font-bold text-[#083594] hover:underline flex items-center gap-1.5 p-1">
                <ion-icon name="copy-outline"></ion-icon>
                Copy FCM Token
            </button>
        } @else {
            <div class="flex items-center gap-3 text-gray-500 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                 <ion-icon name="information-circle-outline" class="text-xl"></ion-icon>
                 <div class="text-xs">
                    <p class="font-semibold">Token not available</p>
                    <p>This usually means you are running on Web or permissions are denied.</p>
                 </div>
            </div>
        }
    </div>

    <!-- General Preferences -->
    <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <ion-item lines="full" detail="true" button class="[--background:white]">
            <ion-icon name="notifications-outline" slot="start" class="text-[#083594]"></ion-icon>
            <ion-label>
                <h3 class="font-bold text-gray-800 text-sm">Notification Preferences</h3>
                <p class="text-xs text-gray-500">Manage what alerts you receive</p>
            </ion-label>
        </ion-item>
        <ion-item lines="full" detail="true" button class="[--background:white]">
            <ion-icon name="lock-closed-outline" slot="start" class="text-[#083594]"></ion-icon>
            <ion-label>
                <h3 class="font-bold text-gray-800 text-sm">Privacy & Data</h3>
                <p class="text-xs text-gray-500">Control your data usage</p>
            </ion-label>
        </ion-item>
        <ion-item lines="none" detail="true" button class="[--background:white]">
            <ion-icon name="color-palette-outline" slot="start" class="text-[#083594]"></ion-icon>
            <ion-label>
                <h3 class="font-bold text-gray-800 text-sm">App Appearance</h3>
                <p class="text-xs text-gray-500">Light / Dark mode</p>
            </ion-label>
        </ion-item>
    </div>
    
    <!-- App Info -->
    <div class="text-center text-xs text-gray-400 font-medium">
        <p>Version 1.0.0 (Build 102)</p>
        <p class="mt-1">© 2024 CeyHallo. All rights reserved.</p>
    </div>

  </div>
</ion-content>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class SettingsComponent {
  constructor() {
    this.pushService = inject(PushNotificationService);
    this.toastCtrl = inject(ToastController);
  }

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
