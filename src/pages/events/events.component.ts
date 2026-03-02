
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
  templateUrl: './events.component.html',
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
        return list.filter(e => e.countryCode?.toUpperCase() === cid.toUpperCase() && !e.isArchived);
    });

    this.featuredBanners = computed(() => {
        const upcomingEvents = this.countryEvents().filter(e => !this.isEventExpired(e));
        const featured = upcomingEvents.filter(e => e.isFeatured);
    
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
    return event.isExpired === true;
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
