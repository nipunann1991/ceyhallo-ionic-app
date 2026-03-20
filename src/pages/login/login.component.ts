
import { Component, ChangeDetectionStrategy, signal, computed, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { RouterLink, Router } from '@angular/router';
import { LegalPageComponent } from '../legal/legal.component';

@Component({
  selector: 'app-login',
  template: `
<ion-content [fullscreen]="true">
  <!-- Close Button for Modal Mode -->
  @if (isModal) {
    <div class="absolute top-4 right-4 z-50">
      <button (click)="closeModal()" class="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition-all">
        <ion-icon name="close" class="text-xl"></ion-icon>
      </button>
    </div>
  }

  <div 
    class="flex flex-col items-center justify-center min-h-full w-full bg-[#F2F4F7] px-6 font-sans text-[#1A1C1E]"
    style="padding-top: calc(6rem + var(--ion-safe-area-top, 0px)); padding-bottom: 2rem;">

    <!-- Logo Section -->
    <div class="flex flex-col items-center mb-8">
       <ion-img src="https://i.ibb.co/B5TnYXWN/logo.png" alt="CeyHallo Logo" class="h-[8rem] object-contain"></ion-img>
      <p class="text-sm font-semibold text-gray-500 mt-1.5">Discover. Connect. Belong — with CeyHallo</p>
    </div>

    <!-- Main Form Container -->
    <div class="w-full max-w-[21.25rem] animate-slide-in">
        
        <!-- Custom Message -->
        @if (message) {
          <div class="mb-6 p-4 bg-blue-50 text-[#083594] text-sm font-medium rounded-2xl border border-blue-100 text-center leading-relaxed">
            {{ message }}
          </div>
        }

        <!-- Inputs -->
        <div class="space-y-3 mb-3">
            <!-- Email Input -->
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ion-icon name="mail-outline" class="text-[#9CA3AF] text-[1.125rem] group-focus-within:text-[#083594] transition-colors duration-200"></ion-icon>
                </div>
                <input 
                  type="email" 
                  [value]="email()" 
                  (input)="onEmailInput($event)"
                  class="w-full h-[3rem] pl-[2.75rem] pr-4 bg-white border border-gray-200 rounded-xl text-base font-medium text-[#1A1C1E] placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all duration-200 shadow-sm"
                  placeholder="Email Address">
            </div>

            <!-- Password Input -->
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ion-icon name="lock-closed-outline" class="text-[#9CA3AF] text-[1.125rem] group-focus-within:text-[#083594] transition-colors duration-200"></ion-icon>
                </div>
                <input 
                  [type]="passwordFieldType()" 
                  [value]="password()" 
                  (input)="onPasswordInput($event)"
                  class="w-full h-[3rem] pl-[2.75rem] pr-[2.75rem] bg-white border border-gray-200 rounded-xl text-base font-medium text-[#1A1C1E] placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all duration-200 shadow-sm"
                  placeholder="••••••••">
                <button 
                  type="button" 
                  (click)="togglePasswordVisibility()" 
                  class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none">
                     <ion-icon [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'" class="text-[1.25rem]"></ion-icon>
                </button>
            </div>
        </div>

        <!-- Utility Links -->
        <div class="flex items-center justify-between mb-4">
             <button (click)="toggleRememberMe()" class="flex items-center gap-2 group cursor-pointer focus:outline-none">
                <div class="w-4 h-4 rounded border transition-colors flex items-center justify-center" 
                     [class.bg-[#083594]]="rememberMe()" 
                     [class.border-[#083594]]="rememberMe()" 
                     [class.border-gray-300]="!rememberMe()">
                    @if (rememberMe()) {
                      <ion-icon name="checkmark" class="text-white text-[0.75rem]"></ion-icon>
                    }
                </div>
                <span class="text-[0.85rem] font-semibold text-gray-500 group-hover:text-gray-700 select-none">Remember me</span>
             </button>

             <a routerLink="/forgot-password" class="text-[0.85rem] font-bold text-[#083594] hover:underline cursor-pointer">
                Forgot Password?
             </a>
        </div>

        <!-- Login Button -->
        <div class="mb-3">
            <button 
                (click)="login()" 
                [disabled]="isLoading()"
                class="w-full h-[2.625rem] bg-[#083594] hover:bg-[#07308a] active:scale-[0.98] text-white font-bold text-[0.9rem] tracking-normal rounded-full shadow-[0_4px_12px_rgba(8,53,148,0.15)] flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                @if(isLoading()) { 
                  <ion-spinner name="crescent" color="light" class="w-5 h-5" style="--stroke-width: 8px;"></ion-spinner> 
                } @else { 
                  Log In 
                }
            </button>
        </div>
        
        <!-- Continue as Guest -->
        <div class="text-center mb-6">
            <button (click)="continueAsGuest()" class="inline-flex items-center gap-2 text-sm font-bold text-[#083594] hover:opacity-80 transition-opacity">
                <span>Continue as guest</span>
                <ion-icon name="arrow-forward" class="text-lg"></ion-icon>
            </button>
        </div>

        @if (settings()?.showSocialLogin) {
          <!-- OR Divider -->
          <div class="text-center mb-6">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">OR</span>
          </div>

          <!-- Social Buttons (Reduced height & text size) -->
          <div class="space-y-3 mb-8">
               <!-- Facebook -->
               <button class="w-full py-2 px-6 rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-sm text-sm tracking-tight h-[2.625rem] bg-[#1877F2] text-white hover:bg-[#166fe5]">
                  <ion-icon name="logo-facebook" class="text-base absolute left-6"></ion-icon>
                  <span>Login with Facebook</span>
               </button>

               <!-- Google -->
               <button class="w-full py-2 px-6 rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-sm text-sm tracking-tight h-[2.625rem] bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm">
                  <svg class="w-4 h-4 absolute left-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-2.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Login with Google</span>
               </button>

               <!-- Apple -->
               <button class="w-full py-2 px-6 rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-sm text-sm tracking-tight h-[2.625rem] bg-black text-white hover:bg-gray-900">
                  <ion-icon name="logo-apple" class="text-lg absolute left-6"></ion-icon>
                  <span>Login with Apple</span>
               </button>
          </div>
        }

        <!-- Sign Up Link -->
        <div class="text-center mb-4">
             <p class="text-sm text-gray-500 font-bold">
                Don’t have an account? 
                <a (click)="goToSignup()" class="text-[#083594] font-bold hover:underline ml-1 cursor-pointer">Sign Up</a>
             </p>
        </div>

        <!-- Terms & Privacy Footer -->
        <div class="mt-8 text-center border-t border-gray-200/60 pt-5 px-2">
            <p class="text-xs text-gray-400 leading-relaxed font-medium">
                By signing up with an account, you agree to CeyHallo's 
                <span (click)="openLegalModal('terms')" class="text-gray-500 hover:text-[#083594] underline decoration-gray-300 underline-offset-2 transition-colors cursor-pointer">Terms of Service</span> and 
                <span (click)="openLegalModal('privacy')" class="text-gray-500 hover:text-[#083594] underline decoration-gray-300 underline-offset-2 transition-colors cursor-pointer">Privacy Policy</span>.
            </p>
        </div>

    </div>
  </div>
</ion-content>
`,
  styles: [`
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-slide-in {
      animation: slideInUp 0.7s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterLink],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  @Input() isModal: boolean = false;
  @Input() message: string = '';

  settings = this.dataService.getAppSettings();

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  
  showPassword = signal(false);
  rememberMe = signal(false);

  passwordFieldType = computed(() => this.showPassword() ? 'text' : 'password');

  constructor() {}

  onEmailInput(event: Event) {
    this.email.set((event.target as HTMLInputElement).value);
  }

  onPasswordInput(event: Event) {
    this.password.set((event.target as HTMLInputElement).value);
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  toggleRememberMe() {
    this.rememberMe.update(v => !v);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  goToSignup() {
    if (this.isModal) {
      this.modalCtrl.dismiss();
    }
    this.router.navigate(['/signup']);
  }

  continueAsGuest() {
    if (this.isModal) {
      this.modalCtrl.dismiss({ guest: true });
    } else {
      this.router.navigate(['/tabs/home']);
    }
  }

  async login() {
    this.errorMessage.set('');
    this.isLoading.set(true);
    const result = await this.authService.login(this.email(), this.password());
    this.isLoading.set(false);
    
    if (result.success) {
      if (this.isModal) {
        this.modalCtrl.dismiss({ loggedIn: true });
      } else {
        this.router.navigate(['/tabs/home']);
      }
    } else {
      const error = result.error || 'Login failed. Please try again.';
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

  async openLegalModal(type: string) {
    const modal = await this.modalCtrl.create({
      component: LegalPageComponent,
      componentProps: {
        docIdInput: type,
        isModal: true
      }
    });
    await modal.present();
  }
}
