
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
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
