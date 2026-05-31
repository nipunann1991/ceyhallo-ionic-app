
import { Component, ChangeDetectionStrategy, signal, computed, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { RouterLink, Router } from '@angular/router';
import { LegalPageComponent } from '../legal/legal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
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
  showAppleLogin = signal(Capacitor.getPlatform() === 'ios');

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  private authCompletionHandled = false;
  
  showPassword = signal(false);
  rememberMe = signal(false);

  passwordFieldType = computed(() => this.showPassword() ? 'text' : 'password');

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (!user || this.authCompletionHandled) {
        return;
      }

      void this.finishSuccessfulAuth();
    });
  }

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
      await this.finishSuccessfulAuth();
    } else {
      const error = result.error || 'Login failed. Please try again.';
      this.errorMessage.set(error);
      this.showErrorToast(error);
    }
  }

  async loginWithGoogle() {
    this.errorMessage.set('');
    this.isLoading.set(true);
    const result = await this.authService.signInWithGoogle();
    this.isLoading.set(false);

    if (result.success) {
      await this.finishSuccessfulAuth();
      return;
    }

    if (result.dismissed) {
      return;
    }

    const error = result.error || 'Google Sign-In failed. Please try again.';
    if (this.authService.isDismissedSocialLoginError(error)) {
      return;
    }
    this.errorMessage.set(error);
    await this.showErrorToast(error);
  }

  async loginWithFacebook() {
    this.errorMessage.set('');
    this.isLoading.set(true);
    const result = await this.authService.signInWithFacebook();
    this.isLoading.set(false);

    if (result.success) {
      await this.finishSuccessfulAuth();
      return;
    }

    if (result.dismissed) {
      return;
    }

    const error = result.error || 'Facebook Login failed. Please try again.';
    if (this.authService.isDismissedSocialLoginError(error)) {
      return;
    }
    this.errorMessage.set(error);
    await this.showErrorToast(error);
  }

  async loginWithApple() {
    this.errorMessage.set('');
    this.isLoading.set(true);
    const result = await this.authService.signInWithApple();
    this.isLoading.set(false);

    if (result.success) {
      await this.finishSuccessfulAuth();
      return;
    }

    if (result.dismissed) {
      return;
    }

    const error = result.error || 'Apple Login failed. Please try again.';
    if (this.authService.isDismissedSocialLoginError(error)) {
      return;
    }
    this.errorMessage.set(error);
    await this.showErrorToast(error);
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

  private async finishSuccessfulAuth() {
    if (this.authCompletionHandled) {
      return;
    }

    this.authCompletionHandled = true;
    this.authService.requestProfileCompletionPrompt();

    if (this.isModal) {
      await this.modalCtrl.dismiss({ loggedIn: true });
      return;
    }

    await this.router.navigate(['/tabs/home']);
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
