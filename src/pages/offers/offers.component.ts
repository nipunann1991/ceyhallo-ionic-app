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
import { BannerTargetType } from '../../enums/banner.enum';

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
            list = list.filter(o => (o.generalCategory || '').toLowerCase() === category.toLowerCase());
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

    await this.openOfferModal(offer, 'Back');
  }

  private buildOfferArticle(offer: Offer): NewsArticle {
    const isNoLinkOffer = (offer.linkType || '').toLowerCase() === 'none';
    const expiryLabel = offer.endDate
      ? offer.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No end date';

    return {
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
      category: 'Special Offer',
    };
  }

  private buildOfferAction(offer: Offer, backLabel: string): { actionType: 'share' | 'external' | 'internal' | 'close'; actionLabel: string; actionIcon: string; targetUrl: string; targetType?: BannerTargetType } {
    const targetId = offer.targetId || offer.businessId;
    if (!targetId) {
      return {
        actionType: 'close',
        actionLabel: backLabel,
        actionIcon: 'arrow-back',
        targetUrl: '',
      };
    }

    const type = (offer.linkType || 'business').toLowerCase() === 'businesses'
      ? 'business'
      : (offer.linkType || 'business').toLowerCase();

    const routeMap: Record<string, { targetType: BannerTargetType; routePrefix: string }> = {
      event: { targetType: BannerTargetType.Event, routePrefix: '/event' },
      job: { targetType: BannerTargetType.Job, routePrefix: '/job' },
      news: { targetType: BannerTargetType.News, routePrefix: '/news' },
      restaurant: { targetType: BannerTargetType.Business, routePrefix: '/business' },
      business: { targetType: BannerTargetType.Business, routePrefix: '/business' },
    };
    const resolved = routeMap[type] || routeMap.business;

    return {
      actionType: 'internal',
      actionLabel: 'View in Page',
      actionIcon: 'open-outline',
      targetUrl: `${resolved.routePrefix}/${targetId}`,
      targetType: resolved.targetType,
    };
  }

  private async openOfferModal(offer: Offer, backLabel: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleData: this.buildOfferArticle(offer),
        ...this.buildOfferAction(offer, backLabel),
      }
    });
    await modal.present();
  }
}
