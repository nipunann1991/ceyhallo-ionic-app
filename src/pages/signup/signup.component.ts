import { Component, ChangeDetectionStrategy, signal, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { RouterLink, Router } from '@angular/router';

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

  @Input() isModal: boolean = false;

  countries = this.dataService.getCountries();

  // Pre-filled data
  name = signal('Nipuna Nanayakkara');
  email = signal('nipunann0710@gmail.com');
  region = signal('AE'); // UAE
  phoneNumber = signal('00000000');
  password = signal('12345678');
  confirmPassword = signal('12345678');
  
  errorMessage = signal('');
  isLoading = signal(false);
  
  showPassword = signal(false);
  passwordFieldType = computed(() => this.showPassword() ? 'text' : 'password');

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
    if (!this.name() || !this.email() || !this.password() || !this.confirmPassword() || !this.region()) {
      this.errorMessage.set('Please fill in all required fields (Region is required).');
      return;
    }
    
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }
    
    if (this.password().length < 6) {
        this.errorMessage.set('Password must be at least 6 characters.');
        return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);
    
    const result = await this.authService.signUp(
      this.email(), 
      this.password(), 
      this.name(),
      this.region(),
      this.phoneNumber()
    );
    
    this.isLoading.set(false);
    
    if (result.success) {
      if (this.isModal) {
        this.modalCtrl.dismiss({ signedUp: true });
      } else {
        this.router.navigate(['/tabs/home']);
      }
    } else {
      this.errorMessage.set(result.error || 'Registration failed. Please try again.');
    }
  }
}