
import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NewsArticle } from '../../models/news.model';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-news-card',
  templateUrl: './news-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
  host: {
    'class': 'block'
  }
})
export class NewsCardComponent {
  newsItem = input.required<NewsArticle>();
  isImageLoaded = signal(false);

  handleImgError = handleImageError;

  onImageLoad() {
    this.isImageLoaded.set(true);
  }
}
