
import { Component, ChangeDetectionStrategy, computed, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { handleImageError } from '../../utils/image.utils';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
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
  imports: [CommonModule, IonicModule, RouterLink, FormsModule],
})
export class ProfileComponent {
  user: Signal<{ name: string; city: string; isVerified: boolean; avatar: string; flagUrl: string; showCompleteProfilePrompt: boolean }>;
  appSettings = this.dataService.getAppSettings();
  verificationDialogState = signal<'closed' | 'confirm' | 'code' | 'success'>('closed');
  verificationDialogBusy = signal(false);
  verificationDialogEmail = signal('');
  verificationCode = signal('');

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private toastCtrl: ToastController
  ) {
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
          flagUrl: country?.flagUrl || '',
          showCompleteProfilePrompt: !profile?.phoneNumber?.trim()
        };
    });
  }

  handleImgError = handleImageError;

  async logout() {
    await this.authService.logout();
  }

  async resendVerification() {
    this.verificationCode.set('');
    this.verificationDialogEmail.set(this.authService.currentUser()?.email || '');
    this.verificationDialogState.set('confirm');
  }

  closeVerificationDialog() {
    if (this.verificationDialogBusy()) {
      return;
    }

    this.verificationDialogState.set('closed');
    this.verificationCode.set('');
  }

  async sendVerificationCode() {
    this.verificationDialogBusy.set(true);
    const result = await this.authService.resendVerificationEmail();
    this.verificationDialogBusy.set(false);

    if (!result.success) {
      await this.showToast(result.error || 'Failed to send verification code.', 'danger');
      return;
    }

    this.verificationDialogEmail.set(result.email || this.authService.currentUser()?.email || '');
    this.verificationCode.set('');
    this.verificationDialogState.set('code');
    await this.showToast(
      `Verification code sent to ${result.email || 'your email address'}.`,
      'success'
    );
  }

  async confirmVerificationCode() {
    const code = this.verificationCode().trim();
    if (!code) {
      await this.showToast('Verification code is required.', 'danger');
      return;
    }

    this.verificationDialogBusy.set(true);
    const result = await this.authService.verifyEmailWithCode(code);
    this.verificationDialogBusy.set(false);

    if (!result.success) {
      await this.showToast(result.error || 'Failed to verify email.', 'danger');
      return;
    }

    this.verificationDialogState.set('success');
  }

  finishVerificationFlow() {
    this.verificationDialogState.set('closed');
    this.verificationCode.set('');
  }

  onVerificationBackdropClick() {
    if (this.verificationDialogBusy()) {
      return;
    }

    if (this.verificationDialogState() === 'success') {
      this.finishVerificationFlow();
      return;
    }

    this.closeVerificationDialog();
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }
}
