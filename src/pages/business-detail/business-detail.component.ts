import { Component, ChangeDetectionStrategy, computed, signal, OnInit, Input, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class BusinessDetailComponent implements OnInit {
  // Use constructor injection
  constructor(
    private modalCtrl: ModalController,
    private dataService: DataService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  @Input() businessId!: string;
  private readonly businessIdSignal = signal<string | undefined>(undefined);
  private isRouteDriven = false;

  galleryContainer = viewChild<ElementRef>('galleryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  isLightboxOpen = signal(false);
  activeLightboxIndex = signal(0);

  business = computed(() => {
    const id = this.businessIdSignal();
    if (id === undefined) return undefined;
    
    const biz = this.dataService.getBusinesses()().find(b => b.id === id);
    if (biz) return biz;

    return this.dataService.getRestaurants()().find(b => b.id === id);
  });

  isOpenNow = computed(() => {
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

  galleryImages = computed(() => {
    const biz = this.business();
    if (!biz || !biz.gallery) return [];
    return biz.gallery;
  });

  mapSafeUrl = computed(() => {
    const biz = this.business();
    if (biz && biz.location) {
      const query = encodeURIComponent(biz.location);
      const url = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  });

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
        window.open(biz.menuUrl, '_system');
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

  nextImage(e?: Event) {
    e?.stopPropagation();
    const current = this.activeLightboxIndex();
    const total = this.galleryImages().length;
    this.activeLightboxIndex.set((current + 1) % total);
  }

  prevImage(e?: Event) {
    e?.stopPropagation();
    const current = this.activeLightboxIndex();
    const total = this.galleryImages().length;
    this.activeLightboxIndex.set((current - 1 + total) % total);
  }
}