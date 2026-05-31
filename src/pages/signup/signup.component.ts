
import { Component, ChangeDetectionStrategy, signal, inject, computed, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { RouterLink, Router } from '@angular/router';
import { LegalPageComponent } from '../legal/legal.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
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
export class SignUpComponent {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private router: Router = inject(Router);
  private modalCtrl: ModalController = inject(ModalController);
  private navCtrl: NavController = inject(NavController);
  private toastCtrl: ToastController = inject(ToastController);

  @Input() isModal: boolean = false;

  settings = this.dataService.getAppSettings();
  countries = this.dataService.getCountries();
  showAppleLogin = signal(Capacitor.getPlatform() === 'ios');

  // Form data
  name = signal('');
  email = signal('');
  region = signal('');
  phoneNumber = signal('');
  password = signal('');
  confirmPassword = signal('');
  
  errorMessage = signal('');
  isLoading = signal(false);
  private authCompletionHandled = false;
  
  showPassword = signal(false);
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

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  close() {
    if (this.isModal) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.navigateBack('/tabs/home');
    }
  }

  continueAsGuest() {
    if (this.isModal) {
      this.modalCtrl.dismiss({ guest: true });
    } else {
      this.router.navigate(['/tabs/home']);
    }
  }

  async signUp() {
    if (!this.name().trim() || !this.email().trim() || !this.phoneNumber().trim() || !this.password() || !this.confirmPassword() || !this.region()) {
      this.showErrorToast('Please fill in all required fields (Country and phone number are required).');
      return;
    }
    
    if (this.password() !== this.confirmPassword()) {
      this.showErrorToast('Passwords do not match.');
      return;
    }
    
    if (this.password().length < 8) {
        this.showErrorToast('Password must be at least 8 characters.');
        return;
    }
    
    if (!/[A-Za-z]/.test(this.password()) || !/\d/.test(this.password())) {
        this.showErrorToast('Password must contain at least one letter and one number.');
        return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);
    
    const result = await this.authService.signUp(
      this.email().trim(), 
      this.password(), 
      this.name().trim(),
      this.region(),
      this.phoneNumber().trim()
    );
    
    this.isLoading.set(false);
    
    if (result.success) {
      await this.finishSuccessfulAuth();
    } else {
      const error = result.error || 'Registration failed. Please try again.';
      this.errorMessage.set(error);
      this.showErrorToast(error);
    }
  }

  async signUpWithGoogle() {
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

  async signUpWithFacebook() {
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
      await this.modalCtrl.dismiss({ signedUp: true });
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
