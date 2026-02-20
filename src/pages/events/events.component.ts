
import { Component, ChangeDetectionStrategy, OnInit, signal, computed, viewChild, ElementRef, Signal } from '@angular/core';
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
          [class.bg-[#083594]]="selectedCategory() === cat"
          [class.text-white]="selectedCategory() === cat"
          [class.border-transparent]="selectedCategory() === cat"
          [class.bg-white]="selectedCategory() !== cat"
          [class.text-[#1A1C1E]]="selectedCategory() !== cat"
          [class.border-gray-200]="selectedCategory() !== cat"
          [class.hover:bg-gray-50]="selectedCategory() !== cat"
          [class.shadow-sm]="selectedCategory() !== cat">
          {{ cat }}
        </button>
      }
    </div>

    <!-- Events List -->
    <div class="flex flex-col gap-3.5">
      @if (displayedEvents().length > 0) {
        @for (item of displayedEvents(); track item.id) {
          <app-event-card 
             [event]="item"
             (click)="openEvent(item)">
          </app-event-card>
        }
      } @else {
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

    <!-- Infinite Scroll -->
    <ion-infinite-scroll (ionInfinite)="onIonInfinite($event)" [disabled]="displayedEvents().length >= filteredEvents().length">
       <ion-infinite-scroll-content loadingSpinner="bubbles" loadingText="Loading more events..."></ion-infinite-scroll-content>
    </ion-infinite-scroll>

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
  public isModal = false;
  readonly isModalSignal = signal(false);

  allEvents: Signal<Event[]>;
  countries: Signal<Country[]>;
  selectedCountryId: Signal<string>;

  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10);

  categories: Signal<string[]>;
  countryEvents: Signal<Event[]>;
  featuredBanners: Signal<Banner[]>;
  filteredEvents: Signal<Event[]>;
  displayedEvents: Signal<Event[]>;

  categoryContainer = viewChild<ElementRef>('categoryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.allEvents = this.dataService.getEvents();
    this.countries = this.dataService.getCountries();
    this.selectedCountryId = this.dataService.selectedCountryId;

    this.categories = computed(() => {
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        const cities = country ? country.cities.map(c => c.name) : [];
        return ['All', ...cities];
    });

    this.countryEvents = computed(() => {
        const list = this.allEvents();
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        // Relaxed constraint: If no country/cities found, return all events (Fallback)
        if (!country || !country.cities || country.cities.length === 0) return list;

        const cityNames = country.cities.map(c => c.name.toLowerCase());
        
        return list.filter(e => {
           // Debug IFTAR specifically
           const isIftar = e.title && (e.title.includes('IFTAR') || e.title.includes('Iftar'));

           // 1. Precise Match via Country Code
           if (e.countryCode) {
               // Normalize logic: e.g. "AE" vs "ae"
               const match = e.countryCode.toUpperCase() === cid.toUpperCase();
               if (isIftar && !match) console.log(`Iftar filtered out by countryCode: ${e.countryCode} !== ${cid}`);
               if (match) return true;
           }

           const loc = (e.location || '').toLowerCase();
           
           // 2. Fallback text matching
           // Allow if location includes a city name OR if location includes the country name
           const match = cityNames.some(city => loc.includes(city)) || loc.includes(country.name.toLowerCase());
           
           if (isIftar && !match && !e.countryCode) {
               console.log(`Iftar filtered out by location text: '${loc}' not found in cities or '${country.name}'. Cities: ${cityNames.join(', ')}`);
           }
           
           return match;
        });
    });

    this.featuredBanners = computed(() => {
        const list = this.countryEvents();
        let featured = list.filter(e => e.isFeatured);
        
        // Fallback if no featured items found
        if (featured.length === 0 && list.length > 0) {
           featured = list.slice(0, 3);
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
          list = list.filter(e => (e.location || '').toLowerCase().includes(cat.toLowerCase()));
        }
    
        if (term) {
          list = list.filter(e => e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term));
        }
        
        list.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return a.date.getTime() - b.date.getTime();
        });
    
        return list;
    });

    this.displayedEvents = computed(() => {
        return this.filteredEvents().slice(0, this.limit());
    });
  }

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
  }

  setCategory(cat: string) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.selectedCategory.set(cat);
    this.limit.set(10);
  }

  handleSearch(value: string) {
    this.searchTerm.set(value);
    this.limit.set(10);
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

  onIonInfinite(ev: any) {
    const infiniteScroll = ev as InfiniteScrollCustomEvent;
    setTimeout(() => {
      this.limit.update(currentLimit => currentLimit + 10);
      infiniteScroll.target.complete();
    }, 500);
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
