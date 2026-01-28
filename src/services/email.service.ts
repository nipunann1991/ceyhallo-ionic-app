import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private firestoreService = inject(FirestoreService);

  async sendWelcomeEmail(email: string, name: string) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <!--[if mso]>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
    <style>
      td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
    </style>
  <![endif]-->
  <title>Welcome to CeyHallo!</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" media="screen">
  <style>
    @media (max-width: 600px) {
      .sm-w-full {
        width: 100% !important;
      }
      .sm-px-6 {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
      .sm-py-8 {
        padding-top: 32px !important;
        padding-bottom: 32px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #F2F4F7;">
  <div style="font-family: 'Inter', sans-serif; mso-line-height-rule: exactly; display: none;">A message from CeyHallo</div>
  <div role="article" aria-roledescription="email" aria-label="Welcome to CeyHallo!" lang="en" style="font-family: 'Inter', sans-serif; mso-line-height-rule: exactly;">
    <table style="width: 100%; font-family: 'Inter', sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="mso-line-height-rule: exactly; background-color: #F2F4F7; padding-top: 24px; padding-bottom: 24px;">
          <table class="sm-w-full" style="width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="sm-py-8 sm-px-6" style="mso-line-height-rule: exactly; padding: 40px; text-align: center;">
                <a href="https://ceyhallo.com" target="_blank">
                  <img src="https://i.ibb.co/B5TnYXWN/logo.png" width="120" alt="CeyHallo" style="max-width: 100%; vertical-align: middle; line-height: 100%; border: 0;">
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" class="sm-px-6">
                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="sm-px-6" style="mso-line-height-rule: exactly; border-radius: 16px; background-color: #ffffff; padding: 40px; text-align: left; font-size: 0.815rem; line-height: 22px; color: #4B5563;">
                      <h1 style="margin-top: 0; margin-bottom: 24px; font-size: 1.25rem; font-weight: 700; line-height: 1.2; color: #1A1C1E;">
                        Welcome, ${name}!
                      </h1>
                      <p style="margin: 0 0 24px;">
                        Thank you for joining CeyHallo! We are thrilled to have you as part of our community connecting Sri Lankans in the UAE & Qatar.
                      </p>
                      <p style="margin: 0 0 24px;">
                        Explore local events, find job opportunities, discover Sri Lankan businesses, and stay updated with community news.
                      </p>
                      
                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="mso-line-height-rule: exactly; mso-padding-alt: 12px 24px; border-radius: 9999px; background-color: #083594;">
                            <a href="https://ceyhallo.com" target="_blank" style="display: block; font-weight: 600; font-size: 0.815rem; line-height: 100%; color: #ffffff; padding: 12px 24px; text-decoration: none;">
                              Get Started &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>

                      <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="mso-line-height-rule: exactly; padding-top: 32px; padding-bottom: 8px;">
                            <div style="height: 1px; background-color: #E5E7EB; line-height: 1px;">&zwnj;</div>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0;">
                        Thanks,<br>The CeyHallo Team
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="height: 48px;"></td>
                  </tr>
                  <tr>
                    <td style="mso-line-height-rule: exactly; padding-left: 24px; padding-right: 24px; text-align: center; font-size: 11px; color: #9CA3AF;">
                      <p style="margin: 0 0 8px;">
                        You received this email because you signed up for CeyHallo.
                      </p>
                      <p style="margin: 0; color: #9CA3AF;">
                        &copy; 2024 CeyHallo. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

    try {
      await this.firestoreService.addDocument('email_queue', {
        target: {
            audience: 'test',
            testEmail: email
        },
        subject: `Welcome to CeyHallo! 🇱🇰`,
        htmlContent: htmlContent,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      console.log('Welcome email queued successfully.');
    } catch (error) {
      console.error('Failed to queue email:', error);
    }
  }

  async sendGoodbyeEmail(email: string, name: string) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <!--[if mso]>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
    <style>
      td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
    </style>
  <![endif]-->
  <title>We're sorry to see you go</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" media="screen">
  <style>
    @media (max-width: 600px) {
      .sm-w-full {
        width: 100% !important;
      }
      .sm-px-6 {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
      .sm-py-8 {
        padding-top: 32px !important;
        padding-bottom: 32px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #F2F4F7;">
  <div style="font-family: 'Inter', sans-serif; mso-line-height-rule: exactly; display: none;">A message from CeyHallo</div>
  <div role="article" aria-roledescription="email" aria-label="We're sorry to see you go" lang="en" style="font-family: 'Inter', sans-serif; mso-line-height-rule: exactly;">
    <table style="width: 100%; font-family: 'Inter', sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="mso-line-height-rule: exactly; background-color: #F2F4F7; padding-top: 24px; padding-bottom: 24px;">
          <table class="sm-w-full" style="width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="sm-py-8 sm-px-6" style="mso-line-height-rule: exactly; padding: 40px; text-align: center;">
                <a href="https://ceyhallo.com" target="_blank">
                  <img src="https://i.ibb.co/B5TnYXWN/logo.png" width="120" alt="CeyHallo" style="max-width: 100%; vertical-align: middle; line-height: 100%; border: 0;">
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" class="sm-px-6">
                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="sm-px-6" style="mso-line-height-rule: exactly; border-radius: 16px; background-color: #ffffff; padding: 40px; text-align: left; font-size: 0.815rem; line-height: 22px; color: #4B5563;">
                      <h1 style="margin-top: 0; margin-bottom: 24px; font-size: 1.25rem; font-weight: 700; line-height: 1.2; color: #1A1C1E;">
                        We're sorry to see you go, ${name}
                      </h1>
                      <p style="margin: 0 0 24px;">
                        We are sorry to hear that you are deleting your account. We hope your experience with CeyHallo was valuable.
                      </p>
                      <p style="margin: 0 0 24px;">
                        We hope to see you again in the future!
                      </p>

                      <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="mso-line-height-rule: exactly; padding-top: 32px; padding-bottom: 24px;">
                            <div style="height: 1px; background-color: #E5E7EB; line-height: 1px;">&zwnj;</div>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 24px; color: #DC2626; font-weight: 600;">
                        If you didn't perform this action, please contact us immediately at <a href="mailto:support@ceyhallo.com" style="color: #DC2626; text-decoration: underline;">support@ceyhallo.com</a>.
                      </p>

                      <p style="margin: 0;">
                        Best regards,<br>The CeyHallo Team
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="height: 48px;"></td>
                  </tr>
                  <tr>
                    <td style="mso-line-height-rule: exactly; padding-left: 24px; padding-right: 24px; text-align: center; font-size: 11px; color: #9CA3AF;">
                      <p style="margin: 0 0 8px;">
                        You received this email because of an account action on CeyHallo.
                      </p>
                      <p style="margin: 0; color: #9CA3AF;">
                        &copy; 2024 CeyHallo. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

    try {
      await this.firestoreService.addDocument('email_queue', {
        target: {
            audience: 'test',
            testEmail: email
        },
        subject: `We're sorry to see you go`,
        htmlContent: htmlContent,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      console.log('Goodbye email queued successfully.');
    } catch (error) {
      console.error('Failed to queue goodbye email:', error);
    }
  }
}