import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { RouterLink, Router } from '@angular/router';

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
  private router = inject(Router);

  email = signal('alex@ceyhallo.com');
  password = signal('12345678');
  errorMessage = signal('');
  isLoading = signal(false);
  
  showPassword = signal(false);
  rememberMe = signal(false);

  passwordFieldType = computed(() => this.showPassword() ? 'text' : 'password');

  onEmailInput(event: any) {
    this.email.set(event.target.value);
  }

  onPasswordInput(event: any) {
    this.password.set(event.target.value);
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  toggleRememberMe() {
    this.rememberMe.update(v => !v);
  }

  async login() {
    this.errorMessage.set('');
    this.isLoading.set(true);
    const result = await this.authService.login(this.email(), this.password());
    this.isLoading.set(false);
    
    if (result.success) {
      this.router.navigate(['/tabs/home']);
    } else {
      this.errorMessage.set(result.error || 'Login failed. Please try again.');
    }
  }
}