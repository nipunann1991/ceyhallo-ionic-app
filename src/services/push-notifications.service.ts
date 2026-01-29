import { Injectable, inject, signal, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
// Replaced with the Gradle 8 compatible plugin maintained by Capawesome
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private toastCtrl: ToastController = inject(ToastController);
  private router: Router = inject(Router);
  private ngZone: NgZone = inject(NgZone);

  // Expose the token for the UI (Settings page)
  fcmToken = signal<string>('');

  constructor() {}

  async initPush() {
    // Push notifications only work on native devices (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are only available on native devices.');
      return;
    }

    try {
      // Initialize listeners immediately so we catch any pending actions
      this.addListeners();
      // Then attempt registration (permissions/token)
      await this.registerNotifications();
    } catch (e: any) {
      console.error('Error initializing push notifications:', e.message || e);
    }
  }

  private async registerNotifications() {
    // 1. Check Permissions
    let permStatus = await FirebaseMessaging.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await FirebaseMessaging.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied permissions!');
      return;
    }

    // 2. Get the Token directly
    try {
      const result = await FirebaseMessaging.getToken();
      if (result.token) {
        console.log('FCM Token:', result.token);
        this.fcmToken.set(result.token);
        await this.saveTokenToFirestore(result.token);
      }
    } catch (error: any) {
      console.error('Error getting FCM token:', error.message || error);
    }

    // 3. Subscribe to general topic
    try {
        await FirebaseMessaging.subscribeToTopic({ topic: 'general' });
        console.log('Subscribed to general topic');
    } catch (e: any) {
        console.error('Topic subscription failed:', e.message || e);
    }
  }

  private addListeners() {
    // 1. Remove old listeners to avoid duplicates
    FirebaseMessaging.removeAllListeners();

    // 2. Show local notification when app is open (Foreground)
    FirebaseMessaging.addListener('notificationReceived', async (event) => {
      console.log('Push notification received'); // FIX: Avoid logging 'event' to prevent circular errors
      const notification = event.notification;
      
      const toast = await this.toastCtrl.create({
        header: notification.title,
        message: notification.body,
        duration: 4000,
        position: 'top',
        color: 'dark',
        buttons: [
          {
            text: 'Open',
            role: 'info',
            handler: () => {
              const data = notification.data as any;
              if (data?.routeId) {
                // Run navigation inside Angular's zone
                this.ngZone.run(() => {
                  this.router.navigateByUrl(data.routeId);
                });
              }
            }
          }
        ]
      });
      await toast.present();
    });

    // 3. Handle action (tapping the notification from system tray)
    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      console.log('Push action performed'); // FIX: Avoid logging 'event' to prevent circular errors
      
      const notification = event.notification;
      const data = notification.data as any;
      
      if (data?.routeId) {
        // Run navigation inside Angular's zone
        this.ngZone.run(() => {
          this.router.navigateByUrl(data.routeId);
        });
      }
    });
  }

  private async saveTokenToFirestore(token: string) {
    const user = this.authService.currentUser();
    if (user) {
      try {
        await this.firestoreService.updateDocument('users', user.uid, {
          fcmToken: token,
          lastLogin: new Date().toISOString()
        });
      } catch (error: any) {
        console.error('Error saving FCM token to Firestore:', error.message || error);
      }
    }
  }
}