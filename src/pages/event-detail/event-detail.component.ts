
import { Component, ChangeDetectionStrategy, computed, signal, OnInit, Input, Signal, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../models/event.model';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class EventDetailComponent implements OnInit {
  @Input() eventId!: string;
  private readonly eventIdSignal = signal<string | undefined>(undefined);
  private isRouteDriven = false;
  
  event: Signal<Event | undefined>;
  mapSafeUrl: Signal<SafeResourceUrl | null>;
  galleryImages: Signal<string[]>;
  
  actionButtonConfig: Signal<{ label: string, icon: string } | null>;

  galleryContainer = viewChild<ElementRef>('galleryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  // Gallery Lightbox
  isLightboxOpen = signal(false);
  activeLightboxIndex = signal(0);

  // Hero Image Lightbox
  isHeroLightboxOpen = signal(false);

  constructor(
    private modalCtrl: ModalController,
    private dataService: DataService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    this.event = computed(() => {
        const id = this.eventIdSignal();
        if (id === undefined) return undefined;
        return this.dataService.getEvents()().find(e => e.id === id);
    });

    this.mapSafeUrl = computed(() => {
        const evt = this.event();
        if (evt && evt.location) {
          const query = encodeURIComponent(evt.location);
          const url = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
          return this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
        return null;
    });

    this.galleryImages = computed(() => {
        const evt = this.event();
        if (!evt || !evt.gallery) return [];
        return evt.gallery;
    });

    this.actionButtonConfig = computed(() => {
        const evt = this.event();
        if (!evt) return null;

        const label = evt.actionLabel || 'Get Tickets';
        
        let icon = 'ticket';
        if (evt.actionType === 'url') icon = 'globe-outline';
        if (evt.actionType === 'register') icon = 'create-outline';
        
        return { label, icon };
    });
  }

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
        this.isRouteDriven = true;
        this.eventIdSignal.set(routeId);
    } else {
        this.eventIdSignal.set(this.eventId);
    }
  }

  handleImgError = handleImageError;

  close() {
    if (this.isRouteDriven) {
        this.navCtrl.back();
    } else {
        this.modalCtrl.dismiss();
    }
  }

  openMap() {
    const evt = this.event();
    if (evt && evt.location) {
        const query = encodeURIComponent(evt.location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_system');
    }
  }

  async openOrganizer() {
    const evt = this.event();
    if (evt?.organizerId) {
       const modal = await this.modalCtrl.create({
        component: BusinessDetailComponent,
        componentProps: { businessId: evt.organizerId }
      });
      await modal.present();
    }
  }

  async handleAction() {
    const evt = this.event();
    if (!evt) return;

    if (evt.actionType && evt.actionTarget) {
        const type = evt.actionType;
        const target = evt.actionTarget;

        if (type === 'url' || type === 'ticket' || type === 'register') {
            window.open(target, '_system');
        } else if (type === 'call') {
            window.open(`tel:${target}`, '_system');
        } else if (type === 'email') {
            window.open(`mailto:${target}`, '_system');
        } else if (type === 'whatsapp') {
            const url = target.startsWith('http') ? target : `https://wa.me/${target}`;
            window.open(url, '_system');
        }
    } else {
        const toast = await this.toastCtrl.create({
            message: 'No action available for this event.',
            duration: 3000,
            color: 'danger',
            icon: 'alert-circle',
            position: 'top',
            cssClass: 'toast-custom-text'
        });
        await toast.present();
    }
  }

  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    const slider = this.galleryContainer()?.nativeElement;
    if (slider) {
      this.startX = e.pageX - slider.offsetLeft;
      this.scrollLeft = slider.scrollLeft;
    }
  }

  endDrag() {
    this.isDown = false;
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.galleryContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX) * 2;
      slider.scrollLeft = this.scrollLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isDragging = true;
      }
    }
  }

  // --- Gallery Lightbox ---
  openLightbox(index: number) {
    if (this.isDragging) {
        this.isDragging = false;
        return;
    }
    this.activeLightboxIndex.set(index);
    this.isLightboxOpen.set(true);
  }

  closeLightbox() {
    this.isLightboxOpen.set(false);
  }

  nextImage(e?: MouseEvent) {
    e?.stopPropagation();
    const current = this.activeLightboxIndex();
    const total = this.galleryImages().length;
    this.activeLightboxIndex.set((current + 1) % total);
  }

  prevImage(e?: MouseEvent) {
    e?.stopPropagation();
    const current = this.activeLightboxIndex();
    const total = this.galleryImages().length;
    this.activeLightboxIndex.set((current - 1 + total) % total);
  }

  // --- Hero Image Lightbox ---
  openHeroLightbox() {
    if (this.event()?.imageUrl) {
        this.isHeroLightboxOpen.set(true);
    }
  }

  closeHeroLightbox() {
    this.isHeroLightboxOpen.set(false);
  }
}
