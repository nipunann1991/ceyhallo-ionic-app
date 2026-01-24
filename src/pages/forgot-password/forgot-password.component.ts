import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
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
    imports: [CommonModule, IonicModule, RouterLink]
})
export class ForgotPasswordComponent {
    private authService = inject(AuthService);
    private navCtrl = inject(NavController);
    private toastCtrl = inject(ToastController);
    
    email = signal('');
    isLoading = signal(false);
    errorMessage = signal('');
    
    async sendLink() {
        if (!this.email()) {
            this.errorMessage.set('Please enter your email address.');
            return;
        }
        
        this.isLoading.set(true);
        this.errorMessage.set('');
        
        const result = await this.authService.resetPassword(this.email());
        this.isLoading.set(false);
        
        if (result.success) {
            const toast = await this.toastCtrl.create({
                message: 'Reset link sent to your email.',
                color: 'success',
                duration: 3000,
                position: 'top',
                icon: 'checkmark-circle',
                cssClass: 'toast-custom-text'
            });
            await toast.present();
            this.navCtrl.back();
        } else {
            this.errorMessage.set(result.error || 'Failed to send reset link.');
        }
    }
}