
import { Component, ChangeDetectionStrategy, computed, signal, OnInit, Input, viewChild, ElementRef, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { Offer } from '../../models/offer.model';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { NewsArticle } from '../../models/news.model';
import { Business } from '../../models/business.model';
import { Event } from '../../models/event.model';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, OfferCardComponent, EventCardComponent],
})
export class BusinessDetailComponent implements OnInit {
  @Input() businessId!: string;
  private readonly businessIdSignal = signal<string | undefined>(undefined);
  private isRouteDriven = false;

  galleryContainer = viewChild<ElementRef>('galleryContainer');
  offerContainer = viewChild<ElementRef>('offerContainer');
  eventContainer = viewChild<ElementRef>('eventContainer');

  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  private isOfferDown = false;
  private startOfferX = 0;
  private scrollOfferLeft = 0;
  public isOfferDragging = false;

  private isEventDown = false;
  private startEventX = 0;
  private scrollEventLeft = 0;
  public isEventDragging = false;

  isLightboxOpen = signal(false);
  activeLightboxIndex = signal(0);
  
  // Menu Modal State
  isMenuOpen = signal(false);

  business: Signal<Business | undefined>;
  businessOffers: Signal<Offer[]>;
  businessEvents: Signal<Event[]>;
  isRestaurant: Signal<boolean>;
  isOrganization: Signal<boolean>;
  isGrocery: Signal<boolean>;
  isOpenNow: Signal<boolean | null>;
  galleryImages: Signal<string[]>;
  mapSafeUrl: Signal<SafeResourceUrl | null>;
  menuSafeUrl: Signal<SafeResourceUrl | null>;
  
  actionButtonConfig: Signal<{ label: string, icon: string } | null>;

  constructor() {
    this.modalCtrl = inject(ModalController);
    this.dataService = inject(DataService);
    this.sanitizer = inject(DomSanitizer);
    this.route = inject(ActivatedRoute);
    this.navCtrl = inject(NavController);
    this.toastCtrl = inject(ToastController);
    this.business = computed(() => {
        const id = this.businessIdSignal();
        if (id === undefined) return undefined;
        
        // Search in businesses first
        const biz = this.dataService.getBusinesses()().find(b => b.id === id);
        if (biz) return biz;
    
        // Then restaurants
        const rest = this.dataService.getRestaurants()().find(b => b.id === id);
        if (rest) return rest;

        // Then organizations
        const org = this.dataService.getOrganizations()().find(b => b.id === id);
        if (org) return org;

        // Finally groceries
        return this.dataService.getGroceries()().find(b => b.id === id);
    });

    this.businessOffers = computed(() => {
        const bizId = this.businessIdSignal();
        if (!bizId) return [];
        return this.dataService.getOffers()().filter(o => o.businessId === bizId || o.targetId === bizId);
    });

    this.businessEvents = computed(() => {
        const bizId = this.businessIdSignal();
        if (!bizId) return [];
        return this.dataService.getEvents()().filter(e => e.organizerId === bizId);
    });

    this.isRestaurant = computed(() => {
        const id = this.businessIdSignal();
        if (!id) return false;
        return this.dataService.getRestaurants()().some(r => r.id === id);
    });

    this.isOrganization = computed(() => {
        const id = this.businessIdSignal();
        if (!id) return false;
        return this.dataService.getOrganizations()().some(o => o.id === id);
    });

    this.isGrocery = computed(() => {
        const id = this.businessIdSignal();
        if (!id) return false;
        return this.dataService.getGroceries()().some(g => g.id === id);
    });

    this.isOpenNow = computed(() => {
        const biz = this.business();
        if (!biz || !biz.openingHours || biz.openingHours.length === 0) return null;
    
        const now = new Date();
        const currentDay = now.toLocaleString('en-US', { weekday: 'short' }); 
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTimeVal = currentHour * 60 + currentMin;
    
        const dayMap: { [key: string]: number } = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
        
        const parseTime = (timeStr: string): number | null => {
            try {
                if (!timeStr) return null;
                const [t, mer] = timeStr.trim().split(' ');
                if (!t || !mer) return null;
                let [h, m] = t.split(':').map(Number);
                if (mer.toUpperCase() === 'PM' && h !== 12) h += 12;
                if (mer.toUpperCase() === 'AM' && h === 12) h = 0;
                return h * 60 + m;
            } catch { return null; }
        };
    
        for (const rule of biz.openingHours) {
            if (!rule || !rule.time) continue;
    
            let appliesToday = false;
            
            const ruleDays = rule.days || '';
            const ruleTimeLower = (rule.time || '').toLowerCase();
    
            if (ruleDays.includes('-')) {
                const parts = ruleDays.split('-');
                if (parts.length >= 2) {
                    const startDay = parts[0].trim();
                    const endDay = parts[1].trim();
                    const startIdx = dayMap[startDay];
                    const endIdx = dayMap[endDay];
                    const currentIdx = dayMap[currentDay];
                    
                    if (startIdx && endIdx && currentIdx) {
                       if (endIdx >= startIdx) {
                           if (currentIdx >= startIdx && currentIdx <= endIdx) appliesToday = true;
                       } else {
                           if (currentIdx >= startIdx || currentIdx <= endIdx) appliesToday = true;
                       }
                    }
                }
            } else if (ruleDays.includes(currentDay)) {
                appliesToday = true;
            }
    
            if (appliesToday) {
                if (ruleTimeLower === 'closed') return false;
                if (ruleTimeLower === '24 hours') return true;
    
                const parts = rule.time.split('-');
                if (parts.length === 2) {
                    const startVal = parseTime(parts[0]);
                    const endVal = parseTime(parts[1]);
                    
                    if (startVal !== null && endVal !== null) {
                        if (endVal < startVal) {
                            if (currentTimeVal >= startVal || currentTimeVal <= endVal) return true;
                        } else {
                            if (currentTimeVal >= startVal && currentTimeVal <= endVal) return true;
                        }
                    }
                }
            }
        }
        return false;
    });

    this.galleryImages = computed(() => {
        const biz = this.business();
        if (!biz || !biz.gallery) return [];
        return biz.gallery;
    });

    this.mapSafeUrl = computed(() => {
        const biz = this.business();
        if (biz && biz.location) {
          const query = encodeURIComponent(biz.location);
          const url = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
          return this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
        return null;
    });

    this.menuSafeUrl = computed(() => {
        const biz = this.business();
        if (biz && biz.menuUrl) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(biz.menuUrl);
        }
        return null;
    });

    this.actionButtonConfig = computed(() => {
        const biz = this.business();
        if (!biz) return null;

        let defaultLabel = 'Contact Business';
        if (this.isRestaurant()) defaultLabel = 'Contact Restaurant';
        if (this.isOrganization()) defaultLabel = 'Contact Association';
        if (this.isGrocery()) defaultLabel = 'Contact Grocery';

        const label = biz.actionLabel || defaultLabel;
        
        let icon = 'call';
        if (biz.actionType === 'url') icon = 'globe-outline';
        if (biz.actionType === 'email') icon = 'mail-outline';
        if (biz.actionType === 'whatsapp') icon = 'logo-whatsapp';
        
        return { label, icon };
    });
  }

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
       this.isRouteDriven = true;
       this.businessIdSignal.set(routeId);
    } else {
       this.businessIdSignal.set(this.businessId);
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
    const biz = this.business();
    if (biz && biz.location) {
        const query = encodeURIComponent(biz.location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_system');
    }
  }
  
  openMenu() {
    const biz = this.business();
    if (biz && biz.menuUrl) {
       this.isMenuOpen.set(true);
    }
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  async handleAction() {
    const biz = this.business();
    if (!biz) return;

    if (biz.actionType && biz.actionTarget) {
        const type = biz.actionType;
        const target = biz.actionTarget;

        if (type === 'url') {
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
        // Fallback or explicit no-action toast
        const toast = await this.toastCtrl.create({
            message: 'No contact action available for this business.',
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

  startOfferDrag(e: MouseEvent) {
    this.isOfferDown = true;
    this.isOfferDragging = false;
    const slider = this.offerContainer()?.nativeElement;
    if (slider) {
      this.startOfferX = e.pageX - slider.offsetLeft;
      this.scrollOfferLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endOfferDrag() {
    if (!this.isOfferDown) return;
    this.isOfferDown = false; 
    const slider = this.offerContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doOfferDrag(e: MouseEvent) {
    if (!this.isOfferDown) return;
    e.preventDefault();
    const slider = this.offerContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startOfferX) * 2;
      slider.scrollLeft = this.scrollOfferLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isOfferDragging = true;
      }
    }
  }

  startEventDrag(e: MouseEvent) {
    this.isEventDown = true;
    this.isEventDragging = false;
    const slider = this.eventContainer()?.nativeElement;
    if (slider) {
      this.startEventX = e.pageX - slider.offsetLeft;
      this.scrollEventLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endEventDrag() {
    if (!this.isEventDown) return;
    this.isEventDown = false;
    const slider = this.eventContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doEventDrag(e: MouseEvent) {
    if (!this.isEventDown) return;
    e.preventDefault();
    const slider = this.eventContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startEventX) * 2;
      slider.scrollLeft = this.scrollEventLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isEventDragging = true;
      }
    }
  }

  async handleOfferClick(offer: Offer) {
    if (this.isOfferDragging) {
        this.isOfferDragging = false;
        return;
    }

    const offerArticle: NewsArticle = {
      id: offer.id,
      title: offer.title,
      source: offer.targetName,
      date: offer.expiryDate,
      imageUrl: offer.image,
      description: offer.discount,
      content: `
        <div class="space-y-4">
           <p class="text-base text-gray-600 leading-relaxed">${offer.description || 'No additional details available.'}</p>
           
           <div class="flex items-center gap-2 mt-4 text-sm font-medium text-gray-500">
              <ion-icon name="time-outline" class="text-lg"></ion-icon>
              <span>Expires: ${offer.expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
        </div>
      `,
      category: 'Special Offer'
    };

    const actionType: 'share' | 'external' | 'internal' | 'close' = 'close';
    const actionLabel = 'Back to Page';
    const actionIcon = 'arrow-back';
    const targetUrl = '';
    const targetType: any = undefined;

    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleData: offerArticle,
        actionType: actionType,
        actionLabel: actionLabel,
        actionIcon: actionIcon,
        targetUrl: targetUrl,
        targetType: targetType
      }
    });
    await modal.present();
  }

  async handleEventClick(event: Event) {
    if (this.isEventDragging) {
        this.isEventDragging = false;
        return;
    }
    const modal = await this.modalCtrl.create({
      component: EventDetailComponent,
      componentProps: { eventId: event.id }
    });
    await modal.present();
  }

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
}
