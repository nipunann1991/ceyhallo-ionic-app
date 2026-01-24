import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { NewsArticle } from '../../models/news.model';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { FeaturedBannerComponent } from '../../components/featured-banner/featured-banner.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, NewsCardComponent, FeaturedBannerComponent, PageHeaderComponent],
})
export class NewsComponent implements OnInit {
  private dataService = inject(DataService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);

  // This public property is set by Ionic's ModalController via componentProps
  public isModal = false;
  readonly isModalSignal = signal(false);

  // Data Source
  allNews = this.dataService.getNews();

  // Component State
  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10); // Pagination limit, default 10

  // Static Categories for the Filter Chips
  categories = signal(['All', 'General', 'Business', 'Tech', 'Community', 'Lifestyle', 'Food', 'Travel', 'Health', 'Sports']);

  // Drag Scroll Logic
  categoryContainer = viewChild<ElementRef>('categoryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  // Computed: Featured Article (Top Banner)
  // We take the first item as the featured one for the 'All' view
  featuredArticle = computed(() => {
    const news = this.allNews();
    if (news.length === 0) return null;
    return news[0]; // Logic: Most recent is featured
  });

  // Computed: Filtered News List
  filteredNews = computed(() => {
    let news = this.allNews();
    const cat = this.selectedCategory();
    const term = this.searchTerm().toLowerCase();
    const featured = this.featuredArticle();

    // 1. Filter by Category
    if (cat !== 'All') {
      news = news.filter(a => (a.category || 'General').toLowerCase() === cat.toLowerCase());
    }

    // 2. Filter by Search
    if (term) {
      news = news.filter(a => a.title.toLowerCase().includes(term));
    }

    // 3. Exclude Featured Article if it's currently being shown in the banner
    // (Only happens when Category is All and Search is empty)
    if (cat === 'All' && !term && featured) {
      news = news.filter(a => a.id !== featured.id);
    }

    return news;
  });

  // Computed: Displayed News (Paginated)
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
    this.limit.set(10); // Reset pagination
  }

  handleSearch(value: string) {
    this.searchTerm.set(value);
    this.limit.set(10); // Reset pagination
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
    
    // Simulate a small delay for better UX or simply load next batch
    setTimeout(() => {
      this.limit.update(currentLimit => currentLimit + 10);
      infiniteScroll.target.complete();
    }, 500);
  }

  // Drag Methods
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
      const walk = (x - this.startX) * 2; // Scroll speed
      slider.scrollLeft = this.scrollLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isDragging = true;
      }
    }
  }
}