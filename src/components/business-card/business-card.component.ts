import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Business } from '../../models/business.model';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-business-card',
  templateUrl: './business-card.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class BusinessCardComponent {
  business = input.required<Business>();
  layout = input<'card' | 'list'>('card');

  handleImgError = handleImageError;
}