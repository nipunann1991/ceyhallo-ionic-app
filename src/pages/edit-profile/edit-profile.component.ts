
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
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]" [forceOverscroll]="false">
  
  <!-- Custom Header (Support Style) -->
  <div class="relative bg-[#083594] pb-20 rounded-b-[2.5rem] px-5 text-white shadow-sm pt-[calc(4rem+env(safe-area-inset-top))]">
    <div class="flex items-center justify-between relative z-10">
      <!-- Back Button -->
      <button (click)="goBack()" class="p-2 -ml-2 active:opacity-70 transition-opacity text-white">
         <ion-icon name="arrow-back" class="text-2xl"></ion-icon>
      </button>
      
      <!-- Title -->
      <h1 class="text-lg font-bold absolute left-1/2 -translate-x-1/2 tracking-tight">Edit Profile</h1>
      
      <div class="w-8"></div>
    </div>
    
    <!-- Hero Text -->
    <div class="text-center px-4">
        <p class="text-blue-100 text-sm font-medium">Manage your personal details and contact information.</p>
    </div>
  </div>

  <div class="px-6 -mt-12 relative z-10 pb-[calc(2rem+env(safe-area-inset-bottom))]">

    <!-- Form Container (White Card) -->
    <div class="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8EEF7] space-y-5">
       
       <!-- Display Name -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">Full Name</label>
          <div class="relative">
             <input 
               type="text" 
               [ngModel]="displayName()" 
               (ngModelChange)="displayName.set($event)"
               class="w-full h-12 bg-[#F8F9FA] rounded-xl px-4 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none placeholder-gray-400"
               placeholder="Alex Perera">
          </div>
       </div>

       <!-- Email (Read Only) -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">Email Address</label>
          <div class="relative opacity-60">
             <input 
               type="email" 
               [value]="email()" 
               readonly
               class="w-full h-12 bg-gray-50 rounded-xl px-4 text-gray-500 font-medium border border-transparent outline-none cursor-not-allowed"
               placeholder="alex@ceyhallo.com">
          </div>
       </div>
       
       <!-- Phone Number -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">Phone Number</label>
          <div class="relative">
             <input 
               type="tel" 
               [ngModel]="phoneNumber()" 
               (ngModelChange)="phoneNumber.set($event)"
               class="w-full h-12 bg-[#F8F9FA] rounded-xl px-4 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none placeholder-gray-400"
               placeholder="+971 50 123 4567">
          </div>
       </div>

       <!-- Date of Birth -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">Date of Birth</label>
          <div class="relative">
             <input 
               type="date" 
               [ngModel]="dateOfBirth()" 
               (ngModelChange)="dateOfBirth.set($event)"
               min="1900-01-01"
               class="w-full min-w-full h-12 bg-[#F8F9FA] rounded-xl px-4 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none block appearance-none">
          </div>
       </div>

       <!-- Address (Text Area) -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">Address</label>
          <div class="relative">
             <textarea 
               [ngModel]="address()" 
               (ngModelChange)="address.set($event)"
               class="w-full h-24 bg-[#F8F9FA] rounded-xl px-4 py-3 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none placeholder-gray-400 resize-none"
               placeholder="Enter your address"></textarea>
          </div>
       </div>

       <!-- Region/Country (Select) -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">Region</label>
          <div class="relative">
             <select 
               [ngModel]="region()" 
               (ngModelChange)="onRegionChange($event)"
               class="w-full h-12 bg-[#F8F9FA] rounded-xl px-4 pr-10 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none appearance-none">
               <option value="" disabled>Select Region</option>
               @for (country of countries(); track country.id) {
                 <option [value]="country.id">{{ country.name }}</option>
               }
             </select>
             <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ion-icon name="chevron-down"></ion-icon>
             </div>
          </div>
       </div>

       <!-- City (Select - Dependent on Region) -->
       <div>
          <label class="block text-xs font-bold text-[#1A1C1E] mb-2 pl-1">City</label>
          <div class="relative">
             <select 
               [ngModel]="city()" 
               (ngModelChange)="city.set($event)"
               [disabled]="!region() || availableCities().length === 0"
               class="w-full h-12 bg-[#F8F9FA] rounded-xl px-4 pr-10 text-[#1A1C1E] font-medium border border-transparent focus:bg-white focus:border-[#083594] focus:ring-4 focus:ring-[#083594]/10 transition-all outline-none appearance-none disabled:bg-gray-50 disabled:text-gray-400">
               <option value="" disabled>Select City</option>
               @for (c of availableCities(); track c.name) {
                 <option [value]="c.name">{{ c.name }}</option>
               }
             </select>
             <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ion-icon name="chevron-down"></ion-icon>
             </div>
          </div>
       </div>

    </div>

    <!-- Save Button (Flows with content) -->
    <div class="mt-8">
       <button 
         (click)="save()" 
         [disabled]="isLoading()"
         class="w-full h-[3.25rem] bg-[#083594] hover:bg-[#07308a] active:scale-[0.98] text-white font-bold text-[0.95rem] rounded-full shadow-[0_8px_20px_rgba(8,53,148,0.25)] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
         @if (isLoading()) {
            <ion-spinner name="crescent" color="light" class="w-6 h-6"></ion-spinner>
         } @else {
            <ion-icon name="checkmark-circle-outline" class="text-xl"></ion-icon>
            Save Changes
         }
       </button>
    </div>

  </div>

</ion-content>
`,
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

    this.isLoading.set(true);
    
    const updateData: Partial<UserProfile> = {
        name: this.displayName() || '',
        phoneNumber: this.phoneNumber() || '',
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
}
