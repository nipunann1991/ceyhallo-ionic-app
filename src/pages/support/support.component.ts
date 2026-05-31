
import { Component, ChangeDetectionStrategy, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { SupportInfo } from '../../models/support.model';
import { LegalDocument } from '../../models/legal.model';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class SupportComponent {
  supportInfo: Signal<SupportInfo | null>;
  legalDocs: Signal<LegalDocument[]>;
  
  // Accordion state
  openFaqId = signal<string | null>(null);

  constructor(
    private dataService: DataService,
    private navCtrl: NavController 
  ) {
    this.supportInfo = this.dataService.getSupportInfo();
    this.legalDocs = this.dataService.getLegalDocs();
  }

  toggleFaq(id: string) {
    if (this.openFaqId() === id) {
      this.openFaqId.set(null);
    } else {
      this.openFaqId.set(id);
    }
  }

  goBack() {
    this.navCtrl.navigateBack('/tabs/profile');
  }

  callSupport() {
    const info = this.supportInfo();
    if (info?.phone) {
        window.open(`tel:${info.phone}`, '_system');
    }
  }

  emailSupport() {
    const info = this.supportInfo();
    if (info?.email) {
        window.open(`mailto:${info.email}`, '_system');
    }
  }

  openLegal(id: string) {
    this.navCtrl.navigateForward(`/legal/${id}`);
  }
}
