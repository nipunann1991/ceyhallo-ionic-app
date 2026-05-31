
import { Component, ChangeDetectionStrategy, signal, computed, viewChild, ElementRef, OnInit, OnDestroy, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, RefresherCustomEvent } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
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
import { BannerNavigationType, BannerTargetType } from '../../enums/banner.enum';
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
import { Notification } from '../../models/notification.model';
import { LocalNotificationStateService } from '../../services/local-notification-state.service';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterLink, FormsModule, BannerComponent, BusinessCardComponent, NewsCardComponent, OfferCardComponent, EventCardComponent, JobCardComponent],
})
export class HomeComponent implements OnInit, OnDestroy {
  settings: Signal<AppConfig | null | undefined>;
  banners: Signal<Banner[]>;
  categories: Signal<Category[]>;
  countries: Signal<Country[]>;
  news: Signal<NewsArticle[]>;
  offers: Signal<Offer[]>;
  events: Signal<Event[]>;
  jobs: Signal<Job[]>;
  businesses: Signal<Business[]>;
  notifications: Signal<Notification[]>;
  hasUnreadNotifications: Signal<boolean>;
  


  sectionsWithData: Signal<{ section: HomeSection, data: any[] }[]>;
  user: Signal<any>;
  
  currentCountry: Signal<Country | null>;

  selectedCountryId: Signal<string>;
  isCountryModalOpen = signal(false);
  profileCompletionModalOpen = signal(false);
  profileCompletionStep = signal<1 | 2>(1);
  profileCompletionBusy = signal(false);
  profileCompletionDismissed = signal(false);
  completionPhoneNumber = signal('');
  completionRegion = signal('');
  completionCity = signal('');
  completionDateOfBirth = signal('');
  verificationDialogState = signal<'closed' | 'confirm' | 'code' | 'success'>('closed');
  verificationDialogBusy = signal(false);
  verificationDialogEmail = signal('');
  verificationCode = signal('');
  homeViewEntered = signal(false);

  // Loading state
  isLoading = signal(true);

  private minLoadTime = 1500;
  private loadTimeout: any;
  private dataReady = false;
  private profileCompletionOpenTimeout: ReturnType<typeof setTimeout> | null = null;

  private activeSlider: HTMLElement | null = null;
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  public isDragging = false;
  availableCompletionCities: Signal<{ code: string; name: string }[]>;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private localNotificationState: LocalNotificationStateService,
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
    this.businesses = this.dataService.getBusinesses();
    this.notifications = this.dataService.getNotifications();
    this.hasUnreadNotifications = computed(() =>
      this.localNotificationState.hasUnread(this.notifications())
    );


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

    this.currentCountry = computed(() => {
        const list = this.countries();
        const selected = list.find(c => c.id === this.selectedCountryId());
        if (selected) return selected;
        return list.length > 0 ? list[0] : null; 
    });

    this.availableCompletionCities = computed(() => {
      const selectedRegion = this.completionRegion();
      const country = this.countries().find((item) => item.id === selectedRegion);
      return country?.cities || [];
    });

    // Compute sections with data for dynamic rendering
    this.sectionsWithData = computed(() => {
        const settings = this.settings();
        if (settings === undefined) return []; // Loading
        
        let sections = settings?.homeSections || [];
        

        
        const enabled = sections.filter(s => s.enabled).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        return enabled.map(section => {
          const dataSignal = this.getSectionData(section);
          let data = dataSignal();

          // Apply additional filtering based on section properties
          if (section.dataSource === 'offers') {
            data = this.filterOffers(data as Offer[], section);
          } else if (section.dataSource === 'businesses') {
            const cid = this.selectedCountryId();
            // Filter by country first
            let filteredData = (data as Business[]).filter(b => !b.countryCode || b.countryCode === cid);

            if (section.filterData && section.filterData.length > 0) {
              filteredData = filteredData.filter((item: any) => {
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
          } else if (section.dataSource === 'events') {
            const cid = this.selectedCountryId();
            data = (data as Event[]).filter(e => !e.countryCode || e.countryCode === cid);
          }

          if (typeof section.limit === 'number' && section.limit > 0) {
            data = data.slice(0, section.limit);
          }

          return { section, data };
        }).filter(item => item.data && item.data.length > 0);
    });

    // Loading effect
    effect(() => {
        const settings = this.settings();
        const currentCountry = this.currentCountry();

        if (settings !== null && currentCountry !== null) {
            this.dataReady = true;
            this.hideLoadingIfReady();
        }
    });

    effect(() => {
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

    effect(() => {
      const user = this.authService.currentUser();
      const profile = this.authService.userProfile();
      const loading = this.isLoading();
      const shouldPrompt = this.authService.pendingProfileCompletionPrompt();

      if (!user) {
        this.resetProfileCompletionPrompt();
        return;
      }

      if (!shouldPrompt || !profile || loading || !this.homeViewEntered()) {
        return;
      }

      if (!this.requiresProfileCompletion(profile)) {
        this.authService.clearProfileCompletionPrompt();
        if (this.profileCompletionOpenTimeout) {
          clearTimeout(this.profileCompletionOpenTimeout);
          this.profileCompletionOpenTimeout = null;
        }
        this.profileCompletionModalOpen.set(false);
        return;
      }

      if (this.profileCompletionDismissed() || this.profileCompletionModalOpen()) {
        return;
      }

      this.initializeProfileCompletionForm();
      void this.triggerProfileCompletionAfterHomeLoaded();
    }, { allowSignalWrites: true });
  }
  

  ngOnInit() {
    this.loadTimeout = setTimeout(() => {
      this.hideLoadingIfReady();
    }, this.minLoadTime);
  }

  ionViewDidEnter() {
    this.homeViewEntered.set(true);
    void this.triggerProfileCompletionAfterHomeLoaded();
  }

  ionViewDidLeave() {
    this.homeViewEntered.set(false);
  }

  private hideLoadingIfReady() {
    if (this.dataReady && this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.isLoading.set(false);
      void this.triggerProfileCompletionAfterHomeLoaded();
    }
  }

  ngOnDestroy() {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
    if (this.profileCompletionOpenTimeout) {
      clearTimeout(this.profileCompletionOpenTimeout);
      this.profileCompletionOpenTimeout = null;
    }
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
      default: return signal([]);
    }
  }

  private filterOffers(offers: Offer[], section: HomeSection): Offer[] {
    const cid = this.selectedCountryId();
    const businesses = this.businesses();
    const events = this.events();
    
    // 1. Filter by Country first (optimization and correctness)
    let relevantOffers = offers.filter(o => {
        // Explicit country code on offer
        if (o.countryCode) {
            return o.countryCode === cid;
        }

        // Implicit country code via Target (Business or Event)
        if (o.targetId) {
            // Check Business (Default or explicit)
            if (!o.linkType || o.linkType === 'business' || o.linkType === 'businesses') {
                 const business = businesses.find(b => b.id === o.targetId);
                 if (business && business.countryCode) {
                     return business.countryCode === cid;
                 }
            }
            // Check Event
            else if (o.linkType === 'event') {
                 const event = events.find(e => e.id === o.targetId);
                 if (event && event.countryCode) {
                     return event.countryCode === cid;
                 }
            }
        }

        // Default to global/show if no specific country restriction found
        return true;
    });

    // 2. Handle "Home Banner" priority logic
    // If there are home banners for this country, prefer them.
    const homeBanners = relevantOffers.filter(o => o.isHomeBanner);
    if (homeBanners.length > 0) {
        relevantOffers = homeBanners;
    }

    // 3. Apply Section Filters
    return relevantOffers.filter(offer => {
        // New Filter Data Logic
        if (section.filterData && section.filterData.length > 0) {
            return section.filterData.every(criterion => {
                const key = criterion.filterType;
                const value = criterion.filterValue;

                if (key === 'category') {
                    return (offer.generalCategory || '').toLowerCase() === (value || '').toLowerCase();
                }
                // Generic check for other properties
                return (offer as any)[key] == value;
            });
        }
        
        // Legacy Filter Value Logic
        if (section.filterValue) {
            const val = section.filterValue.toLowerCase();
            if (val === 'food') {
                return offer.generalCategory?.toLowerCase() === 'food';
            } else {
                // Legacy fallback: treat as 'business' filter
                return offer.linkType === 'businesses' || offer.linkType === 'business';
            }
        }

        return true;
    });
  }

  getSectionCategory(section: HomeSection): string {
    // 1. Check filterData for 'category'
    if (section.filterData && section.filterData.length > 0) {
        const catFilter = section.filterData.find(f => f.filterType === 'category');
        if (catFilter) {
            return catFilter.filterValue;
        }
    }
    
    // 2. Check legacy filterValue
    if (section.filterValue) {
        const val = section.filterValue.toLowerCase();
        if (val === 'food') return 'food';
        return 'business';
    }
    
    // 3. Default
    return 'business';
  }

  handleImgError = handleImageError;

  async handleRefresh(event: any) {
    const refresher = event as RefresherCustomEvent;
    
    // Refresh data
    this.dataService.refreshAllData();
    
    // Simulate network request if needed, or wait for data
    setTimeout(() => {
      refresher.target.complete();
    }, 1500);
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
    this.verificationCode.set('');
    this.verificationDialogEmail.set(this.authService.currentUser()?.email || '');
    this.verificationDialogState.set('confirm');
  }

  closeVerificationDialog() {
    if (this.verificationDialogBusy()) {
      return;
    }

    this.verificationDialogState.set('closed');
    this.verificationCode.set('');
  }

  async sendVerificationCode() {
    this.verificationDialogBusy.set(true);
    const result = await this.authService.resendVerificationEmail();
    this.verificationDialogBusy.set(false);

    if (!result.success) {
      await this.showToast(result.error || 'Failed to send verification code.', 'danger');
      return;
    }

    this.verificationDialogEmail.set(result.email || this.authService.currentUser()?.email || '');
    this.verificationCode.set('');
    this.verificationDialogState.set('code');
    await this.showToast(
      `Verification code sent to ${result.email || 'your email address'}.`,
      'success'
    );
  }

  async confirmVerificationCode() {
    const code = this.verificationCode().trim();
    if (!code) {
      await this.showToast('Verification code is required.', 'danger');
      return;
    }

    this.verificationDialogBusy.set(true);
    const result = await this.authService.verifyEmailWithCode(code);
    this.verificationDialogBusy.set(false);

    if (!result.success) {
      await this.showToast(result.error || 'Failed to verify email.', 'danger');
      return;
    }

    this.verificationDialogState.set('success');
  }

  finishVerificationFlow() {
    this.verificationDialogState.set('closed');
    this.verificationCode.set('');
  }

  onVerificationBackdropClick() {
    if (this.verificationDialogBusy()) {
      return;
    }

    if (this.verificationDialogState() === 'success') {
      this.finishVerificationFlow();
      return;
    }

    this.closeVerificationDialog();
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle',
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

  closeProfileCompletionModal() {
    if (this.profileCompletionBusy()) {
      return;
    }

    this.profileCompletionModalOpen.set(false);
  }

  skipProfileCompletion() {
    if (this.profileCompletionBusy()) {
      return;
    }

    this.authService.clearProfileCompletionPrompt();
    this.profileCompletionDismissed.set(true);
    this.profileCompletionModalOpen.set(false);
  }

  onCompletionRegionChange(regionId: string) {
    this.completionRegion.set(regionId);
    this.completionCity.set('');
  }

  previousProfileCompletionStep() {
    this.profileCompletionStep.set(1);
  }

  async nextProfileCompletionStep() {
    this.profileCompletionStep.set(2);
  }

  async saveProfileCompletion() {
    if (!this.completionPhoneNumber().trim()) {
      await this.showToast('Phone number is required.', 'danger');
      return;
    }

    this.profileCompletionBusy.set(true);
    const result = await this.authService.updateUserProfile({
      phoneNumber: this.completionPhoneNumber().trim(),
      region: this.completionRegion(),
      city: this.completionCity(),
      dateOfBirth: this.completionDateOfBirth() || '',
    });
    this.profileCompletionBusy.set(false);

    if (!result.success) {
      await this.showToast(result.error || 'Failed to update profile.', 'danger');
      return;
    }

    this.authService.clearProfileCompletionPrompt();
    this.profileCompletionDismissed.set(true);
    this.profileCompletionModalOpen.set(false);
    await this.showToast('Profile completed successfully.', 'success');
  }

  private initializeProfileCompletionForm() {
    const profile = this.authService.userProfile();
    if (!profile) {
      return;
    }

    this.completionPhoneNumber.set(profile.phoneNumber || '');
    this.completionRegion.set(profile.region || '');
    this.completionCity.set(profile.city || '');
    this.completionDateOfBirth.set(profile.dateOfBirth || '');
    this.profileCompletionStep.set(1);
  }

  private resetProfileCompletionPrompt() {
    if (this.profileCompletionOpenTimeout) {
      clearTimeout(this.profileCompletionOpenTimeout);
      this.profileCompletionOpenTimeout = null;
    }

    this.profileCompletionModalOpen.set(false);
    this.profileCompletionDismissed.set(false);
    this.profileCompletionStep.set(1);
    this.completionPhoneNumber.set('');
    this.completionRegion.set('');
    this.completionCity.set('');
    this.completionDateOfBirth.set('');
  }

  private async scheduleProfileCompletionModalOpen() {
    if (this.profileCompletionOpenTimeout || this.profileCompletionModalOpen() || this.profileCompletionDismissed()) {
      return;
    }

    this.profileCompletionOpenTimeout = setTimeout(async () => {
      this.profileCompletionOpenTimeout = null;

      if (!this.homeViewEntered() || this.isLoading() || this.profileCompletionModalOpen() || this.profileCompletionDismissed()) {
        return;
      }

      const profile = this.authService.userProfile();
      const user = this.authService.currentUser();
      if (!user || !profile) {
        return;
      }

      if (!this.requiresProfileCompletion(profile) || !this.authService.pendingProfileCompletionPrompt()) {
        return;
      }

      const activeModal = await this.modalCtrl.getTop();
      if (activeModal) {
        void this.scheduleProfileCompletionModalOpen();
        return;
      }

      this.profileCompletionStep.set(1);
      this.profileCompletionModalOpen.set(true);
    }, 700);
  }

  private async triggerProfileCompletionAfterHomeLoaded() {
    if (!this.homeViewEntered() || this.isLoading()) {
      return;
    }

    await this.scheduleProfileCompletionModalOpen();
  }

  private requiresProfileCompletion(profile: UserProfile | null | undefined): boolean {
    return !profile?.phoneNumber?.trim();
  }

  async handleCategoryClick(category: Category) {
    let path = category.path;

    // Fallback: Map known labels to paths if path is missing or invalid in DB
    if (!path) {
        const label = (category.label || '').toLowerCase();
        if (label.includes('business')) path = '/businesses';
        else if (label.includes('news')) path = '/news';
        else if (label.includes('job')) path = '/jobs';
        else if (label.includes('event')) path = '/events';
        else if (label.includes('offer')) path = '/offers';
        else if (label.includes('support')) path = '/legal/help';
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

  getSectionLinkUrl(section: HomeSection): string | null {
    if (section.linkUrl?.trim()) {
      return section.linkUrl.trim();
    }

    switch (section.template) {
      case 'latest_offers':
        return '/offers';
      case 'featured_businesses':
        return '/businesses';
      case 'news_feed':
        return '/news';
      case 'events':
        return '/events';
      case 'jobs':
        return '/jobs';
      default:
        return null;
    }
  }

  async handleSectionLinkClick(section: HomeSection) {
    const url = this.getSectionLinkUrl(section);
    if (!url) {
      return;
    }

    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_system');
      return;
    }

    if (section.template === 'latest_offers') {
      await this.router.navigate(['/offers'], {
        queryParams: {
          category: this.getSectionCategory(section),
          title: section.title
        }
      });
      return;
    }

    await this.router.navigateByUrl(url);
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
        case BannerNavigationType.External:
            if (banner.targetId) {
                actionType = 'external';
                actionLabel = 'Visit Website';
                actionIcon = 'globe-outline';
                targetUrl = banner.targetId;
            }
            break;
        case BannerNavigationType.Internal:
            if (banner.targetId) {
                actionType = 'internal';
                actionLabel = 'View in Page';
                actionIcon = 'open-outline';
                targetUrl = banner.targetId;
            }
            break;
        case BannerNavigationType.Share:
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
  
  async handleBusinessClick(businessId: string) {
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

    let actionType: 'share' | 'external' | 'internal' | 'close' = 'close';
    let actionLabel = 'Back to Home';
    let actionIcon = 'arrow-back';
    let targetUrl = '';
    let targetType: BannerTargetType | undefined = undefined;

    const targetId = offer.targetId || offer.businessId;
    if (targetId) {
        actionType = 'internal';
        actionLabel = 'View in Page';
        actionIcon = 'open-outline';
        
        let type = (offer.linkType || 'business').toLowerCase();
        if (type === 'businesses') type = 'business';

        switch (type) {
            case 'event':
                targetType = BannerTargetType.Event;
                targetUrl = `/event/${targetId}`;
                break;
            case 'job':
                targetType = BannerTargetType.Job;
                targetUrl = `/job/${targetId}`;
                break;
            case 'news':
                targetType = BannerTargetType.News;
                targetUrl = `/news/${targetId}`;
                break;
            case 'business':
            default:
                targetType = BannerTargetType.Business;
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
