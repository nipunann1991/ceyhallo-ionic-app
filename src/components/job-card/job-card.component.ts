import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Job } from '../../models/job.model';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-job-card',
  templateUrl: './job-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
  host: {
    'class': 'block'
  }
})
export class JobCardComponent {
  job = input.required<Job>();
  handleImgError = handleImageError;
}
