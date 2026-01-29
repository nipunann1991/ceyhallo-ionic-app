import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { NewsArticle } from '../../models/news.model';
import { Business } from '../../models/business.model';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { BusinessCardComponent } from '../../components/business-card/business-card.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';

type SearchResult = (NewsArticle & { type: 'news' }) | (Business & { type: 'business' | 'restaurant' });

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, PageHeaderComponent, NewsCardComponent, BusinessCardComponent],
})
export class SearchComponent implements OnInit {
  // Use constructor injection for dependencies
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

  private allContent = computed(() => {
    const news: SearchResult[] = this.dataService.getNews()().map(item => ({ ...item, type: 'news' }));
    const businesses: SearchResult[] = this.dataService.getBusinesses()().map(item => ({ ...item, type: 'business' }));
    const restaurants: SearchResult[] = this.dataService.getRestaurants()().map(item => ({ ...item, type: 'restaurant' }));
    return [...news, ...businesses, ...restaurants];
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
      } else {
        const nameMatch = (item.name || '').toLowerCase().includes(term);
        const categoryMatch = (item.category || '').toLowerCase().includes(term);
        const locationMatch = (item.location || '').toLowerCase().includes(term);
        return nameMatch || categoryMatch || locationMatch;
      }
    });

    const groups: { [key: string]: SearchResult[] } = {
      'News': [],
      'Restaurants': [],
      'Businesses': []
    };

    for (const item of filtered) {
      if (item.type === 'news') {
        groups['News'].push(item);
      } else if (item.type === 'restaurant') {
        groups['Restaurants'].push(item);
      } else {
        groups['Businesses'].push(item);
      }
    }

    const expanded = this.expandedCategories();

    return Object.entries(groups)
      .map(([category, results]) => {
        const totalCount = results.length;
        const isExpanded = expanded.has(category);
        const visibleResults = isExpanded ? results : results.slice(0, 5);
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
    if (!this.authService.isLoggedIn()) {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: { 
          isModal: true,
          message: 'Please login to view all explore features of CeyHallo app'
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
}