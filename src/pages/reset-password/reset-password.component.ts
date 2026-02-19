
import { Component, ChangeDetectionStrategy, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
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
