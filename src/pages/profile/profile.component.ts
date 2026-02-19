
import { Component, ChangeDetectionStrategy, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
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
  imports: [CommonModule, IonicModule, RouterLink],
})
export class ProfileComponent {
  user: Signal<any>;

  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private alertCtrl: AlertController,
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
          flagUrl: country?.flagUrl || ''
        };
    });
  }

  handleImgError = handleImageError;

  async logout() {
    await this.authService.logout();
  }

  async resendVerification() {
    const result = await this.authService.resendVerificationEmail();
    let toastMessage = 'Verification email sent. Please check your inbox.';
    let toastColor: 'success' | 'danger' = 'success';
    
    if (!result.success) {
      toastMessage = result.error || 'Failed to send verification email.';
      toastColor = 'danger';
    }
    
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 3000,
      color: toastColor,
      position: 'top',
      icon: toastColor === 'success' ? 'checkmark-circle' : 'alert-circle',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }

  async deleteAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      message: 'This action is permanent and cannot be undone. Please enter your password to confirm.',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Enter your password',
          attributes: {
            autocapitalize: 'off',
            autocomplete: 'current-password',
            spellcheck: 'false',
          },
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async (data) => {
            if (!data.password) {
              const toast = await this.toastCtrl.create({
                message: 'Password is required to delete your account.',
                duration: 3000,
                color: 'danger',
                position: 'top',
                icon: 'alert-circle',
                cssClass: 'toast-custom-text'
              });
              await toast.present();
              return;
            }

            const result = await this.authService.deleteAccount(data.password);
            if (result.success) {
              const toast = await this.toastCtrl.create({
                message: 'Your account has been successfully deleted.',
                duration: 3000,
                color: 'success',
                position: 'top',
                icon: 'checkmark-circle',
                cssClass: 'toast-custom-text'
              });
              await toast.present();
            } else {
              const errorToast = await this.toastCtrl.create({
                message: result.error || 'An error occurred. Please try again.',
                duration: 5000,
                color: 'danger',
                position: 'top',
                icon: 'alert-circle',
                cssClass: 'toast-custom-text'
              });
              await errorToast.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
