
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-forgot-password',
    template: `
<ion-content [fullscreen]="true">
  <div 
    class="flex flex-col items-center justify-center min-h-full w-full bg-[#F2F4F7] px-6 font-sans text-[#1A1C1E]"
    style="padding-top: calc(6rem + var(--ion-safe-area-top, 0px)); padding-bottom: 2rem;">

    <!-- Logo Section -->
    <div class="flex flex-col items-center mb-8">
       <ion-img src="https://i.ibb.co/B5TnYXWN/logo.png" alt="CeyHallo Logo" class="h-[8rem] object-contain"></ion-img>
       <p class="text-sm font-semibold text-gray-500 mt-1.5 animate-slide-in">Recover your account</p>
    </div>

    <!-- Main Form Container -->
    <div class="w-full max-w-[21.25rem]">
        
        @if (emailSent()) {
            <!-- Success State -->
            <div class="animate-slide-in text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ion-icon name="mail-open-outline" class="text-2xl"></ion-icon>
                </div>
                <h3 class="text-lg font-bold text-[#1A1C1E] mb-2">Check your mail</h3>
                <p class="text-sm text-gray-500 leading-relaxed mb-6">
                    We have sent a password recover instructions to your email.
                </p>
                <button 
                    routerLink="/login"
                    class="w-full h-[2.625rem] bg-[#083594] text-white font-bold text-[0.9rem] rounded-full shadow-sm flex items-center justify-center">
                    Back to Login
                </button>
            </div>
        } @else {
            <!-- Input Form -->
            <div class="animate-slide-in">
                
                <div class="text-center mb-6 px-2">
                    <p class="text-sm text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                <div class="space-y-3 mb-6">
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <ion-icon name="mail-outline" class="text-[#9CA3AF] text-[1.125rem] group-focus-within:text-[#083594] transition-colors duration-200"></ion-icon>
                        </div>
                        <input 
                          type="email" 
                          [ngModel]="email()" 
                          (ngModelChange)="email.set($event)"
                          class="w-full h-[3rem] pl-[2.75rem] pr-4 bg-white border border-gray-200 rounded-xl text-base font-medium text-[#1A1C1E] placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all duration-200 shadow-sm"
                          placeholder="Email Address">
                    </div>
                </div>

                <div class="mb-6">
                    <button 
                        (click)="sendResetLink()" 
                        [disabled]="isLoading()"
                        class="w-full h-[2.625rem] bg-[#083594] hover:bg-[#07308a] active:scale-[0.98] text-white font-bold text-[0.9rem] tracking-normal rounded-full shadow-[0_4px_12px_rgba(8,53,148,0.15)] flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                        @if(isLoading()) { 
                          <ion-spinner name="crescent" color="light" class="w-5 h-5" style="--stroke-width: 8px;"></ion-spinner> 
                        } @else { 
                          Send Reset Link 
                        }
                    </button>
                </div>

                <div class="text-center">
                     <p class="text-sm text-gray-500 font-bold">
                        Remember your password? 
                        <a routerLink="/login" class="text-[#083594] font-bold hover:underline ml-1 cursor-pointer">Login</a>
                     </p>
                </div>
            </div>
        }

    </div>
  </div>
</ion-content>
`,
    styles: [`
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-in {
        animation: slideInUp 0.5s ease-out forwards;
      }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, IonicModule, RouterLink, FormsModule]
})
export class ForgotPasswordComponent {
    private authService = inject(AuthService);
    private navCtrl = inject(NavController);
    private toastCtrl = inject(ToastController);

    // State Management
    isLoading = signal(false);
    errorMessage = signal('');
    emailSent = signal(false);

    email = signal('');

    constructor() {}

    async sendResetLink() {
        const emailVal = this.email().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailVal) {
            this.showErrorToast('Please enter your email address.');
            return;
        }
        if (!emailRegex.test(emailVal)) {
            this.showErrorToast('Please enter a valid email address.');
            return;
        }
        
        this.isLoading.set(true);
        this.errorMessage.set('');
        
        const result = await this.authService.resetPassword(emailVal);
        this.isLoading.set(false);

        if (result.success) {
            this.emailSent.set(true);
            const toast = await this.toastCtrl.create({
                message: `Reset link sent to ${emailVal}`,
                color: 'success',
                duration: 3000,
                position: 'top',
                cssClass: 'toast-custom-text'
            });
            await toast.present();
        } else {
            const error = result.error || 'Failed to send reset link.';
            this.errorMessage.set(error);
            this.showErrorToast(error);
        }
    }

    private async showErrorToast(message: string) {
        const toast = await this.toastCtrl.create({
            message,
            duration: 3000,
            color: 'danger',
            position: 'top',
            cssClass: 'toast-custom-text'
        });
        await toast.present();
    }

    goBack() {
        this.navCtrl.back();
    }
}
