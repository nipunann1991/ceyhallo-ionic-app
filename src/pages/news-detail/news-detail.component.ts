
import { Component, ChangeDetectionStrategy, computed, signal, OnInit, Input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsArticle } from '../../models/news.model';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { JobDetailComponent } from '../job-detail/job-detail.component';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class NewsDetailComponent implements OnInit {
  @Input() articleId?: string;
  @Input() articleData?: NewsArticle;
  // Default to Close/Back since Share is now in the header
  @Input() actionType: 'share' | 'external' | 'internal' | 'close' = 'close';
  @Input() actionLabel: string = 'Back';
  @Input() actionIcon: string = 'arrow-back';
  @Input() targetUrl?: string;
  @Input() targetType?: 'news' | 'business' | 'restaurant' | 'event' | 'job';

  private readonly articleIdSignal = signal<string | undefined>(undefined);
  private readonly articleDataSignal = signal<NewsArticle | undefined>(undefined);
  
  // Lightbox State
  isLightboxOpen = signal(false);
  
  private isRouteDriven = false;
  article: Signal<NewsArticle | undefined>;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    this.article = computed(() => {
        const directData = this.articleDataSignal();
        if (directData) return directData;
    
        const id = this.articleIdSignal();
        if (id === undefined) return undefined;
        return this.dataService.getNews()().find(a => a.id === id);
    });
  }

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
       this.isRouteDriven = true;
       this.articleIdSignal.set(routeId);
       // Route driven also defaults to Back for the footer, Share is in header
       this.actionType = 'close';
       this.actionLabel = 'Back';
       this.actionIcon = 'arrow-back';
    } else {
       if (this.articleId) this.articleIdSignal.set(this.articleId);
       if (this.articleData) this.articleDataSignal.set(this.articleData);
    }
  }

  handleImgError = handleImageError;

  close() {
    if (this.isRouteDriven) {
        this.navCtrl.back();
    } else {
        this.modalCtrl.dismiss();
    }
  }

  openLightbox() {
    if (this.article()?.imageUrl) {
        this.isLightboxOpen.set(true);
    }
  }

  closeLightbox() {
    this.isLightboxOpen.set(false);
  }

  async handleAction() {
    const type = this.actionType;

    switch (type) {
        case 'internal':
            if (this.targetUrl) {
                if (!this.isRouteDriven && this.targetType && this.targetUrl) {
                    await this.openStackedModal(this.targetType, this.targetUrl);
                } else {
                    this.modalCtrl.dismiss();
                    this.router.navigateByUrl(this.targetUrl);
                }
            }
            break;
        case 'external':
            if (this.targetUrl) {
                window.open(this.targetUrl, '_system');
            }
            break;
        case 'share':
            await this.share();
            break;
        case 'close':
        default:
            this.close();
            break;
    }
  }

  async navigateToSource() {
    // Specifically handle the header click navigation
    // This typically mirrors the footer action if it's 'internal', but specifically checks targetUrl
    if (this.targetUrl) {
        if (this.actionType === 'internal' || this.targetType) {
             if (!this.isRouteDriven && this.targetType) {
                await this.openStackedModal(this.targetType, this.targetUrl);
             } else {
                this.modalCtrl.dismiss();
                this.router.navigateByUrl(this.targetUrl);
             }
        } else if (this.actionType === 'external') {
             window.open(this.targetUrl, '_system');
        }
    }
  }

  async openStackedModal(type: string, idOrUrl: string) {
    let component: any;
    let props: any = {};

    // Extract ID if a full URL path is provided (e.g., /business/biz-001 -> biz-001)
    let cleanId = idOrUrl;
    if (idOrUrl.includes('/')) {
        const parts = idOrUrl.split('/');
        // Filter out empty strings in case of trailing slash
        const segments = parts.filter(p => p.length > 0);
        if (segments.length > 0) {
            cleanId = segments[segments.length - 1];
        }
    }

    switch (type) {
        case 'business':
        case 'restaurant':
            component = BusinessDetailComponent;
            props = { businessId: cleanId };
            break;
        case 'event':
            component = EventDetailComponent;
            props = { eventId: cleanId };
            break;
        case 'job':
            component = JobDetailComponent;
            props = { jobId: cleanId };
            break;
        case 'news':
            component = NewsDetailComponent;
            props = { articleId: cleanId };
            break;
        default:
            this.modalCtrl.dismiss();
            this.router.navigateByUrl(this.targetUrl || '');
            return;
    }

    const modal = await this.modalCtrl.create({
        component,
        componentProps: props
    });
    await modal.present();
  }

  async share() {
    const article = this.article();
    if (!article) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description || article.title,
          url: window.location.href
        });
      } catch (err) {
        // Share cancelled, no op
      }
    } else {
        const toast = await this.toastCtrl.create({
          message: 'Sharing is not supported on this device.',
          duration: 3000,
          color: 'danger',
          icon: 'alert-circle',
          position: 'top',
          cssClass: 'toast-custom-text'
        });
        await toast.present();
    }
  }
}
