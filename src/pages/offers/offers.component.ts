import { Component, ChangeDetectionStrategy, signal, computed, OnInit, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Offer } from '../../models/offer.model';
import { NewsArticle } from '../../models/news.model';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { LoginComponent } from '../login/login.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, OfferCardComponent, PageHeaderComponent],
})
export class OffersComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);
  private route = inject(ActivatedRoute);

  public isModal = false;
  readonly isModalSignal = signal(false);

  allOffers: Signal<Offer[]>;
  searchTerm = signal('');
  filterByCategory = signal<string>('');
  
  // Custom Title Logic
  pageTitle = signal('Latest Offers');
  subtitleParam = signal('');

  filteredOffers: Signal<Offer[]>;
  pageSuffix: Signal<string>;

  constructor() {
    this.allOffers = this.dataService.getOffers();
    
    this.filteredOffers = computed(() => {
        let list = this.allOffers();
        const term = this.searchTerm().toLowerCase();
        const category = this.filterByCategory();

        // Filter by category
        if (category) {
            list = list.filter(o => (o.category || '').toLowerCase() === category.toLowerCase());
        }
    
        if (!term) return list;
    
        return list.filter(o => 
          o.title.toLowerCase().includes(term) || 
          o.description?.toLowerCase().includes(term) ||
          o.targetName?.toLowerCase().includes(term) ||
          o.discount?.toLowerCase().includes(term)
        );
    });

    this.pageSuffix = computed(() => {
        // Use passed subtitle exactly. If blank (not provided), keep it blank.
        return this.subtitleParam();
    });
  }

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
    
    // Check for category and display query params
    this.route.queryParams.subscribe(params => {
        const category = params['filterBy'] || params['category'];
        if (category) {
            this.filterByCategory.set(category.toLowerCase());
        } else {
            this.filterByCategory.set('');
        }

        const filterByParam = params['filterBy'] || params['category'];
        if (params['title']) {
            this.pageTitle.set(params['title']);
        } else if (filterByParam) {
            this.pageTitle.set(this.capitalizeFirstLetter(filterByParam) + ' Offers');
        } else {
            this.pageTitle.set('Latest Offers');
        }

        if (params['subtitle']) {
            this.subtitleParam.set(params['subtitle']);
        } else {
            this.subtitleParam.set('');
        }
    });
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  handleSearch(value: string) {
    this.searchTerm.set(value);
  }

  goBack() {
    if (this.isModalSignal()) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.back();
    }
  }

  async handleOfferClick(offer: Offer) {
    if (!this.authService.isLoggedIn()) {
        const modal = await this.modalCtrl.create({
          component: LoginComponent,
          componentProps: { isModal: true }
        });
        await modal.present();
        return;
    }

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
}