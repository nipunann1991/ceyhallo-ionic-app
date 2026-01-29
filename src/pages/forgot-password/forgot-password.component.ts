import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
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
    private navCtrl: NavController = inject(NavController);
    
    // State Management
    isLoading = signal(false);
    errorMessage = signal('');
    linkSent = signal(false);

    // User Input
    email = signal('');

    async sendResetLink() {
        const emailVal = this.email().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailVal) {
            this.errorMessage.set('Please enter your email address.');
            return;
        }
        if (!emailRegex.test(emailVal)) {
            this.errorMessage.set('Please enter a valid email address.');
            return;
        }
        
        this.isLoading.set(true);
        this.errorMessage.set('');

        // Call the AuthService to send the official Firebase password reset email
        const result = await this.authService.resetPassword(emailVal);
        
        this.isLoading.set(false);
        
        if (result.success) {
            this.linkSent.set(true);
        } else {
            this.errorMessage.set(result.error || 'Failed to send reset link. Please try again.');
        }
    }

    goBackToLogin() {
      this.navCtrl.navigateBack('/login');
    }
}