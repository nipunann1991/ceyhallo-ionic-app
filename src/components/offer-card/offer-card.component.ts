
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Offer } from '../../models/offer.model';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
  host: {
    'class': 'block'
  }
})
export class OfferCardComponent {
  offer = input.required<Offer>();
  handleImgError = handleImageError;
}
