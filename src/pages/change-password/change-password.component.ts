
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]" [forceOverscroll]="false">
  
  <!-- Custom Header (Support Style) -->
  <div class="relative bg-[#083594] pb-20 rounded-b-[2.5rem] px-5 text-white shadow-sm pt-[calc(4rem+env(safe-area-inset-top))]">
    <div class="flex items-center justify-between relative z-10">
      <!-- Back Button -->
      <button (click)="goBack()" class="p-2 -ml-2 active:opacity-70 transition-opacity text-white">
         <ion-icon name="arrow-back" class="text-2xl"></ion-icon>
      </button>
      
      <!-- Title -->
      <h1 class="text-lg font-bold absolute left-1/2 -translate-x-1/2 tracking-tight">Change Password</h1>
      
      <div class="w-8"></div>
    </div>
    
    <!-- Hero Text -->
    <div class="text-center px-4"> 
        <p class="text-blue-100 text-sm font-medium">Update your credentials to keep your<br/> account safe.</p>
    </div>
  </div>

  <div class="px-6 -mt-12 relative z-10 pb-[calc(2rem+env(safe-area-inset-bottom))]">
    
    <!-- Form Container (White Card) -->
    <div class="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8EEF7] space-y-5">

       <!-- Security Notice (Styled like attachment) -->
       <div class="bg-[#FFFBEB] border border-[#FCD34D] rounded-xl p-4 flex gap-3">
            <ion-icon name="shield-checkmark" class="text-[#D97706] text-xl mt-0.5 shrink-0"></ion-icon>
            <div>
                <h3 class="font-bold text-[#92400E] text-sm mb-1">Secure your account</h3>
                <p class="text-xs text-[#92400E]/80 leading-relaxed font-medium">Choose a strong password that you don't use for other services.</p>
            </div>
       </div>
       
       <!-- Current Password -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">Current Password</label>
          <div class="relative">
             <input 
               type="password" 
               [ngModel]="oldPassword()" 
               (ngModelChange)="oldPassword.set($event)"
               class="w-full h-12 bg-[#F8F9FA] rounded-xl px-4 pr-10 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none placeholder-gray-400"
               placeholder="••••••••">
             <ion-icon name="lock-open-outline" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></ion-icon>
          </div>
       </div>

       <!-- New Password -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">New Password</label>
          <div class="relative">
             <input 
               type="password" 
               [ngModel]="newPassword()" 
               (ngModelChange)="newPassword.set($event)"
               class="w-full h-12 bg-[#F8F9FA] rounded-xl px-4 pr-10 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none placeholder-gray-400"
               placeholder="••••••••">
             <ion-icon name="key-outline" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></ion-icon>
          </div>
       </div>

       <!-- Confirm Password -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">Confirm Password</label>
          <div class="relative">
             <input 
               type="password" 
               [ngModel]="confirmPassword()" 
               (ngModelChange)="confirmPassword.set($event)"
               class="w-full h-12 bg-[#F8F9FA] rounded-xl px-4 pr-10 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none placeholder-gray-400"
               placeholder="••••••••">
             <ion-icon name="checkmark-done-outline" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></ion-icon>
          </div>
       </div>

    </div>

    <!-- Update Button (Flows with content) -->
    <div class="mt-8">
       <button 
         (click)="save()" 
         [disabled]="isLoading()"
         class="w-full h-[3.25rem] bg-[#083594] hover:bg-[#07308a] active:scale-[0.98] text-white font-bold text-[0.95rem] rounded-full shadow-[0_8px_20px_rgba(8,53,148,0.25)] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
         @if (isLoading()) {
            <ion-spinner name="crescent" color="light" class="w-6 h-6"></ion-spinner>
         } @else {
            <ion-icon name="lock-closed" class="text-xl"></ion-icon>
            Update Password
         }
       </button>
    </div>

  </div>
</ion-content>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ChangePasswordComponent {
  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  goBack() {
    this.navCtrl.navigateBack('/tabs/profile');
  }

  async save() {
    if (!this.oldPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.showToast('Please fill in all fields', 'danger');
      return;
    }

    if (this.newPassword().length < 6) {
      this.showToast('Password must be at least 6 characters long', 'danger');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.showToast('New passwords do not match', 'danger');
      return;
    }

    this.isLoading.set(true);
    // Pass old password for re-authentication
    const result = await this.authService.changePassword(this.oldPassword(), this.newPassword());
    this.isLoading.set(false);

    if (result.success) {
      await this.showToast('Password changed successfully', 'success');
      this.navCtrl.navigateBack('/tabs/profile');
    } else {
      await this.showToast(result.error || 'Failed to change password', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    let icon = 'checkmark-circle';
    if (color === 'danger') icon = 'alert-circle';
    if (color === 'warning') icon = 'warning';

    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
      icon,
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }
}
