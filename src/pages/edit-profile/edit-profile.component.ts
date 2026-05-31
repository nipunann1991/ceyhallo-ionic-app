
import { Component, ChangeDetectionStrategy, signal, effect, computed, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../models/user.model';
import { handleImageError } from '../../utils/image.utils';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class EditProfileComponent {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);

  userProfile: Signal<UserProfile | null> = this.authService.userProfile;
  countries: Signal<Country[]> = this.dataService.getCountries();
  availableCities: Signal<any[]>;
  
  // Form Signals
  displayName = signal('');
  email = signal('');
  phoneNumber = signal('');
  city = signal('');
  region = signal('');
  address = signal('');
  dateOfBirth = signal('');
  deleteDialogState = signal<'closed' | 'confirm' | 'code' | 'success'>('closed');
  deleteDialogBusy = signal(false);
  deleteDialogEmail = signal('');
  deleteVerificationCode = signal('');
  
  isLoading = signal(false);

  constructor() {
    this.availableCities = computed(() => {
        const selectedRegion = this.region();
        const country = this.countries().find(c => c.id === selectedRegion);
        return country ? country.cities : [];
    });

    effect(() => {
      const profile = this.userProfile();
      if (profile) {
        this.displayName.set(profile.name || '');
        this.email.set(profile.email || '');
        this.phoneNumber.set(profile.phoneNumber || '');
        this.city.set(profile.city || '');
        this.region.set(profile.region || '');
        this.address.set(profile.address || '');
        this.dateOfBirth.set(profile.dateOfBirth || '');
      }
    });
  }

  handleImgError = handleImageError;

  goBack() {
    this.navCtrl.navigateBack('/tabs/profile');
  }

  onRegionChange(newRegion: string) {
    this.region.set(newRegion);
    this.city.set(''); // Reset city when region changes
  }

  async save() {
    if (!this.displayName()?.trim()) {
      this.showToast('Display Name cannot be empty', 'danger');
      return;
    }

    if (!this.phoneNumber().trim()) {
      this.showToast('Phone number is required', 'danger');
      return;
    }

    this.isLoading.set(true);
    
    const updateData: Partial<UserProfile> = {
        name: this.displayName().trim(),
        phoneNumber: this.phoneNumber().trim(),
        city: this.city() || '',
        region: this.region() || '',
        address: this.address() || '',
        dateOfBirth: this.dateOfBirth() || ''
    };

    const result = await this.authService.updateUserProfile(updateData);
    this.isLoading.set(false);

    if (result.success) {
      await this.showToast('Profile updated successfully', 'success');
      this.navCtrl.navigateBack('/tabs/profile');
    } else {
      await this.showToast(result.error || 'Failed to update profile', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }

  async deleteAccount() {
    this.deleteVerificationCode.set('');
    this.deleteDialogEmail.set(this.email());
    this.deleteDialogState.set('confirm');
  }

  closeDeleteDialog() {
    if (this.deleteDialogBusy()) {
      return;
    }

    this.deleteDialogState.set('closed');
    this.deleteVerificationCode.set('');
  }

  async sendDeleteAccountCode() {
    this.deleteDialogBusy.set(true);
    const result = await this.authService.requestDeleteAccountCode();
    this.deleteDialogBusy.set(false);

    if (!result.success) {
      await this.showToast(result.error || 'Failed to send verification code.', 'danger');
      return;
    }

    this.deleteDialogEmail.set(result.email || this.email());
    this.deleteVerificationCode.set('');
    this.deleteDialogState.set('code');
    await this.showToast(`Verification code sent to ${result.email}.`, 'success');
  }

  async confirmDeleteAccount() {
    const code = this.deleteVerificationCode().trim();
    if (!code) {
      await this.showToast('Verification code is required.', 'danger');
      return;
    }

    this.deleteDialogBusy.set(true);
    const result = await this.authService.deleteAccountWithCode(code);
    this.deleteDialogBusy.set(false);

    if (!result.success) {
      await this.showToast(result.error || 'An error occurred. Please try again.', 'danger');
      return;
    }

    this.deleteDialogState.set('success');
  }

  finishDeleteFlow() {
    this.deleteDialogState.set('closed');
    this.navCtrl.navigateRoot('/login');
  }

  onDeleteDialogBackdropClick() {
    if (this.deleteDialogBusy()) {
      return;
    }

    if (this.deleteDialogState() === 'success') {
      this.finishDeleteFlow();
      return;
    }

    this.closeDeleteDialog();
  }
}
