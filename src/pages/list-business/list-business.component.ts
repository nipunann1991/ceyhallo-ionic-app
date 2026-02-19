
import { Component, ChangeDetectionStrategy, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-list-business',
  templateUrl: './list-business.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ListBusinessComponent {
  // Form Signals
  businessName = signal('');
  category = signal('');
  phoneNumber = signal('');
  email = signal('');
  description = signal('');

  region = signal('');
  city = signal('');

  countries: Signal<Country[]>;
  availableCities: Signal<any[]>;

  isLoading = signal(false);

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.countries = this.dataService.getCountries();
    this.availableCities = computed(() => {
        const selectedRegion = this.region();
        const country = this.countries().find(c => c.id === selectedRegion);
        return country ? country.cities : [];
    });
  }

  goBack() {
    this.navCtrl.navigateBack('/tabs/profile');
  }

  onRegionChange(newRegion: string) {
    this.region.set(newRegion);
    this.city.set(''); // Reset city when region changes
  }
  
  async submit() {
    if (!this.businessName() || !this.category() || !this.phoneNumber() || !this.description() || !this.region() || !this.city()) {
      await this.showToast('Please fill in all required fields.', 'danger');
      return;
    }

    this.isLoading.set(true);

    const user = this.authService.currentUser();
    const userId = user?.uid || 'anonymous';
    const userEmail = user?.email;

    const data = {
        name: this.businessName(),
        category: this.category(),
        phone: this.phoneNumber(),
        email: this.email() || userEmail || '', 
        description: this.description(),
        region: this.region(),
        city: this.city(),
        submittedBy: userId
    };

    try {
        await this.dataService.submitBusinessListing(data);
        this.isLoading.set(false);
        await this.showToast('Business submitted for review!', 'success');
        this.navCtrl.navigateBack('/tabs/profile');
    } catch (error) {
        console.error(error);
        this.isLoading.set(false);
        await this.showToast('Failed to submit business listing. Please try again.', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }
}
