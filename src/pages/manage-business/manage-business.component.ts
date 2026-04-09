import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { auth } from '../../services/firebase.service';
import { FacebookAuthProvider, signInWithPopup, linkWithPopup } from 'firebase/auth';

@Component({
  selector: 'app-manage-business',
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]">
  <!-- Custom Header -->
  <div class="relative bg-[#083594] pb-16 rounded-b-[2.5rem] px-5 text-white shadow-sm z-0 pt-16">
    <div class="flex items-center justify-between relative z-10">
      <button routerLink="/tabs/profile" class="p-2 -ml-2 active:opacity-70 transition-opacity">
         <ion-icon name="arrow-back" class="text-2xl"></ion-icon>
      </button>
      <h1 class="text-xl font-bold absolute left-1/2 -translate-x-1/2 tracking-tight">Manage Business</h1>
      <div class="w-8"></div>
    </div>
  </div>

  <div class="relative z-10 -mt-8 px-5 space-y-4">
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#E8EEF7]">
      <div class="flex flex-col items-center text-center space-y-3">
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
          <ion-icon name="logo-facebook" class="text-4xl"></ion-icon>
        </div>
        <h2 class="text-lg font-bold text-gray-900">Connect Facebook Business</h2>
        <p class="text-sm text-gray-500">
          Link your Facebook account to manage your business page, sync posts, and view insights directly from the app.
        </p>
        
        @if (isConnected()) {
          <div class="w-full mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
            <ion-icon name="checkmark-circle" class="text-xl"></ion-icon>
            <span class="font-medium text-sm">Facebook Business Connected</span>
          </div>
          <button (click)="disconnectFacebook()" class="w-full mt-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl active:opacity-70 transition-opacity">
            Disconnect
          </button>
        } @else {
          <button (click)="connectFacebook()" [disabled]="isLoading()" class="w-full mt-4 py-3 bg-[#1877F2] text-white font-bold rounded-xl shadow-md active:opacity-70 transition-opacity flex items-center justify-center gap-2">
            @if (isLoading()) {
              <ion-spinner name="crescent" class="w-5 h-5"></ion-spinner>
              <span>Connecting...</span>
            } @else {
              <ion-icon name="logo-facebook" class="text-xl"></ion-icon>
              <span>Connect with Facebook</span>
            }
          </button>
        }
      </div>
    </div>

    @if (isConnected()) {
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#E8EEF7]">
        <h3 class="font-bold text-gray-900 mb-4">Business Insights</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">Page Likes</div>
            <div class="text-xl font-bold text-gray-900">--</div>
          </div>
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">Post Reach</div>
            <div class="text-xl font-bold text-gray-900">--</div>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-4 text-center">Insights will appear here once your page is fully synced.</p>
      </div>
    }
  </div>
</ion-content>
  `,
  imports: [CommonModule, IonicModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageBusinessComponent {
  isLoading = signal(false);
  isConnected = signal(false);

  constructor(private toastCtrl: ToastController) {
    this.checkConnection();
  }

  checkConnection() {
    const user = auth.currentUser;
    if (user) {
      const isLinked = user.providerData.some(provider => provider.providerId === 'facebook.com');
      this.isConnected.set(isLinked);
    }
  }

  async connectFacebook() {
    this.isLoading.set(true);
    try {
      const provider = new FacebookAuthProvider();
      // Add scopes for business management
      provider.addScope('pages_show_list');
      provider.addScope('pages_read_engagement');
      provider.addScope('pages_manage_posts');
      
      const user = auth.currentUser;
      if (user) {
        await linkWithPopup(user, provider);
        this.isConnected.set(true);
        this.showToast('Successfully connected with Facebook Business!', 'success');
      } else {
        this.showToast('You must be logged in to connect a business.', 'danger');
      }
    } catch (error: any) {
      console.error('Facebook connection error:', error);
      this.showToast(error.message || 'Failed to connect with Facebook.', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  async disconnectFacebook() {
    // In a real app, you would unlink the provider using unlink(user, 'facebook.com')
    // For now, we'll just show a toast as unlinking might require re-authentication
    this.showToast('Disconnect functionality would be implemented here.', 'warning');
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
