import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-list-business',
  templateUrl: './list-business.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ListBusinessComponent {
  private navCtrl: NavController = inject(NavController);
  private toastCtrl: ToastController = inject(ToastController);
  private dataService = inject(DataService);

  // Form Signals
  businessName = signal('');
  category = signal('');
  phoneNumber = signal('');
  email = signal('');
  description = signal('');

  region = signal('');
  city = signal('');

  countries = this.dataService.getCountries();
  availableCities = computed(() => {
    const selectedRegion = this.region();
    const country = this.countries().find(c => c.id === selectedRegion);
    return country ? country.cities : [];
  });

  isLoading = signal(false);

  goBack() {
    this.navCtrl.back();
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

    // Simulate API call
    setTimeout(async () => {
      this.isLoading.set(false);
      await this.showToast('Business submitted for review!', 'success');
      this.navCtrl.back();
    }, 1500);
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