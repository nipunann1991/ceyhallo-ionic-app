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
  selector: 'app-businesses',
  templateUrl: './businesses.component.html',
  styleUrls: ['./businesses.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, BusinessCardComponent, FeaturedBannerComponent, PageHeaderComponent],
})
export class BusinessesComponent implements OnInit {
  private dataService = inject(DataService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);

  public isModal = false;
  readonly isModalSignal = signal(false);

  // Data Source
  allBusinesses = this.dataService.getBusinesses();
  countries = this.dataService.getCountries();
  selectedCountryId = this.dataService.selectedCountryId;

  // Component State
  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10);

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

  // Computed: Businesses filtered by selected country
  countryBusinesses = computed(() => {
    const list = this.allBusinesses();
    const cid = this.selectedCountryId();
    const country = this.countries().find(c => c.id === cid);
    
    if (!country) return [];

    const cityNames = country.cities.map(c => (c.name || '').toLowerCase());
    
    return list.filter(r => {
       const loc = (r.location || '').toLowerCase();
       return cityNames.some(city => loc.includes(city));
    });
  });

  // Computed: Single Featured Business for the Banner
  featuredBusiness = computed<Business | null>(() => {
    const list = this.countryBusinesses();
    if (list.length === 0) return null;
    
    const promoted = list.filter(r => r.isPromoted);
    if (promoted.length > 0) return promoted[0];

    return [...list].sort((a, b) => b.rating - a.rating)[0];
  });

  // Computed: Final Filtered List
  filteredBusinesses = computed(() => {
    let list = [...this.countryBusinesses()];
    const cat = this.selectedCategory();
    const term = (this.searchTerm() || '').toLowerCase();
    
    if (cat !== 'All') {
      list = list.filter(r => (r.location || '').toLowerCase().includes(cat.toLowerCase()));
    }

    if (term) {
      list = list.filter(r => (r.name || '').toLowerCase().includes(term) || (r.category || '').toLowerCase().includes(term));
    }

    list.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return b.rating - a.rating;
    });

    return list;
  });

  // Computed: Displayed Businesses (Paginated)
  displayedBusinesses = computed(() => {
    return this.filteredBusinesses().slice(0, this.limit());
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

  async openBusiness(business: Business) {
    const modal = await this.modalCtrl.create({
      component: BusinessDetailComponent,
      componentProps: {
        businessId: business.id,
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