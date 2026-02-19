
import { Component, ChangeDetectionStrategy, OnInit, signal, computed, viewChild, ElementRef, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { NewsArticle } from '../../models/news.model';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { Banner } from '../../models/banner.model';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, NewsCardComponent, BannerComponent, PageHeaderComponent],
})
export class NewsComponent implements OnInit {
  public isModal = false;
  readonly isModalSignal = signal(false);

  allNews: Signal<NewsArticle[]>;

  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10);
  isLoading = signal(true); // Initial loading state

  categories = signal(['All', 'General', 'Business', 'Tech', 'Community', 'Lifestyle', 'Food', 'Travel', 'Health', 'Sports']);

  categoryContainer = viewChild<ElementRef>('categoryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  featuredBanners: Signal<Banner[]>;
  filteredNews: Signal<NewsArticle[]>;
  displayedNews: Signal<NewsArticle[]>;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.allNews = this.dataService.getNews();

    this.featuredBanners = computed(() => {
        const list = this.allNews();
        let featured = list.filter(n => n.isFeatured);
        if (featured.length === 0 && list.length > 0) {
           featured = list.slice(0, 3);
        }
    
        return featured.map(n => ({
          id: n.id,
          category: n.category || 'News',
          title: n.title,
          description: n.description,
          image: n.imageUrl,
          targetId: n.id,
          targetType: 'news',
          navigationType: 'internal'
        }));
    });

    this.filteredNews = computed(() => {
        let news = this.allNews();
        const cat = this.selectedCategory();
        const term = this.searchTerm().toLowerCase();
    
        if (cat !== 'All') {
          news = news.filter(a => (a.category || 'General').toLowerCase() === cat.toLowerCase());
        }
    
        if (term) {
          news = news.filter(a => a.title.toLowerCase().includes(term));
        }
    
        return news;
    });

    this.displayedNews = computed(() => {
        return this.filteredNews().slice(0, this.limit());
    });
  }

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
    
    // Simulate initial loading delay to show off skeletons
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  setCategory(cat: string) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.isLoading.set(true);
    this.selectedCategory.set(cat);
    this.limit.set(10);
    // Simulate loading for category switch
    setTimeout(() => {
        this.isLoading.set(false);
    }, 500);
  }

  handleSearch(value: string) {
    this.searchTerm.set(value);
    this.limit.set(10);
  }

  handleImgError = handleImageError;

  goBack() {
    if (this.isModalSignal()) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.back();
    }
  }

  async openArticle(article: NewsArticle) {
    await this.openArticleDetail(article.id);
  }

  async handleBannerClick(banner: Banner) {
    if (banner.targetId) {
        await this.openArticleDetail(banner.targetId);
    }
  }

  async openArticleDetail(id: string) {
    if (!this.authService.isLoggedIn()) {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: { isModal: true }
      });
      await modal.present();
      return;
    }

    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleId: id,
      },
    });
    await modal.present();
  }

  onIonInfinite(ev: any) {
    const infiniteScroll = ev as InfiniteScrollCustomEvent;
    setTimeout(() => {
      this.limit.update(currentLimit => currentLimit + 10);
      infiniteScroll.target.complete();
    }, 500);
  }

  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    const slider = this.categoryContainer()?.nativeElement;
    if (slider) {
      this.startX = e.pageX - slider.offsetLeft;
      this.scrollLeft = slider.scrollLeft;
    }
  }

  endDrag() {
    this.isDown = false;
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.categoryContainer()?.nativeElement;
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
