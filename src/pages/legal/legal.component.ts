
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
@if (document(); as doc) {
  <ion-content [fullscreen]="true" class="bg-white" [forceOverscroll]="false">
    
    <!-- Hero Section -->
    <div class="relative w-full h-[14rem]">
      <!-- Legal Image (Generic Office/Contract Image) -->
      <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2670&auto=format&fit=crop" 
           (error)="handleImgError($event)" 
           alt="Legal" 
           class="w-full h-full object-cover">
      
      <!-- Gradient Overlay (Top) for navigation visibility -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent h-32 pointer-events-none"></div>

      <!-- Navigation Overlay -->
      <div class="absolute top-0 left-0 right-0 nav-overlay-safe px-5 flex justify-between items-start z-10">
        <!-- Back Button -->
        <button (click)="goBack()" class="text-white hover:opacity-80 transition-opacity active:scale-90">
           <ion-icon name="arrow-back" class="text-[1.75rem] drop-shadow-md"></ion-icon>
        </button>
      </div>
    </div>

    <!-- Content Card (Overlapping) -->
    <div class="relative -mt-12 z-10 bg-white rounded-t-[2.5rem] px-6 pt-10 pb-20 min-h-[60vh] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
       
       <!-- Date / Category style -->
       <div class="flex justify-center mb-1">
         <span class="text-[#083594] font-bold text-[0.75rem] tracking-[0.05em]">
            Legal Document • {{ doc.lastUpdated | date:'mediumDate' }}
         </span>
       </div>

       <!-- Title (Clicked Title) -->
       <h1 class="text-xl font-extrabold text-[#1A1C1E] tracking-tight mb-8 text-center leading-tight">
         {{ doc.title }}
       </h1>

       <!-- Content -->
       <div class="legal-content text-sm text-gray-600 mb-6 leading-relaxed font-normal" [innerHTML]="doc.content"></div>
    </div>

  </ion-content>
} @else {
  <ion-content class="bg-white" [forceOverscroll]="false">
    <div class="flex flex-col items-center justify-center h-full gap-4">
      <ion-spinner name="crescent" color="primary"></ion-spinner>
      <p class="text-gray-400 font-medium text-sm">Loading document...</p>
    </div>
  </ion-content>
}
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
