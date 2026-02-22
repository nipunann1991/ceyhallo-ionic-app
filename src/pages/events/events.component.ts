
import { Component, ChangeDetectionStrategy, OnInit, signal, computed, viewChild, ElementRef, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Event } from '../../models/event.model';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { Banner } from '../../models/banner.model';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-events',
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]">
  
  <app-page-header 
    title="Events" 
    searchPlaceholder="Search by name, location..."
    [searchValue]="searchTerm()"
    [isModal]="isModalSignal()"
    (searchChange)="handleSearch($event)"
    (back)="goBack()">
  </app-page-header>

  <div class="px-5 pb-8">

    <!-- Featured Banners (Swipeable) -->
    @if (selectedCategory() === 'All' && searchTerm() === '') {
      <div class="mb-6">
        <app-banner 
           [banners]="featuredBanners()" 
           (bannerClick)="handleBannerClick($event)">
        </app-banner>
      </div>
    }

    <!-- Category Filter Chips (Cities) -->
    <div 
      #categoryContainer
      class="flex overflow-x-auto gap-2.5 pb-2 mb-4 scrollbar-hide -mx-5 px-5 snap-x select-none cursor-grab active:cursor-grabbing"
      (mousedown)="startDrag($event)"
      (mouseleave)="endDrag()"
      (mouseup)="endDrag()"
      (mousemove)="doDrag($event)">
      @for (cat of categories(); track cat) {
        <button 
          (click)="setCategory(cat)"
          class="px-4 py-[0.5rem] text-[0.8rem] font-bold rounded-full whitespace-nowrap transition-colors duration-200 border"
          [class.bg-[#083594]]="selectedCategory() === cat.code"
          [class.text-white]="selectedCategory() === cat.code"
          [class.border-transparent]="selectedCategory() === cat.code"
          [class.bg-white]="selectedCategory() !== cat.code"
          [class.text-[#1A1C1E]]="selectedCategory() !== cat.code"
          [class.border-gray-200]="selectedCategory() !== cat.code"
          [class.hover:bg-gray-50]="selectedCategory() !== cat.code"
          [class.shadow-sm]="selectedCategory() !== cat.code">
          {{ cat.name }}
        </button>
      }
    </div>

    <!-- Events List -->
    <div class="flex flex-col gap-3.5">
      @if (upcomingEvents().length > 0) {
        @for (item of upcomingEvents(); track item.id) {
          <app-event-card 
             [event]="item"
             (click)="openEvent(item)">
          </app-event-card>
        }
      }

      @if (pastEvents().length > 0) {
        <!-- Expired Separator -->
        <div class="flex items-center gap-3 my-2">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Expired</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        @for (item of pastEvents(); track item.id) {
          <app-event-card 
             [event]="item"
             class="opacity-50 grayscale"
             (click)="openEvent(item)">
          </app-event-card>
        }
      }

      @if (upcomingEvents().length === 0 && pastEvents().length === 0) {
        <!-- No Results State -->
        <div class="flex items-center justify-center h-[36vh]">
          <div class="text-center text-gray-400">
            <ion-icon name="calendar-outline" class="text-7xl mb-2 text-gray-300"></ion-icon>
            <h1 class="text-xl font-bold mt-2">No Events Found</h1>
            @if (searchTerm()) {
              <p class="text-sm">We couldn't find any events for "{{ searchTerm() }}".</p>
            } @else {
              <p class="text-sm">There are no events in '{{ selectedCategory() }}' right now.</p>
            }
          </div>
        </div>
      }
    </div>



  </div>
</ion-content>
`,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, EventCardComponent, BannerComponent, PageHeaderComponent],
})
export class EventsComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);

  public isModal = false;
  readonly isModalSignal = signal(false);

  allEvents: Signal<Event[]>;
  countries: Signal<Country[]>;
  selectedCountryId: Signal<string>;

  selectedCategory = signal<string>('All');
  searchTerm = signal('');

  categories: Signal<{ code: string; name: string; }[]>;
  countryEvents: Signal<Event[]>;
  featuredBanners: Signal<Banner[]>;
  filteredEvents: Signal<Event[]>;
  upcomingEvents: Signal<Event[]>;
  pastEvents: Signal<Event[]>;

  categoryContainer = viewChild<ElementRef>('categoryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  constructor() {
    this.allEvents = this.dataService.getEvents();
    this.countries = this.dataService.getCountries();
    this.selectedCountryId = this.dataService.selectedCountryId;

    this.categories = computed(() => {
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        const cities = country ? country.cities : [];
        return [{ code: 'All', name: 'All' }, ...cities];
    });

    this.countryEvents = computed(() => {
        const list = this.allEvents();
        const cid = this.selectedCountryId();
        return list.filter(e => e.countryCode?.toUpperCase() === cid.toUpperCase());
    });

    this.featuredBanners = computed(() => {
        const upcomingEvents = this.countryEvents().filter(e => !this.isEventExpired(e));
        let featured = upcomingEvents.filter(e => e.isFeatured);
        
        // Fallback if no featured items found
        if (featured.length === 0 && upcomingEvents.length > 0) {
           featured = upcomingEvents.slice(0, 3);
        }
    
        return featured.map(e => ({
           id: e.id,
           category: e.category,
           title: e.title,
           description: e.location || 'Upcoming Event',
           image: e.imageUrl,
           targetId: e.id,
           targetType: 'event',
           navigationType: 'internal'
        }));
    });

    this.filteredEvents = computed(() => {
        let list = [...this.countryEvents()];
        const cat = this.selectedCategory();
        const term = this.searchTerm().toLowerCase();
        
        if (cat !== 'All') {
          list = list.filter(e => e.cityCode === cat);
        }
    
        if (term) {
          list = list.filter(e => e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term));
        }
        
        list.sort((a, b) => {
            const aIsPast = this.isEventExpired(a);
            const bIsPast = this.isEventExpired(b);

            // 1. Group by upcoming/past: upcoming first
            if (!aIsPast && bIsPast) return -1;
            if (aIsPast && !bIsPast) return 1;

            // Within the same group (both upcoming or both past)
            // 2. Prioritize featured events
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;

            // 3. Sort by date
            if (!aIsPast) {
                // Both are upcoming, sort ascending (soonest first)
                return a.date.getTime() - b.date.getTime();
            } else {
                // Both are past, sort descending (most recent past first)
                return b.date.getTime() - a.date.getTime();
            }
        });
    
        return list;
    });

    this.upcomingEvents = computed(() => {
        return this.filteredEvents().filter(e => !this.isEventExpired(e));
    });

    this.pastEvents = computed(() => {
        return this.filteredEvents().filter(e => this.isEventExpired(e));
    });
  }

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
  }

  isEventExpired(event: Event): boolean {
    return new Date(event.date) < new Date();
  }

  setCategory(cat: { code: string; name: string; }) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.selectedCategory.set(cat.code);
  }

  handleSearch(value: string) {
    this.searchTerm.set(value);
  }

  handleImgError = handleImageError;

  goBack() {
    if (this.isModalSignal()) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.back();
    }
  }

  async openEvent(event: Event) {
    await this.openEventDetail(event.id);
  }

  async handleBannerClick(banner: Banner) {
    if (banner.targetId) {
        await this.openEventDetail(banner.targetId);
    }
  }

  async openEventDetail(id: string) {
    if (!this.authService.isLoggedIn()) {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: { isModal: true }
      });
      await modal.present();
      return;
    }

    const modal = await this.modalCtrl.create({
      component: EventDetailComponent,
      componentProps: {
        eventId: id,
      },
    });
    await modal.present();
  }


  
  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    const slider = this.categoryContainer()?.nativeElement;
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
    const slider = this.categoryContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX) * 2;
      slider.scrollLeft = this.scrollLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isDragging = true;
      }
    }
  }
}
