import { Component, ChangeDetectionStrategy, signal, computed, OnInit, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { NewsArticle } from '../../models/news.model';
import { Business } from '../../models/business.model';
import { Offer } from '../../models/offer.model';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { BusinessCardComponent } from '../../components/business-card/business-card.component';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';

type SearchResult = (NewsArticle & { type: 'news' }) | (Business & { type: 'business' | 'restaurant' }) | (Offer & { type: 'offer' });

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, PageHeaderComponent, NewsCardComponent, BusinessCardComponent, OfferCardComponent],
})
export class SearchComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService
  ) {}

  public isModal = false;
  readonly isModalSignal = signal(false);

  searchTerm = signal('');
  expandedCategories = signal<Set<string>>(new Set());

  offersContainer = viewChild<ElementRef>('offersContainer');
  
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  public isDragging = false;

  private allContent = computed(() => {
    const news: SearchResult[] = this.dataService.getNews()().map(item => ({ ...item, type: 'news' }));
    const businesses: SearchResult[] = this.dataService.getBusinesses()().map(item => ({ ...item, type: 'business' }));
    const restaurants: SearchResult[] = this.dataService.getRestaurants()().map(item => ({ ...item, type: 'restaurant' }));
    const offers: SearchResult[] = this.dataService.getOffers()().map(item => ({ ...item, type: 'offer' }));
    return [...offers, ...news, ...businesses, ...restaurants];
  });

  searchResults = computed(() => {
    const term = (this.searchTerm() || '').trim().toLowerCase();
    if (!term) {
      return [];
    }

    const filtered = this.allContent().filter(item => {
      if (item.type === 'news') {
        const titleMatch = (item.title || '').toLowerCase().includes(term);
        const descriptionMatch = (item.description || '').toLowerCase().includes(term);
        return titleMatch || descriptionMatch;
      } else if (item.type === 'offer') {
        const titleMatch = (item.title || '').toLowerCase().includes(term);
        const descriptionMatch = (item.description || '').toLowerCase().includes(term);
        const targetMatch = (item.targetName || '').toLowerCase().includes(term);
        return titleMatch || descriptionMatch || targetMatch;
      } else {
        const nameMatch = (item.name || '').toLowerCase().includes(term);
        const categoryMatch = (item.category || '').toLowerCase().includes(term);
        const locationMatch = (item.location || '').toLowerCase().includes(term);
        return nameMatch || categoryMatch || locationMatch;
      }
    });

    const groups: { [key: string]: SearchResult[] } = {
      'Offers': [],
      'News': [],
      'Restaurants': [],
      'Businesses': []
    };

    for (const item of filtered) {
      if (item.type === 'news') {
        groups['News'].push(item);
      } else if (item.type === 'restaurant') {
        groups['Restaurants'].push(item);
      } else if (item.type === 'offer') {
        groups['Offers'].push(item);
      } else {
        groups['Businesses'].push(item);
      }
    }

    const expanded = this.expandedCategories();

    return Object.entries(groups)
      .map(([category, results]) => {
        const totalCount = results.length;
        const isExpanded = expanded.has(category);
        
        let visibleResults = results;
        if (category !== 'Offers') {
            visibleResults = isExpanded ? results : results.slice(0, 5);
        }

        return { category, results: visibleResults, totalCount, isExpanded };
      })
      .filter(group => group.totalCount > 0);
  });

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
  }

  handleImgError = handleImageError;

  handleSearch(value: string) {
    this.searchTerm.set(value);
    this.expandedCategories.set(new Set());
  }

  expandCategory(category: string) {
    this.expandedCategories.update(set => {
      const newSet = new Set(set);
      newSet.add(category);
      return newSet;
    });
  }

  goBack() {
    if (this.isModalSignal()) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.back();
    }
  }

  async openResult(result: SearchResult) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }

    if (!this.authService.isLoggedIn()) {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: { 
          isModal: true
        }
      });
      await modal.present();
      return;
    }

    if (result.type === 'news') {
      const modal = await this.modalCtrl.create({
        component: NewsDetailComponent,
        componentProps: {
          articleId: result.id,
        },
      });
      await modal.present();
    } else if (result.type === 'offer') {
      await this.openOfferDetail(result);
    } else {
      const modal = await this.modalCtrl.create({
        component: BusinessDetailComponent,
        componentProps: {
          businessId: result.id,
        },
      });
      await modal.present();
    }
  }

  async openOfferDetail(offer: Offer) {
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
              <ion-icon name="time-outline" class="text-lg"></ion-icon>
              <span>Expires: ${offer.expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
        </div>
      `,
      category: 'Special Offer'
    };

    let actionType: 'share' | 'external' | 'internal' | 'close' = 'close';
    let actionLabel = 'Back';
    let actionIcon = 'arrow-back';
    let targetUrl = '';
    let targetType: any = undefined;

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

  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    const slider = this.offersContainer()?.nativeElement;
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
    const slider = this.offersContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.offersContainer()?.nativeElement;
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