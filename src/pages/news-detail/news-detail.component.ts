import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsArticle } from '../../models/news.model';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';

// Import other detail components for dynamic stacking
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
  private modalCtrl: ModalController = inject(ModalController);
  private toastCtrl: ToastController = inject(ToastController);
  private dataService = inject(DataService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private navCtrl: NavController = inject(NavController);
  
  // Existing Inputs
  @Input() articleId?: string;
  @Input() articleData?: NewsArticle;

  // New Configuration Inputs
  @Input() actionType: 'share' | 'external' | 'internal' | 'close' = 'share';
  @Input() actionLabel: string = 'Share Article';
  @Input() actionIcon: string = 'share-social';
  @Input() targetUrl?: string;
  @Input() targetType?: 'news' | 'business' | 'restaurant' | 'event' | 'job';

  private readonly articleIdSignal = signal<string | undefined>(undefined);
  private readonly articleDataSignal = signal<NewsArticle | undefined>(undefined);
  
  // Determine if opened via route or modal
  private isRouteDriven = false;

  article = computed(() => {
    // If direct data is provided (e.g. from Banner), use it
    const directData = this.articleDataSignal();
    if (directData) return directData;

    // Otherwise lookup by ID from DataService
    const id = this.articleIdSignal();
    if (id === undefined) return undefined;
    return this.dataService.getNews()().find(a => a.id === id);
  });

  ngOnInit() {
    // Check for route params first
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
       this.isRouteDriven = true;
       this.articleIdSignal.set(routeId);
       // Default route-driven pages usually don't have custom actions unless specified,
       // here we default to share as per existing logic or hide action if needed.
       this.actionType = 'share';
       this.actionLabel = 'Share Article';
    } else {
       // Modal Inputs
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
                // If we are in a modal (Banner), we want to open the new page ON TOP of this one.
                // We use the targetType to decide which component to open.
                if (!this.isRouteDriven && this.targetType && this.targetUrl) {
                    await this.openStackedModal(this.targetType, this.targetUrl);
                } else {
                    // Fallback to routing if strict navigation is preferred or type unknown
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
            // Fallback for unknown types
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
          url: window.location.href // In a real app, this would be a deep link
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