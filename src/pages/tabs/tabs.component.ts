import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { NewsComponent } from '../news/news.component';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styles: [`
    ion-tab-bar {
      --background: #ffffff;
      border-top: 1px solid #F3F4F6;
      /* Taller tab bar with balanced padding */
      height: calc(60px + env(safe-area-inset-bottom));
      padding-top: 12px;
      padding-bottom: calc(12px + env(safe-area-inset-bottom));
      box-shadow: 0 -4px 20px rgba(0,0,0,0.02);
    }

    /* Adjustments for iPhone to handle home indicator spacing gracefully */
    :host-context(.is-iphone) ion-tab-bar {
      padding-bottom: 20px;
      height: 90px;
    }

    ion-tab-button {
      --color: #9CA3AF;
      --color-selected: #083594;
      background: transparent;
    }

    ion-tab-button ion-label {
      font-weight: 700;
      font-size: 0.7rem;
      margin-top: 4px;
      letter-spacing: 0.02em;
    }
    
    ion-tab-button svg {
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s;
    }

    /* Active State Animation */
    ion-tab-button.tab-selected svg {
      transform: translateY(-2px);
      /* Force color inheritance if not automatic */
      color: #083594; 
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
})
export class TabsComponent {
  // FIX: Explicitly type injected ModalController to resolve type inference issue.
  private modalCtrl: ModalController = inject(ModalController);

  async openNewsModal() {
    const modal = await this.modalCtrl.create({
      component: NewsComponent,
      componentProps: {
        isModal: true,
      },
    });
    await modal.present();
  }

  async openSearchModal() {
    const modal = await this.modalCtrl.create({
      component: SearchComponent,
      componentProps: {
        isModal: true,
      },
    });
    await modal.present();
  }
}