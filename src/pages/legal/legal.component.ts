
import { Component, ChangeDetectionStrategy, signal, OnInit, computed, Signal, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { LegalDocument } from '../../models/legal.model';

@Component({
  selector: 'app-legal',
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
      @if (document(); as doc) {
        <h1 class="text-lg font-bold absolute left-1/2 -translate-x-1/2 tracking-tight whitespace-nowrap">{{ doc.title }}</h1>
      }
      
      <div class="w-8"></div>
    </div>
    
    <!-- Hero Text -->
    <div class="text-center px-4 mt-2">
        @if (document(); as doc) {
          <p class="text-blue-100 text-sm font-medium">Legal Document</p>
        }
    </div>
  </div>

  <div class="px-6 -mt-12 relative z-10 pb-[calc(2rem+env(safe-area-inset-bottom))]">
    @if (document(); as doc) {
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class LegalPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);

  @Input() docIdInput?: string;
  @Input() isModal: boolean = false;

  docId = signal<string>('');
  allDocs: Signal<LegalDocument[]>;
  document: Signal<(LegalDocument & { title: string }) | null>;

  constructor() {
    this.allDocs = this.dataService.getLegalDocs();
    
    this.document = computed(() => {
        const id = this.docId();
        if (!id) return null;

        const doc = this.allDocs().find(doc => doc.id === id);
        
        if (!doc) return null;
    
        // Strict title mapping as requested
        let title = doc.title;
        if (id === 'privacy') title = 'Privacy Policy';
        if (id === 'terms') title = 'Terms & Conditions';
        if (id === 'help') title = 'Help & Support';
    
        return { ...doc, title };
    });
  }

  ngOnInit() {
    if (this.docIdInput) {
      this.docId.set(this.docIdInput);
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.docId.set(id);
        }
      });
    }
  }

  handleImgError = handleImageError;

  goBack() {
    if (this.isModal) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.navigateBack('/tabs/profile');
    }
  }
}
