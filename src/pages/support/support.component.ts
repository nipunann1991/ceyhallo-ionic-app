
import { Component, ChangeDetectionStrategy, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { SupportInfo } from '../../models/support.model';

@Component({
  selector: 'app-support',
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]" [forceOverscroll]="false">
  
  <!-- Custom Header -->
  <div class="relative bg-[#083594] pb-24 rounded-b-[2.5rem] px-5 text-white shadow-sm pt-[calc(4rem+env(safe-area-inset-top))]">
    <div class="flex items-center justify-between relative z-10 mb-6">
      <!-- Back Button -->
      <button (click)="goBack()" class="p-2 -ml-2 active:opacity-70 transition-opacity">
         <ion-icon name="arrow-back" class="text-2xl"></ion-icon>
      </button>
      
      <!-- Title -->
      <h1 class="text-lg font-bold absolute left-1/2 -translate-x-1/2 tracking-tight">Support</h1>
      
      <div class="w-8"></div>
    </div>
    
    <!-- Hero Text -->
    <div class="text-center px-4">
        <h2 class="text-2xl font-extrabold mb-2">How can we help?</h2>
        <p class="text-blue-100 text-sm font-medium">We're here to answer your questions and solve your problems.</p>
    </div>
  </div>

  @if (supportInfo(); as info) {
    <!-- Contact Options Cards (Overlapping) -->
    <div class="px-5 -mt-12 relative z-10 grid grid-cols-2 gap-3 mb-8">
        
        <!-- Call Us -->
        <button (click)="callSupport()" class="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center gap-3 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-blue-50 text-[#083594] rounded-full flex items-center justify-center text-2xl">
                <ion-icon name="call"></ion-icon>
            </div>
            <div class="text-center">
                <h3 class="font-bold text-[#1A1C1E] text-sm">Call Us</h3>
                <p class="text-xs text-gray-500 mt-1 font-medium truncate max-w-[8rem]">{{ info.phone }}</p>
            </div>
        </button>

        <!-- Email Us -->
        <button (click)="emailSupport()" class="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center gap-3 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-blue-50 text-[#083594] rounded-full flex items-center justify-center text-2xl">
                <ion-icon name="mail"></ion-icon>
            </div>
            <div class="text-center">
                <h3 class="font-bold text-[#1A1C1E] text-sm">Email Us</h3>
                <p class="text-xs text-gray-500 mt-1 font-medium truncate max-w-[8rem]">{{ info.email }}</p>
            </div>
        </button>

    </div>

    <!-- Additional Info Section -->
    <div class="px-5 mb-8">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
             <div class="flex items-start gap-4 mb-4 border-b border-gray-100 pb-4">
                 <ion-icon name="time-outline" class="text-xl text-gray-400 mt-0.5 shrink-0"></ion-icon>
                 <div>
                     <h4 class="font-bold text-sm text-[#1A1C1E] mb-1">Working Hours</h4>
                     <p class="text-xs text-gray-500 leading-relaxed">{{ info.workingHours }}</p>
                 </div>
             </div>
             <div class="flex items-start gap-4">
                 <ion-icon name="location-outline" class="text-xl text-gray-400 mt-0.5 shrink-0"></ion-icon>
                 <div>
                     <h4 class="font-bold text-sm text-[#1A1C1E] mb-1">Our Office</h4>
                     <p class="text-xs text-gray-500 leading-relaxed">{{ info.address }}</p>
                 </div>
             </div>
        </div>
    </div>

    <!-- FAQ Section -->
    <div class="px-5 pb-10">
        <h3 class="text-lg font-bold text-[#1A1C1E] mb-4 ml-1">Frequently Asked Questions</h3>
        
        <div class="space-y-3">
            @for (faq of info.faqs; track faq.id) {
                <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300">
                    <button 
                        (click)="toggleFaq(faq.id)" 
                        class="w-full flex items-center justify-between p-4 text-left focus:outline-none">
                        <span class="font-bold text-sm text-[#1A1C1E] pr-4">{{ faq.question }}</span>
                        <ion-icon 
                            name="chevron-down" 
                            class="text-gray-400 transition-transform duration-300"
                            [class.rotate-180]="openFaqId() === faq.id">
                        </ion-icon>
                    </button>
                    
                    <div 
                        class="grid transition-all duration-300 ease-in-out"
                        [class.grid-rows-[1fr]]="openFaqId() === faq.id"
                        [class.grid-rows-[0fr]]="openFaqId() !== faq.id">
                        <div class="overflow-hidden">
                            <div class="p-4 pt-0 text-xs text-gray-500 leading-relaxed">
                                {{ faq.answer }}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    </div>
  } @else {
     <!-- Loading State -->
     <div class="flex flex-col items-center justify-center pt-20">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="text-gray-400 font-medium text-xs mt-4">Loading support info...</p>
     </div>
  }

</ion-content>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class SupportComponent {
  supportInfo: Signal<SupportInfo | null>;
  
  // Accordion state
  openFaqId = signal<string | null>(null);

  constructor(
    private dataService: DataService,
    private navCtrl: NavController 
  ) {
    this.supportInfo = this.dataService.getSupportInfo();
  }

  toggleFaq(id: string) {
    if (this.openFaqId() === id) {
      this.openFaqId.set(null);
    } else {
      this.openFaqId.set(id);
    }
  }

  goBack() {
    this.navCtrl.navigateBack('/tabs/profile');
  }

  callSupport() {
    const info = this.supportInfo();
    if (info?.phone) {
        window.open(`tel:${info.phone}`, '_system');
    }
  }

  emailSupport() {
    const info = this.supportInfo();
    if (info?.email) {
        window.open(`mailto:${info.email}`, '_system');
    }
  }
}
