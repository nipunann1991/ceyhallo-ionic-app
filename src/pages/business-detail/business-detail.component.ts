import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class BusinessDetailComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private dataService = inject(DataService);
  private sanitizer = inject(DomSanitizer);

  public businessId!: string;
  private readonly businessIdSignal = signal<string | undefined>(undefined);

  // Lightbox State
  isLightboxOpen = signal(false);
  activeLightboxIndex = signal(0);

  business = computed(() => {
    const id = this.businessIdSignal();
    if (id === undefined) return undefined;
    
    // First check general businesses
    const biz = this.dataService.getBusinesses()().find(b => b.id === id);
    if (biz) return biz;

    // If not found, check featured restaurants
    return this.dataService.getRestaurants()().find(b => b.id === id);
  });

  // Calculate if the business is currently open
  isOpenNow = computed(() => {
    const biz = this.business();
    if (!biz || !biz.openingHours || biz.openingHours.length === 0) return null; // Unknown

    const now = new Date();
    // Get short day name (Mon, Tue, Wed...)
    const currentDay = now.toLocaleString('en-US', { weekday: 'short' }); 
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    // Mapping for range expansion (Mon-Sun)
    const dayMap: { [key: string]: number } = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
    
    // Helper to parse "09:00 AM" to minutes
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

    // Find the matching rule for today
    for (const rule of biz.openingHours) {
        if (!rule || !rule.time) continue;

        let appliesToday = false;
        
        // Safe check for days
        const ruleDays = rule.days || '';
        const ruleTimeLower = (rule.time || '').toLowerCase();

        if (ruleTimeLower.includes('closed')) {
           // Logic handled inside range check usually
        }

        if (ruleDays.includes('-')) {
            // Range: "Mon - Fri"
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
                       // Wrap around (e.g. Fri - Mon)
                       if (currentIdx >= startIdx || currentIdx <= endIdx) appliesToday = true;
                   }
                }
            }
        } else if (ruleDays.includes(currentDay)) {
            // Single day or comma separated "Mon, Wed"
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
                    // Handle overnight (e.g. 6PM - 2AM)
                    if (endVal < startVal) {
                        // Open if time > start OR time < end
                        if (currentTimeVal >= startVal || currentTimeVal <= endVal) return true;
                    } else {
                        // Standard day
                        if (currentTimeVal >= startVal && currentTimeVal <= endVal) return true;
                    }
                }
            }
        }
    }
    
    // If we found rules but none matched "Open" for current time, assume closed
    return false;
  });

  // Get gallery images from data only
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
    this.businessIdSignal.set(this.businessId);
  }

  handleImgError = handleImageError;

  close() {
    this.modalCtrl.dismiss();
  }

  openMap() {
    const biz = this.business();
    if (biz && biz.location) {
        const query = encodeURIComponent(biz.location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_system');
    }
  }

  // Lightbox Methods
  openLightbox(index: number) {
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