
import { Injectable, signal, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  fcmToken = signal<string>('');

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private toastCtrl: ToastController,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async initPush() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      this.addListeners();
      await this.registerNotifications();
    } catch (e: any) {
      // FIX: Safe error logging
      console.error('Error initializing push notifications:', e.message || 'Unknown error');
    }
  }

  private async registerNotifications() {
    let permStatus = await FirebaseMessaging.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await FirebaseMessaging.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied permissions!');
      return;
    }

    try {
      const result = await FirebaseMessaging.getToken();
      if (result.token) {
        this.fcmToken.set(result.token);
        await this.saveTokenToFirestore(result.token);
      }
    } catch (error: any) {
      // FIX: Safe error logging
      console.error('Error getting FCM token:', error.message || 'Unknown error');
    }

    try {
        await FirebaseMessaging.subscribeToTopic({ topic: 'general' });
    } catch (e: any) {
        // FIX: Safe error logging
        console.error('Topic subscription failed:', e.message || 'Unknown error');
    }
  }

  private addListeners() {
    FirebaseMessaging.removeAllListeners();

    FirebaseMessaging.addListener('notificationReceived', async (event) => {
      // FIX: Do not log the event object directly to avoid circular structure errors
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

    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      const notification = event.notification;
      const data = notification.data as any;
      
      if (data?.routeId) {
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
        // FIX: Safe error logging
        console.error('Error saving FCM token to Firestore:', error.message || 'Unknown error');
      }
    }
  }
}
