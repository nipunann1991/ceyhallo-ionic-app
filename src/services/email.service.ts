
import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private firestoreService: FirestoreService) {}

  async sendWelcomeEmail(email: string, name: string) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to CeyHallo!</title>
  <style>body { font-family: 'Inter', sans-serif; background-color: #F2F4F7; padding: 20px; }</style>
</head>
<body>
  <h1>Welcome, ${name}!</h1>
  <p>Thank you for joining CeyHallo! Explore local events, find job opportunities, and discover Sri Lankan businesses.</p>
</body>
</html>`;

    try {
      await this.firestoreService.addDocument('email_queue', {
        target: { audience: 'test', testEmail: email },
        subject: `Welcome to CeyHallo! 🇱🇰`,
        htmlContent: htmlContent,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      // Silent fail or log warning for permissions
      console.warn('Email service: Could not queue welcome email (Permission/Demo).');
    }
  }

  async sendGoodbyeEmail(email: string, name: string) {
    const htmlContent = `<h1>We're sorry to see you go, ${name}</h1>`;
    try {
      await this.firestoreService.addDocument('email_queue', {
        target: { audience: 'test', testEmail: email },
        subject: `We're sorry to see you go`,
        htmlContent: htmlContent,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Email service: Could not queue goodbye email (Permission/Demo).');
    }
  }

  async sendRecoveryCode(email: string, code: string) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset Password</title>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F2F4F7; padding: 0; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; margin-top: 40px; }
    .code { font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #083594; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #1A1C1E; margin-top: 0;">Reset Password</h1>
    <p style="color: #4B5563;">You requested to reset your password. Use the code below to verify your identity.</p>
    
    <div class="code">${code}</div>
    
    <p style="color: #4B5563; font-size: 12px;">If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>`;

    try {
      await this.firestoreService.addDocument('email_queue', {
        target: {
            audience: 'test',
            testEmail: email
        },
        subject: `Your Verification Code: ${code}`,
        htmlContent: htmlContent,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      // Handle "Missing or insufficient permissions" for demo environment
      if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
          console.warn('Email not sent due to backend permissions.');
          return; // Allow flow to proceed
      }
      // FIX: Log only the error message to avoid circular structure errors
      console.error('Failed to queue recovery email:', error.message || 'Unknown error');
      throw error;
    }
  }
}
