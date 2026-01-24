import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);

  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  isLoading = signal(false);

  goBack() {
    this.navCtrl.back();
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
      this.navCtrl.back();
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