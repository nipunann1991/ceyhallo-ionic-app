import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Business } from '../../models/business.model';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { BusinessCardComponent } from '../../components/business-card/business-card.component';
import { FeaturedBannerComponent } from '../../components/featured-banner/featured-banner.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, BusinessCardComponent, FeaturedBannerComponent, PageHeaderComponent],
})
export class RestaurantsComponent implements OnInit {
  private dataService = inject(DataService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);

  // This public property is set by Ionic's ModalController via componentProps if opened as modal
  public isModal = false;
  readonly isModalSignal = signal(false);

  // Data Source
  allRestaurants = this.dataService.getRestaurants();
  countries = this.dataService.getCountries();
  selectedCountryId = this.dataService.selectedCountryId;

  // Component State
  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10); // Pagination limit: 10 per page

  // Computed: Get cities only for the selected country
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

  // Computed: Restaurants filtered by Country (Used as base for other filters)
  countryRestaurants = computed(() => {
    const list = this.allRestaurants();
    const cid = this.selectedCountryId();
    const country = this.countries().find(c => c.id === cid);
    
    // If no country found, return empty or safe default. 
    // Here we strictly show only if matches country cities.
    if (!country) return [];

    const cityNames = country.cities.map(c => (c.name || '').toLowerCase());
    
    return list.filter(r => {
       const loc = (r.location || '').toLowerCase();
       // Check if restaurant location contains any city from the selected country
       return cityNames.some(city => loc.includes(city));
    });
  });

  // Computed: Single Featured Restaurant for the FeaturedBanner
  featuredRestaurant = computed<Business | null>(() => {
    const list = this.countryRestaurants();
    if (list.length === 0) return null;
    
    // 1. Look for promoted
    const promoted = list.filter(r => r.isPromoted);
    if (promoted.length > 0) return promoted[0];

    // 2. Fallback to highest rated
    return [...list].sort((a, b) => b.rating - a.rating)[0];
  });

  // Computed: Final Filtered List for Display
  filteredRestaurants = computed(() => {
    let list = [...this.countryRestaurants()]; // Clone
    const cat = this.selectedCategory();
    const term = (this.searchTerm() || '').toLowerCase();
    
    // 1. Filter by Location Category (City Chip)
    if (cat !== 'All') {
      list = list.filter(r => (r.location || '').toLowerCase().includes(cat.toLowerCase()));
    }

    // 2. Filter by Search
    if (term) {
      list = list.filter(r => (r.name || '').toLowerCase().includes(term) || (r.category || '').toLowerCase().includes(term));
    }

    // 3. Sort: Featured First, then by Rating
    list.sort((a, b) => {
        // Promoted comes first
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        
        // Then sort by rating (highest first)
        return b.rating - a.rating;
    });

    return list;
  });

  // Computed: Displayed Restaurants (Paginated)
  displayedRestaurants = computed(() => {
    return this.filteredRestaurants().slice(0, this.limit());
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
    this.limit.set(10); // Reset pagination
  }

  handleImgError = handleImageError;

  goBack() {
    if (this.isModalSignal()) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.back();
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async openRestaurant(business: Business) {
    await this.openBusinessDetail(business.id);
  }

  async openBusinessDetail(businessId: string) {
    const modal = await this.modalCtrl.create({
      component: BusinessDetailComponent,
      componentProps: {
        businessId: businessId,
      },
    });
    await modal.present();
  }

  onIonInfinite(ev: any) {
    const infiniteScroll = ev as InfiniteScrollCustomEvent;
    
    // Simulate network delay for better UX
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
      const walk = (x - this.startX) * 2; // Scroll speed
      slider.scrollLeft = this.scrollLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isDragging = true;
      }
    }
  }
}