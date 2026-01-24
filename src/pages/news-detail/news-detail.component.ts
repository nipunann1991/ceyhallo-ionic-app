import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { NewsArticle } from '../../models/news.model';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class NewsDetailComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private dataService = inject(DataService);
  
  public articleId?: string;
  public articleData?: NewsArticle;

  private readonly articleIdSignal = signal<string | undefined>(undefined);
  private readonly articleDataSignal = signal<NewsArticle | undefined>(undefined);
  
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
    if (this.articleId) this.articleIdSignal.set(this.articleId);
    if (this.articleData) this.articleDataSignal.set(this.articleData);
  }

  handleImgError = handleImageError;

  close() {
    this.modalCtrl.dismiss();
  }
}