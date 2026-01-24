import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Event } from '../../models/event.model';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { FeaturedBannerComponent } from '../../components/featured-banner/featured-banner.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, EventCardComponent, FeaturedBannerComponent, PageHeaderComponent],
})
export class EventsComponent implements OnInit {
  private dataService = inject(DataService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);

  // This public property is set by Ionic's ModalController via componentProps if opened as modal
  public isModal = false;
  readonly isModalSignal = signal(false);

  // Data Source
  allEvents = this.dataService.getEvents();
  countries = this.dataService.getCountries();
  selectedCountryId = this.dataService.selectedCountryId;

  // Component State
  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10); // Pagination limit

  // Computed: Get cities for filter chips
  categories = computed(() => {
    const cid = this.selectedCountryId();
    const country = this.countries().find(c => c.id === cid);
    const cities = country ? country.cities.map(c => c.name) : [];
    
    return ['All', ...cities];
  });
  
  // Drag Scroll Logic
  categoryContainer = viewChild<ElementRef>('categoryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;
  
  // Computed: Events filtered by Country
  countryEvents = computed(() => {
    const list = this.allEvents();
    const cid = this.selectedCountryId();
    const country = this.countries().find(c => c.id === cid);
    
    if (!country) return [];

    const cityNames = country.cities.map(c => c.name.toLowerCase());
    
    return list.filter(e => {
       const loc = (e.location || '').toLowerCase();
       return cityNames.some(city => loc.includes(city));
    });
  });

  // Computed: Single Featured Event for the Banner
  featuredEvent = computed<Event | null>(() => {
    const list = this.countryEvents();
    if (list.length === 0) return null;
    
    const featured = list.find(e => e.isFeatured);
    if (featured) return featured;

    // Fallback to the soonest upcoming event
    return list[0]; // Already sorted by date in DataService
  });

  // Computed: Final Filtered List
  filteredEvents = computed(() => {
    let list = [...this.countryEvents()];
    const cat = this.selectedCategory();
    const term = this.searchTerm().toLowerCase();
    
    if (cat !== 'All') {
      list = list.filter(e => (e.location || '').toLowerCase().includes(cat.toLowerCase()));
    }

    if (term) {
      list = list.filter(e => e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term));
    }
    
    // Sort: Featured First, then by Date
    list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.date.getTime() - b.date.getTime(); // Keep upcoming sort
    });

    return list;
  });

  // Computed: Displayed Events (Paginated)
  displayedEvents = computed(() => {
    return this.filteredEvents().slice(0, this.limit());
  });

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
  }

  setCategory(cat: string) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.selectedCategory.set(cat);
    this.limit.set(10); // Reset pagination
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
    const modal = await this.modalCtrl.create({
      component: EventDetailComponent,
      componentProps: {
        eventId: event.id,
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
  
  // Drag Methods
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