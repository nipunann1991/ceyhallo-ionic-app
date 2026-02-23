
import { Component, ChangeDetectionStrategy, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  template: `
<ion-content [fullscreen]="true">
  <div 
    class="flex flex-col items-center justify-center min-h-full w-full bg-[#F2F4F7] px-6 font-sans text-[#1A1C1E]"
    style="padding-top: calc(4rem + var(--ion-safe-area-top, 0px)); padding-bottom: 2rem;">

    <!-- Logo -->
    <div class="flex flex-col items-center mb-8">
       <ion-img src="https://i.ibb.co/B5TnYXWN/logo.png" alt="CeyHallo Logo" class="h-[8rem] object-contain"></ion-img>
       <p class="text-sm font-semibold text-gray-500 mt-1.5 animate-slide-in">Create new password</p>
    </div>

    <!-- Main Card -->
    <div class="w-full max-w-[21.25rem] animate-slide-in">
        
        <!-- Loading Verification -->
        @if (isVerifyingCode()) {
           <div class="flex flex-col items-center justify-center py-10">
              <ion-spinner name="crescent" color="primary"></ion-spinner>
              <p class="text-sm text-gray-500 mt-4 font-medium">Verifying secure link...</p>
           </div>
        }

        <!-- Invalid Code Error -->
        @if (!isVerifyingCode() && !isCodeValid()) {
           <div class="text-center bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ion-icon name="alert-circle-outline" class="text-2xl"></ion-icon>
                </div>
                <h3 class="text-lg font-bold text-[#1A1C1E] mb-2">Invalid Link</h3>
                <p class="text-sm text-gray-500 mb-6">{{ errorMessage() }}</p>
                <button 
                    (click)="goToLogin()"
                    class="w-full h-[2.625rem] bg-gray-100 text-gray-700 font-bold text-[0.9rem] rounded-full shadow-sm hover:bg-gray-200">
                    Back to Login
                </button>
           </div>
        }

        <!-- Reset Form -->
        @if (!isVerifyingCode() && isCodeValid()) {
            
            @if (errorMessage()) {
                <div class="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                    {{ errorMessage() }}
                </div>
            }

            @if (email()) {
                <p class="text-center text-xs font-bold text-gray-400 mb-4 uppercase tracking-wide">Account: {{ email() }}</p>
            }

            <div class="space-y-3 mb-6">
                <!-- New Password -->
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ion-icon name="lock-closed-outline" class="text-[#9CA3AF] text-[1.125rem] group-focus-within:text-[#083594] transition-colors duration-200"></ion-icon>
                    </div>
                    <input 
                      [type]="passwordFieldType()" 
                      [ngModel]="newPassword()" 
                      (ngModelChange)="newPassword.set($event)"
                      class="w-full h-[3rem] pl-[2.75rem] pr-[2.75rem] bg-white border border-gray-200 rounded-xl text-base font-medium text-[#1A1C1E] placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all duration-200 shadow-sm"
                      placeholder="New Password">
                    <button 
                      type="button" 
                      (click)="togglePasswordVisibility()" 
                      class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none">
                         <ion-icon [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'" class="text-[1.25rem]"></ion-icon>
                    </button>
                </div>

                <!-- Confirm Password -->
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ion-icon name="shield-checkmark-outline" class="text-[#9CA3AF] text-[1.125rem] group-focus-within:text-[#083594] transition-colors duration-200"></ion-icon>
                    </div>
                    <input 
                      [type]="passwordFieldType()" 
                      [ngModel]="confirmPassword()" 
                      (ngModelChange)="confirmPassword.set($event)"
                      class="w-full h-[3rem] pl-[2.75rem] pr-4 bg-white border border-gray-200 rounded-xl text-base font-medium text-[#1A1C1E] placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all duration-200 shadow-sm"
                      placeholder="Confirm Password">
                </div>
            </div>

            <div class="mb-6">
                <button 
                    (click)="confirmReset()" 
                    [disabled]="isLoading()"
                    class="w-full h-[2.625rem] bg-[#083594] hover:bg-[#07308a] active:scale-[0.98] text-white font-bold text-[0.9rem] tracking-normal rounded-full shadow-[0_4px_12px_rgba(8,53,148,0.15)] flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                    @if(isLoading()) { 
                      <ion-spinner name="crescent" color="light" class="w-5 h-5" style="--stroke-width: 8px;"></ion-spinner> 
                    } @else { 
                      Reset Password 
                    }
                </button>
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
      animation: slideInUp 0.7s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ResetPasswordComponent implements OnInit {
  oobCode = signal<string | null>(null);
  email = signal<string | null>(null); // For display
  
  // UI State
  isVerifyingCode = signal(true);
  isCodeValid = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  
  // Form Inputs
  newPassword = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  passwordFieldType = computed(() => this.showPassword() ? 'text' : 'password');

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Get the OOB code from query params
    this.route.queryParams.subscribe(async params => {
      const code = params['oobCode'];
      if (code) {
        this.oobCode.set(code);
        await this.verifyCode(code);
      } else {
        this.isVerifyingCode.set(false);
        this.errorMessage.set('Invalid link. No reset code found.');
      }
    });
  }

  async verifyCode(code: string) {
    const result = await this.authService.verifyPasswordResetCode(code);
    this.isVerifyingCode.set(false);
    
    if (result.success && result.email) {
      this.isCodeValid.set(true);
      this.email.set(result.email);
    } else {
      this.isCodeValid.set(false);
      this.errorMessage.set(result.error || 'This link is invalid or has expired.');
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  async confirmReset() {
    if (!this.newPassword() || !this.confirmPassword()) {
      this.showToast('Please fill in all fields', 'danger');
      return;
    }

    if (this.newPassword().length < 6) {
      this.showToast('Password must be at least 6 characters', 'danger');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.showToast('Passwords do not match', 'danger');
      return;
    }

    const code = this.oobCode();
    if (!code) return;

    this.isLoading.set(true);
    const result = await this.authService.confirmPasswordReset(code, this.newPassword());
    this.isLoading.set(false);

    if (result.success) {
      await this.showToast('Password reset successfully!', 'success');
      this.navCtrl.navigateRoot('/login');
    } else {
      this.errorMessage.set(result.error || 'Failed to reset password.');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }

  goToLogin() {
    this.navCtrl.navigateRoot('/login');
  }
}
