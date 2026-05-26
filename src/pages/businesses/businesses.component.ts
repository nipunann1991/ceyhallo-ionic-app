
import { Component, ChangeDetectionStrategy, OnInit, signal, computed, viewChild, ElementRef, Signal, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Business } from '../../models/business.model';
import { Offer } from '../../models/offer.model';
import { NewsArticle } from '../../models/news.model';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { BusinessCardComponent } from '../../components/business-card/business-card.component';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';
import { Country } from '../../models/country.model';
import { BusinessLocation } from '../../models/business.model';

@Component({
  selector: 'app-businesses',
  templateUrl: './businesses.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, BusinessCardComponent, OfferCardComponent, PageHeaderComponent],
})
export class BusinessesComponent implements OnInit {
  @Input() isModal = false;
  private queryParams: Signal<Record<string, string>>;
  filterBy: Signal<string[]>;
  excludeBy: Signal<string[]>;
  readonly isModalSignal = signal(false);

  allBusinesses: Signal<Business[]>;
  offers: Signal<Offer[]>;
  countries: Signal<Country[]>;
  selectedCountryId: Signal<string>;

  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10);

  // Custom Title Logic
  pageTitle: string;

  categories: Signal<string[]>;
  countryBusinesses: Signal<Business[]>;
  sectionOffers: Signal<Offer[]>;
  otherOffers: Signal<Offer[]>;
  filteredBusinesses: Signal<Business[]>;
  displayedBusinesses: Signal<Business[]>;

  categoryContainer = viewChild<ElementRef>('categoryContainer');
  sectionOfferContainer = viewChild<ElementRef>('sectionOfferContainer');
  offerContainer = viewChild<ElementRef>('offerContainer');
  
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  private isSectionDown = false;
  private startSectionX = 0;
  private scrollSectionLeft = 0;
  public isSectionDragging = false;

  private isOfferDown = false;
  private startOfferX = 0;
  private scrollOfferLeft = 0;
  public isOfferDragging = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {
    this.queryParams = toSignal(this.route.queryParams, { initialValue: {} });

    this.filterBy = computed(() => {
        const params = this.queryParams();
        if (params && params['filterBy']) {
            return params['filterBy'].split(',').map((c: string) => c.trim().toLowerCase());
        }
        return [];
    });

    this.excludeBy = computed(() => {
        const params = this.queryParams();
        if (params && params['excludeBy']) {
            return params['excludeBy'].split(',').map((c: string) => c.trim().toLowerCase());
        }
        return [];
    });

    this.allBusinesses = this.dataService.getBusinesses();
    this.offers = this.dataService.getOffers();
    this.countries = this.dataService.getCountries();
    this.selectedCountryId = this.dataService.selectedCountryId;

    this.categories = computed(() => {
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        const cities = country ? country.cities.map(c => c.name) : [];
        return ['All', ...cities];
    });

    this.countryBusinesses = computed(() => {
        const list = this.allBusinesses();
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        if (!country) return [];

        return list.filter((business) => this.businessMatchesCountry(business, country));
    });

    this.sectionOffers = computed(() => {
        let offers = this.offers().filter(o => o.isSectionBanner && o.linkType === 'businesses');
        const filterCategories = this.filterBy();
        
        if (filterCategories.length > 0) {
            offers = offers.filter(o => {
                if (!o.categories || o.categories.length === 0) return false;
                const offerCats = o.categories.map(c => c.toLowerCase());
                return filterCategories.some(fc => offerCats.includes(fc));
            });
        }
        return offers;
    });

    this.otherOffers = computed(() => {
        // Get IDs from the *filtered* section offers to avoid duplicates if they overlap
        const sectionIds = new Set(this.sectionOffers().map(o => o.id));
        const bizIds = new Set(this.allBusinesses().map(b => b.id));
        
        let offers = this.offers().filter(o => 
          o.businessId && 
          bizIds.has(o.businessId) &&
          !sectionIds.has(o.id)
        );

        const filterCategories = this.filterBy();
        if (filterCategories.length > 0) {
            offers = offers.filter(o => {
                if (!o.categories || o.categories.length === 0) return false;
                const offerCats = o.categories.map(c => c.toLowerCase());
                return filterCategories.some(fc => offerCats.includes(fc));
            });
        }
        
        return offers;
    });

    this.filteredBusinesses = computed(() => {
        let list = [...this.countryBusinesses()];
        const cat = this.selectedCategory();
        const term = (this.searchTerm() || '').toLowerCase();
        const filterCategories = this.filterBy();
        const excludeCategories = this.excludeBy();

        if (filterCategories.length > 0) {
            list = list.filter(r => r.category && filterCategories.includes((r.category || '').toLowerCase()));
        }

        if (excludeCategories.length > 0) {
            list = list.filter(r => !r.category || !excludeCategories.includes((r.category || '').toLowerCase()));
        }
        
        if (cat !== 'All') {
          list = list.filter((business) => this.businessMatchesCityCategory(business, cat));
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



    this.displayedBusinesses = computed(() => {
        return this.filteredBusinesses().slice(0, this.limit());
    });
  }

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
    this.route.queryParams.subscribe(params => {
      const filterByParam = params['filterBy'];
      if (filterByParam) {
          this.pageTitle = this.capitalizeFirstLetter(filterByParam);
      } else { 
          this.pageTitle = 'Businesses';
      } 
    });
  }

  setCategory(cat: string) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.selectedCategory.set(cat);
    this.limit.set(10);
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private getBusinessLocations(business: Business): BusinessLocation[] {
    return business.locations ?? [];
  }

  private businessMatchesCountry(business: Business, country: Country): boolean {
    const selectedCountryCode = (country.id || '').trim().toUpperCase();
    if (!selectedCountryCode) {
      return true;
    }

    if ((business.countryCode || '').trim().toUpperCase() === selectedCountryCode) {
      return true;
    }

    return this.getBusinessLocations(business).some((location) =>
      (location.countryCode || '').trim().toUpperCase() === selectedCountryCode
    );
  }

  private businessMatchesCityCategory(business: Business, cityName: string): boolean {
    const normalizedCityName = (cityName || '').trim().toLowerCase();
    if (!normalizedCityName || normalizedCityName === 'all') {
      return true;
    }

    const selectedCountryCode = (this.selectedCountryId() || '').trim().toUpperCase();
    const country = this.countries().find((item) => (item.id || '').trim().toUpperCase() === selectedCountryCode);
    const matchedCity = country?.cities.find((city) => (city.name || '').trim().toLowerCase() === normalizedCityName);

    if (!matchedCity) {
      return (business.location || '').toLowerCase().includes(normalizedCityName);
    }

    const cityCode = (matchedCity.code || '').trim().toUpperCase();
    if (!cityCode) {
      return false;
    }

    if ((business.cityCode || '').trim().toUpperCase() === cityCode) {
      return true;
    }

    return this.getBusinessLocations(business).some((location) =>
      (location.cityCode || '').trim().toUpperCase() === cityCode
    );
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
    await this.openBusinessDetail(business.id);
  }

  async handleOfferClick(offer: Offer, isSection: boolean = false) {
    const isDragging = isSection ? this.isSectionDragging : this.isOfferDragging;
    
    if (isDragging) {
        if (isSection) this.isSectionDragging = false;
        else this.isOfferDragging = false;
        return;
    }
    
    if (!this.authService.isLoggedIn()) {
        const modal = await this.modalCtrl.create({
          component: LoginComponent,
          componentProps: { isModal: true }
        });
        await modal.present();
        return;
    }

    const isNoLinkOffer = (offer.linkType || '').toLowerCase() === 'none';
    const expiryLabel = offer.endDate
      ? offer.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No end date';

    const offerArticle: NewsArticle = {
      id: offer.id,
      title: offer.title,
      source: isNoLinkOffer ? (offer.offerBy || offer.targetName) : offer.targetName,
      date: offer.endDate || offer.expiryDate,
      imageUrl: offer.image,
      description: offer.discount,
      content: `
        <div class="space-y-4">
           <p class="text-base text-gray-600 leading-relaxed">${offer.content || offer.description || 'No additional details available.'}</p>
           
           <div class="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><span class="font-bold text-gray-700">Expires on:</span> ${expiryLabel}</span>
           </div>
        </div>
      `,
      category: 'Special Offer'
    };

    // For Businesses Page, the action is simply 'Back to Page' (Close)
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

  async openBusinessDetail(businessId: string) {
    if (!this.authService.isLoggedIn()) {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: { isModal: true }
      });
      await modal.present();
      return;
    }

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
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }
  endDrag() { 
    if (!this.isDown) return;
    this.isDown = false;
    const slider = this.categoryContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }
  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.categoryContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX) * 2;
      slider.scrollLeft = this.scrollLeft - walk;
      if (Math.abs(walk) > 5) this.isDragging = true;
    }
  }

  startSectionDrag(e: MouseEvent) {
    if (this.sectionOffers().length <= 1) return;
    this.isSectionDown = true;
    this.isSectionDragging = false;
    const slider = this.sectionOfferContainer()?.nativeElement;
    if (slider) {
      this.startSectionX = e.pageX - slider.offsetLeft;
      this.scrollSectionLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }
  endSectionDrag() { 
    if (!this.isSectionDown) return;
    this.isSectionDown = false;
    const slider = this.sectionOfferContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }
  doSectionDrag(e: MouseEvent) {
    if (!this.isSectionDown) return;
    e.preventDefault();
    const slider = this.sectionOfferContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startSectionX) * 2;
      slider.scrollLeft = this.scrollSectionLeft - walk;
      if (Math.abs(walk) > 5) this.isSectionDragging = true;
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
      if (Math.abs(walk) > 5) this.isOfferDragging = true;
    }
  }
}
