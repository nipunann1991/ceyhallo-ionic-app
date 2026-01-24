import { Component, ChangeDetectionStrategy, signal, inject, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { BannerComponent } from '../../components/banner/banner.component';
import { Country } from '../../models/country.model';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { BusinessCardComponent } from '../../components/business-card/business-card.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { handleImageError } from '../../utils/image.utils';
import { Banner } from '../../models/banner.model';
import { NewsArticle } from '../../models/news.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterLink, BannerComponent, BusinessCardComponent, NewsCardComponent],
})
export class HomeComponent {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  user = computed(() => {
    const profile = this.authService.userProfile();
    const currentUser = this.authService.currentUser();
    const fullName = profile?.name || currentUser?.displayName || 'Guest';
    
    // Logic: Get split[0]. If < 3 chars, take last split.
    const parts = fullName.trim().split(/\s+/);
    let displayName = parts[0];
    
    if (displayName.length < 3 && parts.length > 1) {
        displayName = parts[parts.length - 1];
    }

    return {
      name: displayName,
      greeting: 'Hello',
      subtitle: 'Proud to be a member of this community.',
      avatar: profile?.photoURL || currentUser?.photoURL || `https://i.pravatar.cc/150?u=${profile?.email || 'guest'}`,
      isVerified: profile?.isVerified ?? currentUser?.emailVerified ?? false
    };
  });

  // Expose data signals
  banners = this.dataService.getBanners();
  categories = this.dataService.getCategories();
  countries = this.dataService.getCountries();
  news = this.dataService.getNews();
  
  // Use specific data sources for separate sections
  private allBusinesses = this.dataService.getBusinesses();
  private allRestaurants = this.dataService.getRestaurants();
  
  // Filter restaurants to only show promoted ones
  featuredRestaurants = computed(() => {
    return this.allRestaurants().filter(r => r.isPromoted);
  });

  // Filter businesses to only show promoted ones
  generalBusinesses = computed(() => {
    return this.allBusinesses().filter(b => b.isPromoted);
  });

  // Country Selection State (Linked to DataService)
  selectedCountryId = this.dataService.selectedCountryId;
  isCountryModalOpen = signal(false);

  // News Drag Scroll Logic
  newsContainer = viewChild<ElementRef>('newsContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  // Restaurant Drag Scroll Logic
  restaurantContainer = viewChild<ElementRef>('restaurantContainer');
  private isRestaurantDown = false;
  private startRestaurantX = 0;
  private scrollRestaurantLeft = 0;
  public isRestaurantDragging = false;

  // Business Drag Scroll Logic
  businessContainer = viewChild<ElementRef>('businessContainer');
  private isBusinessDown = false;
  private startBusinessX = 0;
  private scrollBusinessLeft = 0;
  public isBusinessDragging = false;

  // Compute the current country object based on selection
  currentCountry = computed(() => {
    const list = this.countries();
    const selected = list.find(c => c.id === this.selectedCountryId());
    
    // If selected exists, return it
    if (selected) return selected;

    // Fallback: If list loaded but 'AE' not found, return first item, or null if list empty
    return list.length > 0 ? list[0] : null; 
  });

  handleImgError = handleImageError;

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

  handleCategoryClick(path?: string) {
    if (path) {
      this.router.navigateByUrl(path);
    }
  }

  // News Drag Methods
  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    const slider = this.newsContainer()?.nativeElement;
    if (slider) {
      this.startX = e.pageX - slider.offsetLeft;
      this.scrollLeft = slider.scrollLeft;
    }
  }

  endDrag() {
    this.isDown = false;
    // Keep isDragging true briefly to prevent click event
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.newsContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX) * 2; // Scroll speed multiplier
      slider.scrollLeft = this.scrollLeft - walk;
      
      // If moved significantly (more than 5px), mark as dragging
      if (Math.abs(walk) > 5) {
        this.isDragging = true;
      }
    }
  }

  // Restaurant Drag Methods
  startRestaurantDrag(e: MouseEvent) {
    this.isRestaurantDown = true;
    this.isRestaurantDragging = false;
    const slider = this.restaurantContainer()?.nativeElement;
    if (slider) {
      this.startRestaurantX = e.pageX - slider.offsetLeft;
      this.scrollRestaurantLeft = slider.scrollLeft;
    }
  }

  endRestaurantDrag() {
    this.isRestaurantDown = false;
  }

  doRestaurantDrag(e: MouseEvent) {
    if (!this.isRestaurantDown) return;
    e.preventDefault();
    const slider = this.restaurantContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startRestaurantX) * 2; // Scroll speed multiplier
      slider.scrollLeft = this.scrollRestaurantLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isRestaurantDragging = true;
      }
    }
  }

  // Business Drag Methods
  startBusinessDrag(e: MouseEvent) {
    this.isBusinessDown = true;
    this.isBusinessDragging = false;
    const slider = this.businessContainer()?.nativeElement;
    if (slider) {
      this.startBusinessX = e.pageX - slider.offsetLeft;
      this.scrollBusinessLeft = slider.scrollLeft;
    }
  }

  endBusinessDrag() {
    this.isBusinessDown = false;
  }

  doBusinessDrag(e: MouseEvent) {
    if (!this.isBusinessDown) return;
    e.preventDefault();
    const slider = this.businessContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startBusinessX) * 2; // Scroll speed multiplier
      slider.scrollLeft = this.scrollBusinessLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isBusinessDragging = true;
      }
    }
  }

  async handleNewsClick(articleId: string) {
    // If we were dragging, ignore the click
    if (this.isDragging) {
      this.isDragging = false; // Reset for next time
      return;
    }
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
    // Construct a temporary NewsArticle object from the banner content
    // This allows us to reuse the NewsDetailComponent to show the banner info
    const bannerArticle: NewsArticle = {
      id: banner.id,
      title: banner.title,
      source: 'Featured',
      date: new Date(), // Current date
      imageUrl: banner.image,
      description: banner.description || '',
      content: `<p class="text-lg font-medium">${banner.description || ''}</p>`,
      category: banner.category
    };

    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleData: bannerArticle
      }
    });
    await modal.present();
  }
  
  async handleBusinessClick(businessId: string, isRestaurantContext = false) {
    // Check correct dragging flag based on context
    const dragging = isRestaurantContext ? this.isRestaurantDragging : this.isBusinessDragging;
    
    if (dragging) {
      // Reset flag after drag attempt
      if (isRestaurantContext) this.isRestaurantDragging = false;
      else this.isBusinessDragging = false;
      return;
    }
    await this.openBusinessDetail(businessId);
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
}