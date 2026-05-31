import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { auth } from '../../services/firebase.service';
import { FacebookAuthProvider, signInWithPopup, linkWithPopup } from 'firebase/auth';

@Component({
  selector: 'app-manage-business',
  templateUrl: './manage-business.component.html',
  imports: [CommonModule, IonicModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageBusinessComponent {
  isLoading = signal(false);
  isConnected = signal(false);

  constructor(private toastCtrl: ToastController) {
    this.checkConnection();
  }

  checkConnection() {
    const user = auth.currentUser;
    if (user) {
      const isLinked = user.providerData.some(provider => provider.providerId === 'facebook.com');
      this.isConnected.set(isLinked);
    }
  }

  async connectFacebook() {
    this.isLoading.set(true);
    try {
      const provider = new FacebookAuthProvider();
      // Add scopes for business management
      provider.addScope('pages_show_list');
      provider.addScope('pages_read_engagement');
      provider.addScope('pages_manage_posts');
      
      const user = auth.currentUser;
      if (user) {
        await linkWithPopup(user, provider);
        this.isConnected.set(true);
        this.showToast('Successfully connected with Facebook Business!', 'success');
      } else {
        this.showToast('You must be logged in to connect a business.', 'danger');
      }
    } catch (error: any) {
      console.error('Facebook connection error:', error);
      this.showToast(error.message || 'Failed to connect with Facebook.', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  async disconnectFacebook() {
    // In a real app, you would unlink the provider using unlink(user, 'facebook.com')
    // For now, we'll just show a toast as unlinking might require re-authentication
    this.showToast('Disconnect functionality would be implemented here.', 'warning');
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
