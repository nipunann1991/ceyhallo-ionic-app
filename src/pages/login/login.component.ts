import { Component, ChangeDetectionStrategy, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
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
  // Use constructor injection to ensure dependencies are resolved correctly when created via ModalController
  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  @Input() isModal: boolean = false;
  @Input() message: string = '';

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
      this.errorMessage.set(result.error || 'Login failed. Please try again.');
    }
  }
}