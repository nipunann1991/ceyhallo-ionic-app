import { Component, ChangeDetectionStrategy, Input, Signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { LegalDocument } from '../../models/legal.model';

@Component({
  selector: 'app-terms',
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]" [forceOverscroll]="false">
  
  <!-- Custom Header (Matching Business Listing Style) -->
  <div class="relative bg-[#083594] pb-20 rounded-b-[2.5rem] px-5 text-white shadow-sm pt-[calc(4rem+env(safe-area-inset-top))]">
    <div class="flex items-center justify-between relative z-10">
      <!-- Back Button -->
      <button (click)="goBack()" class="p-2 -ml-2 active:opacity-70 transition-opacity text-white">
         <ion-icon name="arrow-back" class="text-2xl"></ion-icon>
      </button>
      
      <!-- Title -->
      <h1 class="text-lg font-bold absolute left-1/2 -translate-x-1/2 tracking-tight whitespace-nowrap">
        {{ legalDoc()?.title || 'Terms & Conditions' }}
      </h1>
      
      <div class="w-8"></div>
    </div>
    
    <!-- Hero Text -->
    <div class="text-center px-4 mt-2">
        @if (legalDoc(); as doc) {
          <p class="text-blue-100 text-sm font-medium">Legal Document</p>
        }
    </div>
  </div>

  <div class="px-6 -mt-12 relative z-10 pb-[calc(2rem+env(safe-area-inset-bottom))]">
    @if (legalDoc(); as doc) {
      <!-- Content Card -->
      <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8EEF7] min-h-[60vh]">
         <!-- Content -->
         <div class="legal-content text-sm text-gray-600 leading-relaxed font-normal" [innerHTML]="doc.content"></div>
      </div>
    } @else {
      <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8EEF7] flex flex-col items-center justify-center gap-4">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="text-gray-400 font-medium text-sm">Loading document...</p>
      </div>
    }
  </div>

</ion-content>
`,
  standalone: true,
  imports: [CommonModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent {
  private dataService = inject(DataService);
  private navCtrl = inject(NavController);

  @Input() docId = 'terms';

  legalDoc: Signal<LegalDocument | undefined>;

  constructor() {
    this.legalDoc = computed(() => {
      return this.dataService.getLegalDocs()().find(d => d.id === this.docId);
    });
  }

  goBack() {
    this.navCtrl.navigateBack('/tabs/profile');
  }
}
