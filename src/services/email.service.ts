import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';

type EmailTemplate = 'SIGNUP' | 'GOODBYE' | 'RECOVERY';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private firestoreService: FirestoreService) {}

  private buildEmailQueueDocument(
    email: string,
    template: EmailTemplate,
    htmlContent: string
  ) {
    return {
      htmlContent,
      status: 'pending',
      channel: 'email',
      provider: 'smtp',
      createdAt: new Date().toISOString(),
      target: {
        audience: 'singleUser',
        testEmail: email,
        template,
      },
    };
  }

  async sendWelcomeEmail(email: string, name: string) {
    try {
      await this.firestoreService.addDocument(
        'email_queue',
        this.buildEmailQueueDocument(email, 'SIGNUP', name)
      );
    } catch {
      console.warn('Email service: Could not queue welcome email.');
    }
  }

  async sendGoodbyeEmail(email: string, name: string) {
    try {
      await this.firestoreService.addDocument(
        'email_queue',
        this.buildEmailQueueDocument(email, 'GOODBYE', name)
      );
    } catch {
      console.warn('Email service: Could not queue goodbye email.');
    }
  }

  async sendRecoveryCode(email: string, code: string) {
    try {
      await this.firestoreService.addDocument(
        'email_queue',
        this.buildEmailQueueDocument(email, 'RECOVERY', code)
      );
    } catch (error: any) {
      if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
        console.warn('Email not sent due to backend permissions.');
        return;
      }

      console.error('Failed to queue recovery email:', error.message || 'Unknown error');
      throw error;
    }
  }
}