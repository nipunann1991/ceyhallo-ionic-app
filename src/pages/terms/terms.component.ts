import { Component, ChangeDetectionStrategy, Input, Signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { LegalDocument } from '../../models/legal.model';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent {
  private dataService = inject(DataService);
  private navCtrl = inject(NavController);

  @Input() docId = 'terms';

  legalDoc: Signal<LegalDocument | undefined>;

  constructor() {
    this.legalDoc = computed(() => {
      return this.dataService.getLegalDocs()().find(d => d.id === this.docId);
    });
  }

  goBack() {
    this.navCtrl.navigateBack('/tabs/profile');
  }
}
