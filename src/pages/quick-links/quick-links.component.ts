
import { Component, ChangeDetectionStrategy, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { HubSection, HubItem } from '../../models/hub.model';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-quick-links',
  templateUrl: './quick-links.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    .hub-header {
      padding-top: calc(4rem + env(safe-area-inset-top));
    }
    :host-context(.plt-android) .hub-header {
      padding-top: calc(2rem + env(safe-area-inset-top));
    }
    ion-content::part(scroll) {
      padding-bottom: inherit;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterLink],
})
export class QuickLinksComponent {
  private dataService = inject(DataService);
  private router: Router = inject(Router);

  sections: Signal<HubSection[]>;
  handleImgError = handleImageError;

  constructor() {
    this.sections = this.dataService.getHubSections();
  }

  handleItemClick(item: HubItem) {
    switch (item.actionType) {
      case 'url':
        window.open(item.actionValue, '_system');
        break;
      case 'call':
        window.open(`tel:${item.actionValue}`, '_system');
        break;
      case 'email':
        window.open(`mailto:${item.actionValue}`, '_system');
        break;
      case 'route':
        if (item.actionValue) {
          this.router.navigateByUrl(item.actionValue);
        }
        break;
    }
  }
}
