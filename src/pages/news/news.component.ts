import { Component, ChangeDetectionStrategy, OnInit, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { NewsArticle } from '../../models/news.model';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { FeaturedBannerComponent } from '../../components/featured-banner/featured-banner.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, NewsCardComponent, FeaturedBannerComponent, PageHeaderComponent],
})
export class NewsComponent implements OnInit {
  // Use constructor injection
  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {}

  public isModal = false;
  readonly isModalSignal = signal(false);

  allNews = this.dataService.getNews();

  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10);

  categories = signal(['All', 'General', 'Business', 'Tech', 'Community', 'Lifestyle', 'Food', 'Travel', 'Health', 'Sports']);

  categoryContainer = viewChild<ElementRef>('categoryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  featuredArticle = computed(() => {
    const news = this.allNews();
    if (news.length === 0) return null;
    return news[0];
  });

  filteredNews = computed(() => {
    let news = this.allNews();
    const cat = this.selectedCategory();
    const term = this.searchTerm().toLowerCase();
    const featured = this.featuredArticle();

    if (cat !== 'All') {
      news = news.filter(a => (a.category || 'General').toLowerCase() === cat.toLowerCase());
    }

    if (term) {
      news = news.filter(a => a.title.toLowerCase().includes(term));
    }

    if (cat === 'All' && !term && featured) {
      news = news.filter(a => a.id !== featured.id);
    }

    return news;
  });

  displayedNews = computed(() => {
    return this.filteredNews().slice(0, this.limit());
  });

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
  }

  setCategory(cat: string) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.selectedCategory.set(cat);
    this.limit.set(10);
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
        articleId: article.id,
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