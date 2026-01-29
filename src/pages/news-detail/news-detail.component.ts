import { Component, ChangeDetectionStrategy, computed, signal, OnInit, Input } from '@angular/core';
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
  // Use constructor injection
  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}
  
  @Input() articleId?: string;
  @Input() articleData?: NewsArticle;
  @Input() actionType: 'share' | 'external' | 'internal' | 'close' = 'share';
  @Input() actionLabel: string = 'Share Article';
  @Input() actionIcon: string = 'share-social';
  @Input() targetUrl?: string;
  @Input() targetType?: 'news' | 'business' | 'restaurant' | 'event' | 'job';

  private readonly articleIdSignal = signal<string | undefined>(undefined);
  private readonly articleDataSignal = signal<NewsArticle | undefined>(undefined);
  
  private isRouteDriven = false;

  article = computed(() => {
    const directData = this.articleDataSignal();
    if (directData) return directData;

    const id = this.articleIdSignal();
    if (id === undefined) return undefined;
    return this.dataService.getNews()().find(a => a.id === id);
  });

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
       this.isRouteDriven = true;
       this.articleIdSignal.set(routeId);
       this.actionType = 'share';
       this.actionLabel = 'Share Article';
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

  async openStackedModal(type: string, id: string) {
    let component: any;
    let props: any = {};

    switch (type) {
        case 'business':
        case 'restaurant':
            component = BusinessDetailComponent;
            props = { businessId: id };
            break;
        case 'event':
            component = EventDetailComponent;
            props = { eventId: id };
            break;
        case 'job':
            component = JobDetailComponent;
            props = { jobId: id };
            break;
        case 'news':
            component = NewsDetailComponent;
            props = { articleId: id };
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
        console.log('Share canceled');
      }
    } else {
        const toast = await this.toastCtrl.create({
          message: 'Sharing is not supported on this device.',
          duration: 2000,
          color: 'medium',
          position: 'bottom'
        });
        await toast.present();
    }
  }
}