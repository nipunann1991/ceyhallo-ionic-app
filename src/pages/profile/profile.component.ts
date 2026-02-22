
import { Component, ChangeDetectionStrategy, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { handleImageError } from '../../utils/image.utils';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-profile',
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]" [forceOverscroll]="false">
  
  <!-- Custom Header -->
  <div class="relative bg-[#083594] profile-header pb-16 rounded-b-[2.5rem] px-5 text-white shadow-sm z-0">
    <div class="flex items-center justify-between relative z-10">
      <!-- Back Button -->
      <button routerLink="/tabs/home" class="p-2 -ml-2 active:opacity-70 transition-opacity">
         <ion-icon name="arrow-back" class="text-2xl"></ion-icon>
      </button>
      
      <!-- Title -->
      <h1 class="text-xl font-bold absolute left-1/2 -translate-x-1/2 tracking-tight">Profile</h1>
      
      <div class="w-8"></div> <!-- Spacer -->
    </div>
  </div>

  <!-- Profile Info -->
  <div class="relative z-10 flex flex-col items-center -mt-10 mb-8 px-6">
     <!-- Avatar (SVG Style matching Home) -->
     <div class="relative mb-3">
        <div class="w-[6.5rem] h-[6.5rem] rounded-full border-[5px] border-white shadow-sm overflow-hidden bg-[#E0E7FF] flex items-center justify-center text-[#083594]">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-12 h-12">
               <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
               <path d="M5 21C5.61754 18.2372 7.9899 16 10.8 16H13.2C16.0101 16 18.3825 18.2372 19 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>
        </div>
        <!-- Online/Status Dot -->
        <div class="absolute bottom-1.5 right-1.5 w-5 h-5 bg-[#22C55E] border-[3px] border-white rounded-full"></div>
     </div>
     
     <!-- Text & Location -->
     <div class="flex items-center gap-2 mb-1">
        <h2 class="text-[1.35rem] font-extrabold text-[#1A1C1E] tracking-tight">{{ user().name }}</h2>
        @if (user().flagUrl) {
            <img [src]="user().flagUrl" (error)="handleImgError($event)" class="w-7 h-4 rounded-sm object-cover border border-gray-200" [alt]="user().name">
        }
     </div>
     @if (user().city) {
        <div class="flex items-center gap-1.5 text-gray-500">
            <ion-icon name="location-sharp" class="text-sm"></ion-icon>
            <span class="text-[0.9rem] font-medium">{{ user().city }}</span>
        </div>
     }
  </div>

  <!-- Warning Card -->
  @if (!user().isVerified) {
      <div class="px-5 mb-8">
         <div class="bg-[#FFFBEB] border border-[#FCD34D] rounded-xl p-4 flex gap-3 shadow-[0_2px_10px_rgba(252,211,77,0.1)]">
            <ion-icon name="warning" class="text-[#D97706] text-xl mt-0.5 shrink-0"></ion-icon>
            <div>
               <h3 class="font-bold text-[#92400E] text-sm mb-1">Verify Your Email Address</h3>
               <p class="text-xs text-[#92400E]/80 font-medium mb-2">Your account is not verified. Please check your inbox for a verification link.</p>
               <button (click)="resendVerification()" class="text-xs font-bold text-[#78350F] hover:underline flex items-center gap-1 group">
                 Resend verification link
               </button>
            </div>
         </div>
      </div>
  }

  <!-- Content Sections -->
  <div class="px-5 space-y-6">
    
    <!-- My Account -->
    <div>
       <h3 class="text-md font-bold text-[#1A1C1E] mb-3 ml-1">My Account</h3>
       <div class="bg-white rounded-2xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E8EEF7] space-y-1">
          
          <button routerLink="/edit-profile" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <ion-icon name="create-outline" class="text-gray-400 text-[1.4rem] group-active:text-[#083594] transition-colors"></ion-icon>
                <span class="font-semibold text-sm text-gray-700">Edit Profile</span>
             </div>
             <ion-icon name="chevron-forward" class="text-gray-300 text-lg"></ion-icon>
          </button>

          <button routerLink="/change-password" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <ion-icon name="lock-closed-outline" class="text-gray-400 text-[1.4rem] group-active:text-[#083594] transition-colors"></ion-icon>
                <span class="font-semibold text-sm text-gray-700">Change Password</span>
             </div>
             <ion-icon name="chevron-forward" class="text-gray-300 text-lg"></ion-icon>
          </button>

          <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <ion-icon name="globe-outline" class="text-gray-400 text-[1.4rem] group-active:text-[#083594] transition-colors"></ion-icon>
                <span class="font-semibold text-sm text-gray-700">Language</span>
             </div>
             <div class="flex items-center gap-2">
                <span class="text-[0.8rem] font-medium text-gray-400">English</span>
                <ion-icon name="chevron-forward" class="text-gray-300 text-lg"></ion-icon>
             </div>
          </button>

       </div>
    </div>

    <!-- Business Section -->
    <div>
       <h3 class="text-md font-bold text-[#1A1C1E] mb-3 ml-1">Business</h3>
       <div class="bg-white rounded-2xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E8EEF7] space-y-1">
          <button routerLink="/list-business" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <ion-icon name="add-circle-outline" class="text-gray-400 text-[1.4rem] group-active:text-[#083594] transition-colors"></ion-icon>
                <span class="font-semibold text-sm text-gray-700">Business Listing (Free)</span>
             </div>
             <ion-icon name="chevron-forward" class="text-gray-300 text-lg"></ion-icon>
          </button>
       </div>
    </div>

    <!-- General -->
    <div>
       <h3 class="text-md font-bold text-[#1A1C1E] mb-3 ml-1">General</h3>
       <div class="bg-white rounded-2xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E8EEF7] space-y-1">
          
          <button routerLink="/legal/privacy" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <ion-icon name="shield-checkmark-outline" class="text-gray-400 text-[1.4rem] group-active:text-[#083594] transition-colors"></ion-icon>
                <span class="font-semibold text-sm text-gray-700">Privacy Policy</span>
             </div>
             <ion-icon name="chevron-forward" class="text-gray-300 text-lg"></ion-icon>
          </button>

          <button routerLink="/support" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <ion-icon name="headset-outline" class="text-gray-400 text-[1.4rem] group-active:text-[#083594] transition-colors"></ion-icon>
                <span class="font-semibold text-sm text-gray-700">Contact Support</span>
             </div>
             <ion-icon name="chevron-forward" class="text-gray-300 text-lg"></ion-icon>
          </button>

          <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <ion-icon name="star-outline" class="text-gray-400 text-[1.4rem] group-active:text-[#083594] transition-colors"></ion-icon>
                <span class="font-semibold text-sm text-gray-700">Rate in App Store</span>
             </div>
             <ion-icon name="chevron-forward" class="text-gray-300 text-lg"></ion-icon>
          </button>

          <button routerLink="/legal/terms" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <ion-icon name="document-text-outline" class="text-gray-400 text-[1.4rem] group-active:text-[#083594] transition-colors"></ion-icon>
                <span class="font-semibold text-sm text-gray-700">Terms & Conditions</span>
             </div>
             <ion-icon name="chevron-forward" class="text-gray-300 text-lg"></ion-icon>
          </button>

          <button (click)="logout()" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
             <div class="flex items-center gap-3.5">
                <div class="w-6 h-6 flex items-center justify-center">
                    <ion-icon name="log-out-outline" class="text-[#EF4444] text-[1.4rem] group-hover:scale-110 transition-transform"></ion-icon>
                </div>
                <span class="font-semibold text-sm text-[#EF4444]">Sign Out</span>
             </div>
             <ion-icon name="chevron-forward" class="text-[#EF4444]/40 text-lg"></ion-icon>
          </button>

       </div>
    </div>
  </div>

  <!-- Delete Account Button -->
  <div class="px-5 mt-8">
    <button (click)="deleteAccount()" class="w-full h-12 bg-transparent border border-red-500 text-red-500 font-bold rounded-full active:bg-red-50 transition-colors flex items-center justify-center gap-2">
        <ion-icon name="trash-outline" class="text-xl"></ion-icon>
        <span>Delete Account</span>
    </button>
  </div>
  
  <!-- Spacer to clear Tab Bar comfortably -->
  <div class="h-28 w-full"></div>

</ion-content>
`,
  styles: [`
    .profile-header {
      padding-top: calc(4rem + env(safe-area-inset-top));
    }
    :host-context(.plt-android) .profile-header {
      padding-top: calc(2rem + env(safe-area-inset-top));
    }
    .inner-scroll {
      padding-bottom: inherit;
    }
    ion-content::part(scroll) {
      padding-bottom: inherit;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterLink],
})
export class ProfileComponent {
  user: Signal<{ name: string; city: string; isVerified: boolean; avatar: string; flagUrl: string }>;

  constructor() {
    this.authService = inject(AuthService);
    this.dataService = inject(DataService);
    this.alertCtrl = inject(AlertController);
    this.toastCtrl = inject(ToastController);
  }
    this.user = computed(() => {
        // Prefer extended profile from Firestore, fallback to Auth
        const profile = this.authService.userProfile();
        const firebaseUser = this.authService.currentUser();
        const countries = this.dataService.getCountries()(); 
        const country = countries.find(c => c.id === profile?.region);
        
        return {
          name: profile?.name || firebaseUser?.displayName || 'User',
          city: profile?.city || '',
          isVerified: profile?.isVerified ?? firebaseUser?.emailVerified,
          avatar: profile?.photoURL || firebaseUser?.photoURL || `https://i.pravatar.cc/300?u=${profile?.email || 'user'}`,
          flagUrl: country?.flagUrl || ''
        };
    });
  }

  handleImgError = handleImageError;

  async logout() {
    await this.authService.logout();
  }

  async resendVerification() {
    const result = await this.authService.resendVerificationEmail();
    let toastMessage = 'Verification email sent. Please check your inbox.';
    let toastColor: 'success' | 'danger' = 'success';
    
    if (!result.success) {
      toastMessage = result.error || 'Failed to send verification email.';
      toastColor = 'danger';
    }
    
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 3000,
      color: toastColor,
      position: 'top',
      icon: toastColor === 'success' ? 'checkmark-circle' : 'alert-circle',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }

  async deleteAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      message: 'This action is permanent and cannot be undone. Please enter your password to confirm.',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Enter your password',
          attributes: {
            autocapitalize: 'off',
            autocomplete: 'current-password',
            spellcheck: 'false',
          },
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async (data) => {
            if (!data.password) {
              const toast = await this.toastCtrl.create({
                message: 'Password is required to delete your account.',
                duration: 3000,
                color: 'danger',
                position: 'top',
                icon: 'alert-circle',
                cssClass: 'toast-custom-text'
              });
              await toast.present();
              return;
            }

            const result = await this.authService.deleteAccount(data.password);
            if (result.success) {
              const toast = await this.toastCtrl.create({
                message: 'Your account has been successfully deleted.',
                duration: 3000,
                color: 'success',
                position: 'top',
                icon: 'checkmark-circle',
                cssClass: 'toast-custom-text'
              });
              await toast.present();
            } else {
              const errorToast = await this.toastCtrl.create({
                message: result.error || 'An error occurred. Please try again.',
                duration: 5000,
                color: 'danger',
                position: 'top',
                icon: 'alert-circle',
                cssClass: 'toast-custom-text'
              });
              await errorToast.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
