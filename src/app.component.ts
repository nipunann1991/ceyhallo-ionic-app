
import { Component, ChangeDetectionStrategy, NgZone, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import { DataService } from './services/data.service';
import { PushNotificationService } from './services/push-notifications.service';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';

const FACEBOOK_APP_ID = '1273168304320582';
const FACEBOOK_CLIENT_TOKEN = '446d552b822383774784d672ea6ebda5';
const APPLE_CLIENT_ID = 'MY_VALUE_APPLE_CLIENT_ID';
const GOOGLE_WEB_CLIENT_ID = '253346274750-2s39r743nn8qe887vbl55den44ej02v4.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '253346274750-m3pvrbnti009lkdqnc05tfo835vs8g2g.apps.googleusercontent.com';

@Component({
  selector: 'app-root',
  template: `
<ion-app>
  <ion-router-outlet></ion-router-outlet>

  <!-- AI Chat Floating Button -->
  @if (!isMaintenanceMode() && showAiBot()) {
    <div class="fixed bottom-[5.5rem] right-4 z-50 animate-bounce-in">
      <button 
        (click)="openAiChat()"
        class="w-14 h-14 rounded-full bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/40 flex items-center justify-center active:scale-90 transition-transform group">
        <ion-icon name="sparkles" class="text-2xl group-hover:rotate-12 transition-transform"></ion-icon>
      </button>
    </div>
  }

  @if (isMaintenanceMode()) {
    <style>
      @keyframes slow-dot-pulse {
        0%, 100% { opacity: 0.4; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      .dot {
        animation: slow-dot-pulse 1.8s infinite ease-in-out both;
      }
    </style>

    <!-- Global Maintenance Overlay -->
    <div class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
       <!-- Alert Box -->
       <div class="bg-white rounded-3xl p-8 w-full max-w-xs text-center shadow-2xl relative overflow-hidden">
          
          <!-- Logo -->
          <div class="flex flex-col items-center mb-6">
             <ion-img src="/assets/logo.png" alt="CeyHallo Logo" class="h-24 object-contain"></ion-img>
          </div>
          
          <h2 class="text-xl font-bold text-[#1A1C1E] mb-3 tracking-tight">Under Maintenance</h2>
          
          <p class="text-gray-600 text-[0.9rem] font-medium leading-[1.15rem] mb-6">
            The app is under maintenance and will be available shortly.
          </p>

          <!-- Loader -->
          <div class="inline-flex items-baseline justify-center">
             <span class="text-sm font-bold text-[#083594] tracking-wide mr-1.5">Please Wait</span>
             <div class="flex gap-1">
                <div class="w-1 h-1 bg-[#083594] rounded-full dot" style="animation-delay: 0s"></div>
                <div class="w-1 h-1 bg-[#083594] rounded-full dot" style="animation-delay: 0.3s"></div>
                <div class="w-1 h-1 bg-[#083594] rounded-full dot" style="animation-delay: 0.6s"></div>
             </div>
          </div>
       </div>
    </div>
  }
</ion-app>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CommonModule]
})
export class AppComponent implements OnInit {
  private dataService = inject(DataService);
  private pushService = inject(PushNotificationService);
  private platform = inject(Platform);
  private modalCtrl: ModalController = inject(ModalController);

  isMaintenanceMode = computed(() => {
    return !!this.dataService.getAppSettings()()?.maintenanceMode;
  });

  showAiBot = computed(() => {
    return !!this.dataService.getAppSettings()()?.showAiBot;
  });

  constructor(private router: Router, private zone: NgZone) {
    // Detect if the device is an iPhone and apply a specific class to the html element
    const isIphone = /iPhone/i.test(navigator.userAgent);
    if (isIphone) {
      document.documentElement.classList.add('is-iphone');
    }
  }

  ngOnInit() {
    void this.initializeApp();
  }

  async initializeApp(): Promise<void> {
    await this.platform.ready();
    await this.initializeSocialLogin();
    await this.initializeFacebookLogin();

    // Listen for deep links (e.g., from Firebase Reset Email)
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        try {
          const url = new URL(event.url);
          // Firebase sends action links like: https://ceyhallo.com/__/auth/action?mode=resetPassword&oobCode=...
          
          const mode = url.searchParams.get('mode'); // resetPassword, verifyEmail, etc.
          const oobCode = url.searchParams.get('oobCode');

          if (mode === 'resetPassword' && oobCode) {
            this.router.navigate(['/reset-password'], { queryParams: { oobCode } });
          }
          // You can handle verifyEmail mode here as well if needed
        } catch (e) {
          console.error('Error parsing deep link', e);
        }
      });
    });

    void this.pushService.initPush();
  }

  private async initializeSocialLogin(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (platform !== 'ios' && platform !== 'android') {
      return;
    }

    try {
      const appleConfigured = !APPLE_CLIENT_ID.startsWith('MY_VALUE_');
      const googleConfig =
        platform === 'android'
          ? {
              webClientId: GOOGLE_WEB_CLIENT_ID,
            }
          : {
              iOSClientId: GOOGLE_IOS_CLIENT_ID,
              iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
              mode: 'online' as const,
            };

      await SocialLogin.initialize({
        ...(platform === 'android'
          ? {
              facebook: {
                appId: FACEBOOK_APP_ID,
                clientToken: FACEBOOK_CLIENT_TOKEN,
              },
            }
          : {}),
        ...(platform === 'ios' && appleConfigured
          ? {
              apple: {
                clientId: APPLE_CLIENT_ID,
              },
            }
          : {}),
        google: googleConfig,
      });
    } catch (error) {
      console.error('SocialLogin initialization failed:', error);
    }
  }

  private async initializeFacebookLogin(): Promise<void> {
    const facebookConfigured =
      !FACEBOOK_APP_ID.startsWith('MY_VALUE_') &&
      !FACEBOOK_CLIENT_TOKEN.startsWith('MY_VALUE_');

    if (!facebookConfigured) {
      return;
    }

    try {
      await FacebookLogin.initialize({
        appId: FACEBOOK_APP_ID,
      });
    } catch (error) {
      console.error('FacebookLogin initialization failed:', error);
    }
  }

  async openAiChat() {
    const modal = await this.modalCtrl.create({
      component: AiChatComponent
      // Removed breakpoints to default to full screen modal behavior
    });
    await modal.present();
  }
}
