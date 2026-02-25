import { Component, ChangeDetectionStrategy, Input, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { LegalDocument } from '../../models/legal.model';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent {
  @Input() docId = 'terms-and-conditions';

  legalDoc: Signal<LegalDocument | undefined>;

  constructor(private dataService: DataService) {
    this.legalDoc = computed(() => {
      return this.dataService.getLegalDocs()().find(d => d.id === this.docId);
    });
  }
}
