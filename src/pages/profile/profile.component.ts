import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { handleImageError } from '../../utils/image.utils';

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
  authService = inject(AuthService);

  user = computed(() => {
    // Prefer extended profile from Firestore, fallback to Auth
    const profile = this.authService.userProfile();
    const firebaseUser = this.authService.currentUser();
    
    return {
      name: profile?.name || firebaseUser?.displayName || 'User',
      email: profile?.email || firebaseUser?.email || '',
      city: profile?.city || '',
      isVerified: profile?.isVerified ?? firebaseUser?.emailVerified,
      avatar: profile?.photoURL || firebaseUser?.photoURL || `https://i.pravatar.cc/300?u=${profile?.email || 'user'}`
    };
  });

  handleImgError = handleImageError;

  async logout() {
    await this.authService.logout();
  }
}