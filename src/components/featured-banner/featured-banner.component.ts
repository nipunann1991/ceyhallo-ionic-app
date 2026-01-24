import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-featured-banner',
  templateUrl: './featured-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class FeaturedBannerComponent {
  imageUrl = input<string>('');
  title = input.required<string>();
  category = input.required<string>();
  variant = input<'news' | 'restaurant'>('news');

  handleImgError = handleImageError;
}