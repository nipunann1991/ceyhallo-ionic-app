import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NewsComponent } from '../news/news.component';
import { SearchComponent } from '../search/search.component';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styles: [`
    ion-tab-bar {
      --background: #ffffff;
      border-top: 1px solid #F3F4F6;
      /* Taller tab bar with balanced padding */
      height: calc(4rem + env(safe-area-inset-bottom));
      box-shadow: 0 -4px 20px rgba(0,0,0,0.02);
    }

    /* Adjustments for iPhone to handle home indicator spacing gracefully */
    :host-context(.is-iphone) ion-tab-bar {
      padding-bottom: 20px;
      height: 4rem;
    }

    ion-tab-button {
      --color: #9CA3AF;
      /* Default color-selected will be managed inline to support override */
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
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
})
export class TabsComponent implements OnInit {
  private modalCtrl: ModalController = inject(ModalController);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Track the active tab manually to handle both Routes (Home, Profile) and Modals (Search, News)
  activeTab = signal<string>('home');

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveTab(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    this.updateActiveTab(this.router.url);
  }

  private updateActiveTab(url: string) {
    if (url.includes('/tabs/profile')) {
      this.activeTab.set('profile');
    } else if (url.includes('/tabs/home')) {
      this.activeTab.set('home');
    }
  }

  async openNewsModal() {
    this.activeTab.set('news'); // Force active state for News
    const modal = await this.modalCtrl.create({
      component: NewsComponent,
      componentProps: {
        isModal: true,
      },
    });
    await modal.present();
    await modal.onDidDismiss();
    this.updateActiveTab(this.router.url); // Restore state based on route
  }

  async openSearchModal() {
    this.activeTab.set('search'); // Force active state for Search
    const modal = await this.modalCtrl.create({
      component: SearchComponent,
      componentProps: {
        isModal: true,
      },
    });
    await modal.present();
    await modal.onDidDismiss();
    this.updateActiveTab(this.router.url); // Restore state based on route
  }

  async handleProfileClick() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tabs/profile']);
    } else {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: {
          isModal: true
        }
      });
      await modal.present();
    }
  }
}