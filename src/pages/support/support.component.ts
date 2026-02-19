
import { Component, ChangeDetectionStrategy, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { SupportInfo } from '../../models/support.model';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class SupportComponent {
  supportInfo: Signal<SupportInfo | null>;
  
  // Accordion state
  openFaqId = signal<string | null>(null);

  constructor(
    private dataService: DataService,
    private navCtrl: NavController
  ) {
    this.supportInfo = this.dataService.getSupportInfo();
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
}
