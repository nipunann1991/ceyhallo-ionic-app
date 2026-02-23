
import { Component, ChangeDetectionStrategy, signal, computed, viewChild, ElementRef, OnInit, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { PushNotificationService } from '../../services/push-notifications.service';
import { BannerComponent } from '../../components/banner/banner.component';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { JobDetailComponent } from '../job-detail/job-detail.component';
import { BusinessCardComponent } from '../../components/business-card/business-card.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { JobCardComponent } from '../../components/job-card/job-card.component';
import { handleImageError } from '../../utils/image.utils';
import { Banner } from '../../models/banner.model';
import { NewsArticle } from '../../models/news.model';
import { Offer } from '../../models/offer.model';
import { Event } from '../../models/event.model';
import { Job } from '../../models/job.model';
import { LoginComponent } from '../login/login.component';
import { Country } from '../../models/country.model';
import { Category } from '../../models/category.model';
import { AppConfig, HomeSection } from '../../models/settings.model';
import { Business } from '../../models/business.model';
import { Grocery } from '../../models/grocery.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterLink, BannerComponent, BusinessCardComponent, NewsCardComponent, OfferCardComponent, EventCardComponent, JobCardComponent],
})
export class HomeComponent implements OnInit {
  settings: Signal<AppConfig | null>;
  banners: Signal<Banner[]>;
  categories: Signal<Category[]>;
  countries: Signal<Country[]>;
  news: Signal<NewsArticle[]>;
  offers: Signal<Offer[]>;
  events: Signal<Event[]>;
  jobs: Signal<Job[]>;
  
  private allBusinesses: Signal<Business[]>;
  private allRestaurants: Signal<Business[]>;
  private allGroceries: Signal<Grocery[]>;

  sectionsWithData: Signal<{ section: HomeSection, data: any[] }[]>;
  user: Signal<any>;
  
  // Specific Offer Signals (preserved for reusing logic)
  foodOffers: Signal<Offer[]>;
  businessOffers: Signal<Offer[]>;
  
  featuredRestaurants: Signal<Business[]>;
  generalBusinesses: Signal<Business[]>;
  featuredGroceries: Signal<Grocery[]>;
  currentCountry: Signal<Country | null>;

  selectedCountryId: Signal<string>;
  isCountryModalOpen = signal(false);
  
  // Loading State
  isLoading = signal(true);

  newsContainer = viewChild<ElementRef>('newsContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  public isDragging = false;

  offerContainer = viewChild<ElementRef>('offerContainer');
  private isOfferDown = false;
  private startOfferX = 0;
  private scrollOfferLeft = 0;
  public isOfferDragging = false;

  businessOfferContainer = viewChild<ElementRef>('businessOfferContainer');
  private isBizOfferDown = false;
  private startBizOfferX = 0;
  private scrollBizOfferLeft = 0;
  public isBizOfferDragging = false;

  restaurantContainer = viewChild<ElementRef>('restaurantContainer');
  private isRestaurantDown = false;
  private startRestaurantX = 0;
  private scrollRestaurantLeft = 0;
  public isRestaurantDragging = false;

  businessContainer = viewChild<ElementRef>('businessContainer');
  private isBusinessDown = false;
  private startBusinessX = 0;
  private scrollBusinessLeft = 0;
  public isBusinessDragging = false;

  groceryContainer = viewChild<ElementRef>('groceryContainer');
  private isGroceryDown = false;
  private startGroceryX = 0;
  private scrollGroceryLeft = 0;
  public isGroceryDragging = false;

  eventsContainer = viewChild<ElementRef>('eventsContainer');
  private isEventsDown = false;
  private startEventsX = 0;
  private scrollEventsLeft = 0;
  public isEventsDragging = false;

  jobsContainer = viewChild<ElementRef>('jobsContainer');
  private isJobsDown = false;
  private startJobsX = 0;
  private scrollJobsLeft = 0;
  public isJobsDragging = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private pushService: PushNotificationService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.settings = this.dataService.getAppSettings();
    this.banners = this.dataService.getBanners();
    this.categories = this.dataService.getCategories();
    this.countries = this.dataService.getCountries();
    this.news = this.dataService.getNews();
    this.offers = this.dataService.getOffers();
    this.events = this.dataService.getEvents();
    this.jobs = this.dataService.getJobs();
    this.allBusinesses = this.dataService.getBusinesses();
    this.allRestaurants = this.dataService.getRestaurants();
    this.allGroceries = this.dataService.getGroceries();
    this.selectedCountryId = this.dataService.selectedCountryId;

    this.user = computed(() => {
        const profile = this.authService.userProfile();
        const currentUser = this.authService.currentUser();
        const fullName = profile?.name || currentUser?.displayName || 'Guest';
        
        const parts = fullName.trim().split(/\s+/);
        let displayName = parts[0];
        
        if (displayName.length < 3 && parts.length > 1) {
            displayName = parts[parts.length - 1];
        }

        return {
          name: displayName,
          greeting: 'Hello',
          subtitle: 'Proud to be a member of this CeyHallo.',
          avatar: profile?.photoURL || currentUser?.photoURL || `https://i.pravatar.cc/150?u=${profile?.email || 'guest'}`,
          isVerified: profile?.isVerified ?? currentUser?.emailVerified ?? false,
          isLoggedIn: !!currentUser
        };
    });

    // Helper to filter offers by type (relaxed city filtering to ensure data shows)
    const filterOffersByType = (offer: Offer, type: 'food' | 'business') => {
        // Check type first
        if (type === 'food') {
            if (offer.linkType !== 'restaurants' && offer.linkType !== 'restaurant') return false;
        } else {
            if (offer.linkType !== 'businesses' && offer.linkType !== 'business') return false;
        }

        const cid = this.selectedCountryId();
        
        // If offer has a country code, it must match
        if (offer.countryCode && offer.countryCode !== cid) {
            return false;
        }

        // Otherwise, allow it (don't be too strict with business location matching on home page)
        return true;
    };

    this.foodOffers = computed(() => {
        const allOffers = this.offers();
        let rawOffers = allOffers.filter(o => o.isHomeBanner);
        // Fallback: if no home banners, show all offers
        if (rawOffers.length === 0) {
            rawOffers = allOffers;
        }
        return rawOffers.filter(offer => filterOffersByType(offer, 'food'));
    });

    this.businessOffers = computed(() => {
        const allOffers = this.offers();
        let rawOffers = allOffers.filter(o => o.isHomeBanner);
        // Fallback: if no home banners, show all offers
        if (rawOffers.length === 0) {
            rawOffers = allOffers;
        }
        return rawOffers.filter(offer => filterOffersByType(offer, 'business'));
    });

    this.featuredRestaurants = computed(() => {
        const list = this.allRestaurants().filter(r => r.isPromoted);
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        return list.filter(r => {
            // 1. Match by countryCode
            if (r.countryCode) {
                return r.countryCode === cid;
            }

            // 2. Match by cityCode (check if it belongs to selected country)
            if (r.cityCode && country && country.cities) {
                return country.cities.some(city => city.code === r.cityCode);
            }

            // 3. Fallback to string matching location
            if (r.location && country && country.cities) {
                const loc = r.location.trim().toLowerCase();
                return country.cities.some(c => {
                    const cityName = c.name.trim().toLowerCase();
                    return loc.includes(cityName) || cityName.includes(loc);
                });
            }

            // Fallback: if no country data or codes, show it
            if (!country || !country.cities || country.cities.length === 0) return true;

            return false;
        });
    });

    this.generalBusinesses = computed(() => {
        const list = this.allBusinesses().filter(b => b.isPromoted);
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        return list.filter(b => {
            // 1. Match by countryCode
            if (b.countryCode) {
                return b.countryCode === cid;
            }

            // 2. Match by cityCode
            if (b.cityCode && country && country.cities) {
                return country.cities.some(city => city.code === b.cityCode);
            }

            // 3. Fallback to string matching location
            if (b.location && country && country.cities) {
                const loc = b.location.trim().toLowerCase();
                return country.cities.some(c => {
                    const cityName = c.name.trim().toLowerCase();
                    return loc.includes(cityName) || cityName.includes(loc);
                });
            }

            if (!country || !country.cities || country.cities.length === 0) return true;

            return false;
        });
    });

    this.featuredGroceries = computed(() => {
        const list = this.allGroceries().filter(g => g.isPromoted);
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        return list.filter(g => {
            // 1. Match by countryCode
            if (g.countryCode) {
                return g.countryCode === cid;
            }

            // 2. Match by cityCode
            if (g.cityCode && country && country.cities) {
                return country.cities.some(city => city.code === g.cityCode);
            }

            // 3. Fallback to string matching location
            if (g.location && country && country.cities) {
                const loc = g.location.trim().toLowerCase();
                return country.cities.some(c => {
                    const cityName = c.name.trim().toLowerCase();
                    return loc.includes(cityName) || cityName.includes(loc);
                });
            }

            if (!country || !country.cities || country.cities.length === 0) return true;

            return false;
        });
    });

    this.currentCountry = computed(() => {
        const list = this.countries();
        const selected = list.find(c => c.id === this.selectedCountryId());
        if (selected) return selected;
        return list.length > 0 ? list[0] : null; 
    });

    // Compute sections with data for dynamic rendering
    this.sectionsWithData = computed(() => {
        const settings = this.settings();
        let sections = settings?.homeSections || [];
        
        // Fallback if no settings found or sections are empty
        if (sections.length === 0) {
            sections = [
                { id: 'def_banners', template: 'banners', dataSource: 'banners', enabled: true, order: 1 },
                { id: 'def_categories', template: 'categories', dataSource: 'categories', enabled: true, order: 2 },
                { id: 'def_offers_food', template: 'latest_offers', dataSource: 'offers', filterValue: 'Food', title: 'Latest Offers', subTitle: '(Food)', enabled: true, order: 3 },
                { id: 'def_restaurants', template: 'featured_businesses', dataSource: 'restaurants', title: 'Featured Restaurants', enabled: true, order: 4 },
                { id: 'def_offers_biz', template: 'latest_offers', dataSource: 'offers', filterValue: 'Business', title: 'Special Offers', enabled: true, order: 5 },
                { id: 'def_businesses', template: 'featured_businesses', dataSource: 'businesses', title: 'Featured Businesses', enabled: true, order: 6 },
                { id: 'def_news', template: 'news_feed', dataSource: 'news', title: 'Latest News', enabled: true, order: 7 }
            ] as HomeSection[];
        }
        
        const enabled = sections.filter(s => s.enabled).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        return enabled.map(section => {
            let data: any[] = [];
            switch(section.dataSource) {
                case 'banners': 
                    data = this.banners(); 
                    break;
                case 'categories': 
                    data = this.categories(); 
                    break;
                case 'news': 
                    data = this.news();
                    break;
                case 'events':
                    data = this.events();
                    break;
                case 'jobs':
                    data = this.jobs();
                    break;
                case 'offers':
                    // Reuse existing logic for food vs business offers
                    const fv = (section.filterValue || '').toLowerCase();
                    if (fv === 'food') {
                        data = this.foodOffers();
                    } else {
                        data = this.businessOffers();
                    }
                    break;
                case 'restaurants': 
                    data = this.featuredRestaurants(); 
                    break;
                case 'groceries':
                    data = this.featuredGroceries();
                    break;
                case 'businesses': 
                    data = this.generalBusinesses(); 
                    break;
            }

            // Apply limit from settings if specified
            const limit = Number(section.limit);
            if (!isNaN(limit) && limit > 0) {
                data = data.slice(0, limit);
            }

            return { section, data };
        });
    });

    // Effect to handle loading state change based on data availability
    effect(() => {
        // As soon as settings are loaded (indicating core data fetch initiated/completed), 
        // we can reveal the UI. Inner components have their own empty states/skeletons if needed.
        if (this.settings()) {
            this.isLoading.set(false);
        }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.pushService.initPush();
  }

  handleImgError = handleImageError;

  async downloadApp() {
    const toast = await this.toastCtrl.create({
      message: `App download will be available soon.`,
      duration: 2500,
      color: 'dark',
      position: 'middle',
      icon: 'information-circle',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }

  async goToProfile() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tabs/profile']);
    } else {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: {
          isModal: true,
          message: 'Please log in to view your profile.'
        }
      });
      await modal.present();
    }
  }

  async resendVerification() {
    const result = await this.authService.resendVerificationEmail();
    let toastMessage = 'Verification email sent. Please check your inbox.';
    let toastColor: 'success' | 'danger' = 'success';
    
    if (!result.success) {
      toastMessage = result.error || 'Failed to send verification email.';
      toastColor = 'danger';
    }
    
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 3000,
      color: toastColor,
      position: 'top',
      icon: toastColor === 'success' ? 'checkmark-circle' : 'alert-circle',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }

  private async requireLogin(): Promise<boolean> {
    if (this.authService.isLoggedIn()) return true;

    const modal = await this.modalCtrl.create({
      component: LoginComponent,
      componentProps: { 
        isModal: true
      }
    });
    await modal.present();
    return false;
  }

  openCountrySelector() {
    this.isCountryModalOpen.set(true);
  }

  closeCountrySelector() {
    this.isCountryModalOpen.set(false);
  }

  selectCountry(country: Country) {
    this.dataService.setSelectedCountry(country.id);
    this.closeCountrySelector();
  }

  async handleCategoryClick(category: Category) {
    let path = category.path;

    // Fallback: Map known labels to paths if path is missing or invalid in DB
    if (!path) {
        const label = (category.label || '').toLowerCase();
        if (label.includes('organization') || label.includes('association')) path = '/organizations';
        else if (label.includes('business')) path = '/businesses';
        else if (label.includes('restaurant')) path = '/restaurants';
        else if (label.includes('grocery') || label.includes('supermarket')) path = '/groceries';
        else if (label.includes('news')) path = '/news';
        else if (label.includes('job')) path = '/jobs';
        else if (label.includes('event')) path = '/events';
        else if (label.includes('offer')) path = '/offers';
        else if (label.includes('support')) path = '/support';
    }

    // Known valid paths
    const validPaths = [
        '/news', '/restaurants', '/groceries', '/businesses', '/organizations', '/organization', 
        '/events', '/jobs', '/offers', '/support', '/navigate'
    ];
    
    // Check if resolved path is valid
    const isValidPath = path && validPaths.some(p => path!.toLowerCase().startsWith(p));

    if (isValidPath) {
      this.router.navigateByUrl(path!);
    } else {
      const toast = await this.toastCtrl.create({
        message: `${category.label} will be available soon.`,
        duration: 2500,
        color: 'dark',
        position: 'middle', // Middle ensures visibility
        icon: 'information-circle',
        cssClass: 'toast-custom-text'
      });
      await toast.present();
    }
  }

  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    const slider = this.newsContainer()?.nativeElement;
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
    const slider = this.newsContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.newsContainer()?.nativeElement;
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

  startBizOfferDrag(e: MouseEvent) {
    this.isBizOfferDown = true;
    this.isBizOfferDragging = false;
    const slider = this.businessOfferContainer()?.nativeElement;
    if (slider) {
      this.startBizOfferX = e.pageX - slider.offsetLeft;
      this.scrollBizOfferLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endBizOfferDrag() {
    if (!this.isBizOfferDown) return;
    this.isBizOfferDown = false;
    const slider = this.businessOfferContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doBizOfferDrag(e: MouseEvent) {
    if (!this.isBizOfferDown) return;
    e.preventDefault();
    const slider = this.businessOfferContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startBizOfferX) * 2;
      slider.scrollLeft = this.scrollBizOfferLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isBizOfferDragging = true;
      }
    }
  }

  startRestaurantDrag(e: MouseEvent) {
    this.isRestaurantDown = true;
    this.isRestaurantDragging = false;
    const slider = this.restaurantContainer()?.nativeElement;
    if (slider) {
      this.startRestaurantX = e.pageX - slider.offsetLeft;
      this.scrollRestaurantLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endRestaurantDrag() {
    if (!this.isRestaurantDown) return;
    this.isRestaurantDown = false;
    const slider = this.restaurantContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doRestaurantDrag(e: MouseEvent) {
    if (!this.isRestaurantDown) return;
    e.preventDefault();
    const slider = this.restaurantContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startRestaurantX) * 2;
      slider.scrollLeft = this.scrollRestaurantLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isRestaurantDragging = true;
      }
    }
  }

  startBusinessDrag(e: MouseEvent) {
    this.isBusinessDown = true;
    this.isBusinessDragging = false;
    const slider = this.businessContainer()?.nativeElement;
    if (slider) {
      this.startBusinessX = e.pageX - slider.offsetLeft;
      this.scrollBusinessLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endBusinessDrag() {
    if (!this.isBusinessDown) return;
    this.isBusinessDown = false;
    const slider = this.businessContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doBusinessDrag(e: MouseEvent) {
    if (!this.isBusinessDown) return;
    e.preventDefault();
    const slider = this.businessContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startBusinessX) * 2;
      slider.scrollLeft = this.scrollBusinessLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isBusinessDragging = true;
      }
    }
  }

  startGroceryDrag(e: MouseEvent) {
    this.isGroceryDown = true;
    this.isGroceryDragging = false;
    const slider = this.groceryContainer()?.nativeElement;
    if (slider) {
      this.startGroceryX = e.pageX - slider.offsetLeft;
      this.scrollGroceryLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endGroceryDrag() {
    if (!this.isGroceryDown) return;
    this.isGroceryDown = false;
    const slider = this.groceryContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doGroceryDrag(e: MouseEvent) {
    if (!this.isGroceryDown) return;
    e.preventDefault();
    const slider = this.groceryContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startGroceryX) * 2;
      slider.scrollLeft = this.scrollGroceryLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isGroceryDragging = true;
      }
    }
  }

  startEventsDrag(e: MouseEvent) {
    this.isEventsDown = true;
    this.isEventsDragging = false;
    const slider = this.eventsContainer()?.nativeElement;
    if (slider) {
      this.startEventsX = e.pageX - slider.offsetLeft;
      this.scrollEventsLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endEventsDrag() {
    if (!this.isEventsDown) return;
    this.isEventsDown = false;
    const slider = this.eventsContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doEventsDrag(e: MouseEvent) {
    if (!this.isEventsDown) return;
    e.preventDefault();
    const slider = this.eventsContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startEventsX) * 2;
      slider.scrollLeft = this.scrollEventsLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isEventsDragging = true;
      }
    }
  }

  startJobsDrag(e: MouseEvent) {
    this.isJobsDown = true;
    this.isJobsDragging = false;
    const slider = this.jobsContainer()?.nativeElement;
    if (slider) {
      this.startJobsX = e.pageX - slider.offsetLeft;
      this.scrollJobsLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endJobsDrag() {
    if (!this.isJobsDown) return;
    this.isJobsDown = false;
    const slider = this.jobsContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doJobsDrag(e: MouseEvent) {
    if (!this.isJobsDown) return;
    e.preventDefault();
    const slider = this.jobsContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startJobsX) * 2;
      slider.scrollLeft = this.scrollJobsLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isJobsDragging = true;
      }
    }
  }

  async handleNewsClick(articleId: string) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    
    if (!(await this.requireLogin())) return;

    await this.openNewsArticle(articleId);
  }

  async openNewsArticle(articleId: string) {
    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleId: articleId,
      },
    });
    await modal.present();
  }

  async handleBannerClick(banner: Banner) {
    if (!(await this.requireLogin())) return;

    const navType = banner.navigationType || 'none';
    
    const bannerArticle: NewsArticle = {
      id: banner.id,
      title: banner.title,
      source: 'Featured',
      date: new Date(),
      imageUrl: banner.image,
      description: banner.description || '',
      content: `<p class="text-lg font-medium">${banner.description || ''}</p>`,
      category: banner.category
    };

    let actionType: 'share' | 'external' | 'internal' | 'close' = 'close';
    let actionLabel = 'Back to Home';
    let actionIcon = 'arrow-back';
    let targetUrl = '';
    let targetType = banner.targetType;

    switch (navType) {
        case 'external':
            if (banner.targetId) {
                actionType = 'external';
                actionLabel = 'Visit Website';
                actionIcon = 'globe-outline';
                targetUrl = banner.targetId;
            }
            break;
        case 'internal':
            if (banner.targetId) {
                actionType = 'internal';
                actionLabel = 'View in Page';
                actionIcon = 'open-outline';
                targetUrl = banner.targetId;
            }
            break;
        case 'share':
            actionType = 'share';
            actionLabel = 'Share Article';
            actionIcon = 'share-social';
            break;
    }

    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleData: bannerArticle,
        actionType: actionType,
        actionLabel: actionLabel,
        actionIcon: actionIcon,
        targetUrl: targetUrl,
        targetType: targetType
      }
    });
    await modal.present();
  }
  
  async handleBusinessClick(businessId: string, context: 'restaurant' | 'business' | 'grocery' = 'business') {
    let dragging = false;
    if (context === 'restaurant') dragging = this.isRestaurantDragging;
    else if (context === 'grocery') dragging = this.isGroceryDragging;
    else dragging = this.isBusinessDragging;
    
    if (dragging) {
      if (context === 'restaurant') this.isRestaurantDragging = false;
      else if (context === 'grocery') this.isGroceryDragging = false;
      else this.isBusinessDragging = false;
      return;
    }
    
    if (!(await this.requireLogin())) return;

    await this.openBusinessDetail(businessId);
  }

  async handleOfferClick(offer: Offer, isBusinessSection = false) {
    const isDragging = isBusinessSection ? this.isBizOfferDragging : this.isOfferDragging;

    if (isDragging) {
        if (isBusinessSection) this.isBizOfferDragging = false;
        else this.isOfferDragging = false;
        return;
    }
    
    if (!(await this.requireLogin())) return;

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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expires: ${offer.expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
        </div>
      `,
      category: 'Special Offer'
    };

    let actionType: 'share' | 'external' | 'internal' | 'close' = 'close';
    let actionLabel = 'Back to Home';
    let actionIcon = 'arrow-back';
    let targetUrl = '';
    let targetType: 'news' | 'business' | 'restaurant' | 'event' | 'job' | undefined = undefined;

    const targetId = offer.targetId || offer.businessId;
    if (targetId) {
        actionType = 'internal';
        actionLabel = 'View in Page';
        actionIcon = 'open-outline';
        
        let type = (offer.linkType || 'business').toLowerCase();
        if (type === 'restaurants') type = 'restaurant';
        if (type === 'businesses') type = 'business';

        switch (type) {
            case 'event':
                targetType = 'event';
                targetUrl = `/event/${targetId}`;
                break;
            case 'job':
                targetType = 'job';
                targetUrl = `/job/${targetId}`;
                break;
            case 'news':
                targetType = 'news';
                targetUrl = `/news/${targetId}`;
                break;
            case 'restaurant':
            case 'business':
            default:
                targetType = 'business';
                targetUrl = `/business/${targetId}`;
                break;
        }
    }

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
    const modal = await this.modalCtrl.create({
      component: BusinessDetailComponent,
      componentProps: {
        businessId: businessId,
      },
    });
    await modal.present();
  }

  async openEventDetail(eventId: string) {
    const modal = await this.modalCtrl.create({
      component: EventDetailComponent,
      componentProps: { eventId }
    });
    await modal.present();
  }

  async openJobDetail(jobId: string) {
    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: { jobId }
    });
    await modal.present();
  }
}
