import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Event } from '../../models/event.model';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
  host: {
    'class': 'block'
  }
})
export class EventCardComponent {
  event = input.required<Event>();
  handleImgError = handleImageError;
}