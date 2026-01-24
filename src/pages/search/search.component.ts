import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit } from '@angular/core';
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

// A type to unify search results for the template
type SearchResult = (NewsArticle & { type: 'news' }) | (Business & { type: 'business' | 'restaurant' });

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, PageHeaderComponent, NewsCardComponent, BusinessCardComponent],
})
export class SearchComponent implements OnInit {
  private dataService = inject(DataService);
  private modalCtrl: ModalController = inject(ModalController);
  private navCtrl = inject(NavController);

  // This public property is set by Ionic's ModalController via componentProps
  public isModal = false;

  // We use an internal signal that we set once `isModal` is available.
  readonly isModalSignal = signal(false);

  searchTerm = signal('');
  expandedCategories = signal<Set<string>>(new Set());

  // Combine news and events into a single computed signal for searching
  private allContent = computed(() => {
    const news: SearchResult[] = this.dataService.getNews()().map(item => ({ ...item, type: 'news' }));
    const businesses: SearchResult[] = this.dataService.getBusinesses()().map(item => ({ ...item, type: 'business' }));
    const restaurants: SearchResult[] = this.dataService.getRestaurants()().map(item => ({ ...item, type: 'restaurant' }));
    return [...news, ...businesses, ...restaurants];
  });

  // Filter the combined content based on the search term and group it
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
      } else { // business or restaurant
        const nameMatch = (item.name || '').toLowerCase().includes(term);
        const categoryMatch = (item.category || '').toLowerCase().includes(term);
        const locationMatch = (item.location || '').toLowerCase().includes(term);
        return nameMatch || categoryMatch || locationMatch;
      }
    });

    // Group the filtered results
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

    // Convert to an array, filter empty groups, and apply pagination logic
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
    // When the component initializes, `isModal` will have been set.
    // We now set our internal signal to make our component reactive.
    this.isModalSignal.set(this.isModal);
  }

  handleImgError = handleImageError;

  handleSearch(value: string) {
    this.searchTerm.set(value);
    this.expandedCategories.set(new Set()); // Reset on new search
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