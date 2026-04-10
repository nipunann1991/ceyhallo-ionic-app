
import { Injectable, signal, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { ToastController } from '@ionic/angular';
import { auth } from './firebase.service';
import { extractNotificationLink } from '../utils/notification.utils';

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
  ) {
    onAuthStateChanged(auth, (user) => {
      const token = this.fcmToken();
      if (user && token) {
        void this.saveTokenToFirestore(token);
      }
    });
  }

  async initPush() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await this.addListeners();
      await this.registerNotifications();
    } catch (e: any) {
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
      console.error('Error getting FCM token:', error.message || 'Unknown error');
    }

    try {
      await FirebaseMessaging.subscribeToTopic({ topic: 'general' });
    } catch (e: any) {
      console.error('Topic subscription failed:', e.message || 'Unknown error');
    }
  }

  private async addListeners() {
    await FirebaseMessaging.removeAllListeners();

    await FirebaseMessaging.addListener('apnsTokenReceived', async () => {
      await this.refreshFcmToken();
    });

    await FirebaseMessaging.addListener('tokenReceived', async (event) => {
      if (!event.token) {
        return;
      }

      this.fcmToken.set(event.token);
      await this.saveTokenToFirestore(event.token);
    });

    await FirebaseMessaging.addListener('notificationReceived', async (event) => {
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
              const link = extractNotificationLink(data || {});
              if (link) {
                this.navigate(link);
              }
            }
          }
        ]
      });
      await toast.present();
    });

    await FirebaseMessaging.addListener('notificationActionPerformed', async (event) => {
      const notification = event.notification;
      const data = notification.data as any;
      const link = extractNotificationLink(data || {});

      if (link) {
        this.navigate(link);
      }
    });
  }

  private async refreshFcmToken() {
    try {
      const result = await FirebaseMessaging.getToken();
      if (!result.token) {
        return;
      }

      this.fcmToken.set(result.token);
      await this.saveTokenToFirestore(result.token);
    } catch (error: any) {
      console.error('Error refreshing FCM token:', error.message || 'Unknown error');
    }
  }

  private navigate(routeId: string) {
    this.ngZone.run(() => {
      let route = routeId;
      // Handle hash-style URLs if passed directly (common in copy-paste)
      if (route.startsWith('/#')) {
        route = route.substring(2);
      } else if (route.startsWith('#')) {
        route = route.substring(1);
      }
      
      this.router.navigateByUrl(route);
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
