
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
import { Observable } from 'rxjs';
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
  


  sectionsWithData: Signal<{ section: HomeSection, data: any[] }[]>;
  user: Signal<any>;
  
  // Specific Offer Signals (preserved for reusing logic)
  foodOffers: Signal<Offer[]>;
  businessOffers: Signal<Offer[]>;
  

  currentCountry: Signal<Country | null>;

  selectedCountryId: Signal<string>;
  isCountryModalOpen = signal(false);
  
  // Loading State
  isLoading = signal(true);

  private activeSlider: HTMLElement | null = null;
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  public isDragging = false;

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
        

        
        const enabled = sections.filter(s => s.enabled).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        return enabled.map(section => {
          const dataSignal = this.getSectionData(section);
          let data = dataSignal();

          // Apply additional filtering based on section properties
          if (section.dataSource === 'offers' && section.filterValue) {
            const type = section.filterValue.toLowerCase() === 'food' ? 'food' : 'business';
            data = this.filterOffers(data as Offer[], type);
          } else if (section.dataSource === 'restaurants' || section.dataSource === 'businesses' || section.dataSource === 'groceries') {
            let filteredData = data;

            if (section.filterData && section.filterData.length > 0) {
              filteredData = data.filter((item: any) => {
                return section.filterData!.every(criterion => {
                  const filterType = criterion.filterType === 'isFeatured' ? 'isPromoted' : criterion.filterType;
                  
                  // Handle case-insensitive category matching
                  if (filterType === 'category') {
                    const itemCategory = (item.category || '').toLowerCase();
                    const filterValue = (criterion.filterValue || '').toLowerCase();
                    return itemCategory === filterValue;
                  }
                  
                  return item[filterType] == criterion.filterValue;
                });
              });
            }

            if (section.excludedCategories && section.excludedCategories.length > 0) {
              const excluded = section.excludedCategories.map(c => c.toLowerCase());
              filteredData = filteredData.filter((item: any) => {
                const itemCategory = (item.category || '').toLowerCase();
                return !excluded.includes(itemCategory);
              });
            }
            data = filteredData;
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

        const countries = this.countries();
        const selectedId = this.selectedCountryId();
        
        if (countries.length > 0) {
            const countryExists = countries.some(c => c.id === selectedId);
            if (!countryExists) {
                // The default ID is not in the list. Let's find 'AE' by name.
                const aeCountry = countries.find(c => c.name.toLowerCase().includes('emirates') || c.name.toUpperCase() === 'AE');
                if (aeCountry) {
                    this.dataService.setSelectedCountry(aeCountry.id);
                }
            }
        }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.pushService.initPush();
  }

  private getSectionData(section: HomeSection): Signal<any[]> {
    switch (section.dataSource) {
      case 'banners': return this.dataService.getBanners();
      case 'categories': return this.dataService.getCategories();
      case 'news': return this.dataService.getNews();
      case 'offers': return this.dataService.getOffers();
      case 'events': return this.dataService.getEvents();
      case 'jobs': return this.dataService.getJobs();
      case 'businesses': return this.dataService.getBusinesses();
      case 'restaurants': return this.dataService.getRestaurants();
      case 'groceries': return this.dataService.getGroceries();
      default: return signal([]);
    }
  }

  private filterOffers(offers: Offer[], type: 'food' | 'business'): Offer[] {
    const filterFn = (offer: Offer) => {
        if (type === 'food') {
            if (offer.linkType !== 'restaurants' && offer.linkType !== 'restaurant') return false;
        } else {
            if (offer.linkType !== 'businesses' && offer.linkType !== 'business') return false;
        }

        const cid = this.selectedCountryId();
        if (offer.countryCode && offer.countryCode !== cid) {
            return false;
        }
        return true;
    };

    let rawOffers = offers.filter(o => o.isHomeBanner);
    if (rawOffers.length === 0) {
        rawOffers = offers;
    }
    return rawOffers.filter(filterFn);
  }

  handleImgError = handleImageError;

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

    if (path) {
      this.router.navigateByUrl(path);
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

  startDrag(e: MouseEvent, slider: HTMLElement) {
    this.isDown = true;
    this.isDragging = false;
    this.activeSlider = slider;
    this.startX = e.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;
    slider.style.scrollBehavior = 'auto';
    slider.style.scrollSnapType = 'none';
  }

  endDrag() {
    if (!this.isDown) return;
    this.isDown = false;
    if (this.activeSlider) {
      this.activeSlider.style.scrollBehavior = 'smooth';
      this.activeSlider.style.scrollSnapType = 'x mandatory';
    }
    this.activeSlider = null;
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown || !this.activeSlider) return;
    e.preventDefault();
    const x = e.pageX - this.activeSlider.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.activeSlider.scrollLeft = this.scrollLeft - walk;
    if (Math.abs(walk) > 5) {
      this.isDragging = true;
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

  navigate(url: string) {
    this.router.navigateByUrl(url);
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
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    
    if (!(await this.requireLogin())) return;

    await this.openBusinessDetail(businessId);
  }

  async handleOfferClick(offer: Offer, isBusinessSection = false) {
    if (this.isDragging) {
      this.isDragging = false;
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
