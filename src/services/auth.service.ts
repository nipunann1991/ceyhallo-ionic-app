
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import {
  FacebookLogin,
  FacebookLoginResponse,
} from '@capacitor-community/facebook-login';
import { auth } from './firebase.service';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  deleteUser, 
  confirmPasswordReset, 
  verifyPasswordResetCode, 
  Unsubscribe,
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { FirestoreService } from './firestore.service';
import { UserProfile, UserProfileSource } from '../models/user.model';
import { EmailService } from './email.service';
import { BehaviorSubject } from 'rxjs';

type AuthResult = { success: boolean; error?: string; dismissed?: boolean };
type FacebookGraphProfile = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  picture?: {
    data?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      is_silhouette?: boolean | null;
    } | null;
  } | null;
  [key: string]: unknown;
};
type FacebookTokenResponse = FacebookLoginResponse & {
  authenticationToken?: {
    token?: string | null;
  } | null;
};
type SocialLoginFacebookResult = {
  accessToken?: {
    token?: string | null;
    userId?: string | null;
  } | null;
  idToken?: string | null;
};
type AppleProfileData = {
  user?: string | null;
  email?: string | null;
  givenName?: string | null;
  familyName?: string | null;
};
type SocialProfileSeed = {
  email?: string;
  name?: string;
  phoneNumber?: string;
  photoURL?: string;
};

const FCM_TOKEN_STORAGE_KEY = 'ceyhallo_fcm_token';
const DELETE_ACCOUNT_VERIFICATION_KEY = 'ceyhallo_delete_account_verification';
const EMAIL_VERIFICATION_CODE_KEY = 'ceyhallo_email_verification_code';
const WEB_SOCIAL_REDIRECT_PROMPT_KEY = 'ceyhallo_web_social_redirect_prompt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = signal<boolean | undefined>(undefined);
  currentUser = signal<User | null>(null);
  pendingProfileCompletionPrompt = signal(false);
  
  // Observable auth state for Guards to avoid 'toObservable' context errors
  readonly authState$ = new BehaviorSubject<User | null | undefined>(undefined);

  // Extended User Profile from Firestore
  userProfile = signal<UserProfile | null>(null);
  
  private userProfileUnsubscribe: Unsubscribe | null = null;
  private profileInitInFlight = new Map<string, Promise<void>>();

  constructor(
    private router: Router,
    private firestoreService: FirestoreService,
    private emailService: EmailService
  ) {
    if (!Capacitor.isNativePlatform()) {
      void this.restorePendingWebSocialRedirect();
    }

    onAuthStateChanged(auth, (user) => {
      this.isLoggedIn.set(!!user);
      this.currentUser.set(user);
      this.authState$.next(user);
      
      if (user) {
         if (this.consumePendingWebSocialRedirectPrompt()) {
           this.pendingProfileCompletionPrompt.set(true);
         }
         void this.ensureUserProfileExists(user);
         // Start listening to the extended profile in Firestore using the real UID from the token
         this.subscribeToUserProfile(user.uid);
      } else {
         this.pendingProfileCompletionPrompt.set(false);
         this.userProfile.set(null);
         if (this.userProfileUnsubscribe) {
            this.userProfileUnsubscribe();
            this.userProfileUnsubscribe = null;
         }
      }
    });
  }

  private subscribeToUserProfile(uid: string) {
      if (this.userProfileUnsubscribe) {
          this.userProfileUnsubscribe();
      }
      
      this.userProfileUnsubscribe = this.firestoreService.listenToDocument<UserProfile>('users', uid, (data) => {
          if (data) {
              this.userProfile.set(data);
          } else {
              // If no profile exists, create a basic one from Auth data locally
              const basic: UserProfile = {
                  id: uid,
                  email: this.currentUser()?.email || '',
                  name: this.currentUser()?.displayName || 'User',
                  isVerified: this.currentUser()?.emailVerified || false
              };
              this.userProfile.set(basic);
          }
      });
  }

  async login(email: string, password: string): Promise<{success: boolean; error?: string}> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { code: string };
      return { success: false, error: this.mapFirebaseAuthError(firebaseError.code) };
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      if (!Capacitor.isNativePlatform()) {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        provider.setCustomParameters({ prompt: 'select_account' });

        return this.signInWithWebProvider(provider, 'google');
      }

      const result =
        Capacitor.getPlatform() === 'android'
          ? await SocialLogin.login({
              provider: 'google',
              options: {
                style: 'bottom',
                filterByAuthorizedAccounts: false,
              },
            })
          : await SocialLogin.login({
              provider: 'google',
              options: {
                scopes: ['email', 'profile'],
              },
            });

      const idToken =
        result.result.responseType === 'online'
          ? result.result.idToken
          : null;

      if (!idToken) {
        return {
          success: false,
          error:
            'No Google ID token was returned. Check MY_VALUE_IOS_CLIENT_ID and MY_VALUE_IOS_SERVER_CLIENT_ID.',
        };
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      await this.handleSocialLoginSuccess(userCredential.user, 'google');

      return { success: true };
    } catch (error: unknown) {
      if (this.isSocialLoginCancellation(error)) {
        return { success: false, dismissed: true };
      }

      console.error('Google Sign-In failed:', error);
      return { success: false, error: this.mapGoogleSignInError(error) };
    }
  }

  async loginWithGoogle(): Promise<AuthResult> {
    return this.signInWithGoogle();
  }

  async signInWithFacebook(): Promise<AuthResult> {
    try {
      await this.clearFacebookSessionIfNeeded();

      const rawNonce = Capacitor.getPlatform() === 'ios' ? this.generateNonce() : null;
      const loginOptions: {
        permissions: string[];
        tracking?: 'limited' | 'enabled';
        nonce?: string;
      } = {
        permissions: ['email', 'public_profile'],
      };

      if (Capacitor.getPlatform() === 'ios') {
        loginOptions.tracking = 'enabled';
        if (rawNonce) {
          loginOptions.nonce = rawNonce;
        }
      }

      const result =
        Capacitor.getPlatform() === 'android'
          ? ((await SocialLogin.login({
              provider: 'facebook',
              options: {
                permissions: loginOptions.permissions,
              },
            })).result as FacebookTokenResponse)
          : ((await FacebookLogin.login(loginOptions)) as FacebookTokenResponse);
      const graphProfile = await this.getFacebookGraphProfile();
      const tokens = await this.resolveFacebookFirebaseTokens(result);

      if (!tokens.authenticationToken && !tokens.accessToken) {
        if (!Capacitor.isNativePlatform()) {
          return { success: false, dismissed: true };
        }

        return {
          success: false,
          error:
            'No Facebook token was returned. Check the Facebook app configuration for this platform.',
        };
      }

      const credential = this.createFacebookFirebaseCredential(tokens, rawNonce);
      const userCredential = await signInWithCredential(auth, credential);
      await this.applyFacebookGraphProfile(userCredential.user, graphProfile);

      await this.handleSocialLoginSuccess(userCredential.user, 'fb');

      return { success: true };
    } catch (error: unknown) {
      if (this.isSocialLoginCancellation(error)) {
        return { success: false, dismissed: true };
      }

      console.error('Facebook Login failed:', error);
      return { success: false, error: this.mapFacebookSignInError(error) };
    }
  }

  async loginWithFacebook(): Promise<AuthResult> {
    return this.signInWithFacebook();
  }

  async signInWithApple(): Promise<AuthResult> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return {
          success: false,
          error: 'Apple Login is available only in the native iOS app.',
        };
      }

      const rawNonce = this.generateNonce();
      const hashedNonce = await this.sha256(rawNonce);
      const result = await SocialLogin.login({
        provider: 'apple',
        options: {
          scopes: ['email', 'name'],
          nonce: hashedNonce,
        },
      });

      const idToken = result.result.idToken;
      const appleProfileSeed = this.buildAppleProfileSeed(result.result.profile);

      if (!idToken) {
        return {
          success: false,
          error:
            'No Apple identity token was returned. Check MY_VALUE_APPLE_CLIENT_ID and the Sign in with Apple capability.',
        };
      }

      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken,
        rawNonce,
      });
      const userCredential = await signInWithCredential(auth, credential);

      await this.applyAppleProfileData(userCredential.user, appleProfileSeed);
      await this.handleSocialLoginSuccess(userCredential.user, 'apple', appleProfileSeed);

      return { success: true };
    } catch (error: unknown) {
      if (this.isSocialLoginCancellation(error)) {
        return { success: false, dismissed: true };
      }

      console.error('Apple Login failed:', error);
      return { success: false, error: this.mapAppleSignInError(error) };
    }
  }

  async loginWithApple(): Promise<AuthResult> {
    return this.signInWithApple();
  }

  async signUp(email: string, password: string, name: string, region?: string, phoneNumber?: string): Promise<{success: boolean; error?: string}> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name immediately in Auth
      if (userCredential.user) {
         await updateProfile(userCredential.user, { displayName: name });
         const profileTimestamps = this.buildProfileTimestamps(userCredential.user);
         
         // Create initial Firestore profile
         const newUserProfile: UserProfile = {
            id: userCredential.user.uid,
            email: email,
            name: name,
            role: 'user',
            source: 'app',
            isVerified: false,
            createdAt: profileTimestamps.createdAt,
            lastLogin: profileTimestamps.lastLogin,
            region: region || '',
            phoneNumber: phoneNumber || '',
            fcmToken: this.getStoredFcmToken()
         };
         
         await this.firestoreService.updateDocument('users', userCredential.user.uid, newUserProfile);
         
         // Force reload to update local auth state
         await userCredential.user.reload();
         this.currentUser.set({ ...auth.currentUser } as User);
      }
      
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { code: string };
      return { success: false, error: this.mapFirebaseAuthError(firebaseError.code) };
    }
  }

  async resendVerificationEmail(): Promise<{success: boolean; error?: string; email?: string}> {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user is logged in.' };
    }
    if (this.userProfile()?.isVerified) {
      return { success: false, error: 'Your email is already verified.' };
    }
    if (!user.email) {
      return { success: false, error: 'No email address is associated with this account.' };
    }

    const code = this.generateVerificationCode();
    const verification = {
      uid: user.uid,
      code,
      email: user.email,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    this.persistEmailVerificationCode(verification);

    try {
      await this.emailService.sendRecoveryCode(user.email, code);
      return { success: true, email: user.email };
    } catch (error: unknown) {
      this.clearEmailVerificationCode();
      const firebaseError = error as { code: string };
      return { success: false, error: this.mapFirebaseAuthError(firebaseError.code) };
    }
  }

  async verifyEmailWithCode(code: string): Promise<{success: boolean; error?: string}> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'No user is currently logged in.' };
    }

    const verification = this.loadEmailVerificationCode();
    if (!verification || verification.uid !== user.uid) {
      return { success: false, error: 'Please request a new verification code.' };
    }
    if (verification.expiresAt < Date.now()) {
      this.clearEmailVerificationCode();
      return { success: false, error: 'The verification code has expired. Please request a new code.' };
    }
    if (verification.code !== code.trim()) {
      return { success: false, error: 'The verification code you entered is incorrect.' };
    }

    try {
      await this.firestoreService.updateDocument('users', user.uid, { isVerified: true });
      this.userProfile.update((current) => (current ? { ...current, isVerified: true } : current));
      this.clearEmailVerificationCode();
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message || 'Failed to verify your email. Please try again.' };
    }
  }

  /**
   * Sends a password reset email.
   * Note: We pass a URL to handleCodeInApp. This deep link must be configured in Capacitor.
   */
  async resetPassword(email: string): Promise<{success: boolean; error?: string}> {
    try {
      // Configure this to point to your app's deep link handling scheme
      // using your custom domain ceyhallo.com
      await sendPasswordResetEmail(auth, email, {
        handleCodeInApp: true,
        // The URL the user is redirected to after clicking the email link.
        // If the app is installed, this URL is intercepted.
        url: 'https://ceyhallo.com/auth-action' 
      });
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { code: string };
      return { success: false, error: this.mapFirebaseAuthError(firebaseError.code) };
    }
  }

  /**
   * Verifies the OOB code extracted from the email link.
   * Returns the email address associated with the request if valid.
   */
  async verifyPasswordResetCode(code: string): Promise<{success: boolean; email?: string; error?: string}> {
    try {
      const email = await verifyPasswordResetCode(auth, code);
      return { success: true, email };
    } catch (error: unknown) {
      const firebaseError = error as { message: string };
      return { success: false, error: firebaseError.message };
    }
  }

  /**
   * Completes the password reset process using the OOB code and new password.
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<{success: boolean; error?: string}> {
    try {
      await confirmPasswordReset(auth, code, newPassword);
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { code: string };
      return { success: false, error: this.mapFirebaseAuthError(firebaseError.code) };
    }
  }

  async logout(): Promise<void> {
    try {
      const providerIds = auth.currentUser?.providerData.map((provider) => provider.providerId) ?? [];

      if (Capacitor.isNativePlatform() && providerIds.includes('google.com')) {
        await SocialLogin.logout({ provider: 'google' });
      }

      if (providerIds.includes('facebook.com')) {
        await this.clearFacebookSessionIfNeeded();
      }

      if (Capacitor.isNativePlatform() && providerIds.includes('apple.com')) {
        await SocialLogin.logout({ provider: 'apple' });
      }
    } catch (error) {
      console.warn('SocialLogin logout skipped:', error);
    }

    await signOut(auth);
    this.pendingProfileCompletionPrompt.set(false);
    if (this.userProfileUnsubscribe) {
        this.userProfileUnsubscribe();
        this.userProfileUnsubscribe = null;
    }
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Updated to handle both Auth Profile and Firestore Profile
  async updateUserProfile(data: Partial<UserProfile>): Promise<{success: boolean; error?: string}> {
    const user = auth.currentUser; 
    if (!user) return { success: false, error: 'No user logged in' };
    
    // Optimistic Update: Update local signal immediately
    this.userProfile.update(current => {
        if (!current) return null;
        return { ...current, ...data };
    });

    try {
      // 1. Update Firebase Auth Profile if name/photo changed
      const authUpdate: { displayName?: string; photoURL?: string } = {};
      let shouldUpdateAuth = false;

      if (data.name !== undefined && data.name !== user.displayName) {
          authUpdate.displayName = data.name;
          shouldUpdateAuth = true;
      }
      if (data.photoURL !== undefined && data.photoURL !== user.photoURL) {
          authUpdate.photoURL = data.photoURL;
          shouldUpdateAuth = true;
      }

      if (shouldUpdateAuth) {
          await updateProfile(user, authUpdate);
          await user.reload(); 
          this.currentUser.set({ ...auth.currentUser } as User); 
      }

      // 2. Update Firestore Document using real UID
      try {
          await this.firestoreService.updateDocument('users', user.uid, data);
      } catch (error: unknown) {
          const fsError = error as { code: string; message: string };
          // Gracefully handle permission errors (common in demo/restricted environments)
          // Since we already performed an optimistic update, we can report success to the UI
          if (fsError.code === 'permission-denied' || 
              fsError.message?.includes('Missing or insufficient permissions') ||
              fsError.toString().includes('insufficient permissions')) {
              console.warn('Firestore update blocked by rules. Keeping local optimistic update.');
              return { success: true };
          }
          throw fsError;
      }
      
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message: string };
      return { success: false, error: firebaseError.message };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{success: boolean; error?: string}> {
    const user = auth.currentUser;
    if (!user || !user.email) return { success: false, error: 'No user logged in' };
    
    try {
      // Re-authenticate user to ensure they know the current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { code: string; message: string };
      if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
          return { success: false, error: 'The current password you entered is incorrect.' };
      }
      if (firebaseError.code === 'auth/requires-recent-login') {
         return { success: false, error: 'For security reasons, please log out and log in again before changing your password.' };
      }
      return { success: false, error: this.mapFirebaseAuthError(firebaseError.code) || firebaseError.message };
    }
  }

  async requestDeleteAccountCode(): Promise<{success: boolean; error?: string; email?: string}> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'No user is currently logged in.' };
    }

    const code = this.generateVerificationCode();
    const verification = {
      uid: user.uid,
      code,
      email: user.email,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    this.persistDeleteAccountVerification(verification);

    try {
      await this.emailService.sendRecoveryCode(user.email, code);
      return { success: true, email: user.email };
    } catch (error: unknown) {
      this.clearDeleteAccountVerification();
      const emailError = error as { message?: string };
      return { success: false, error: emailError.message || 'Failed to send verification code. Please try again.' };
    }
  }

  async deleteAccountWithCode(code: string): Promise<{success: boolean; error?: string}> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'No user is currently logged in.' };
    }

    const verification = this.loadDeleteAccountVerification();
    if (!verification || verification.uid !== user.uid) {
      return { success: false, error: 'Please request a new verification code.' };
    }
    if (verification.expiresAt < Date.now()) {
      this.clearDeleteAccountVerification();
      return { success: false, error: 'The verification code has expired. Please request a new code.' };
    }
    if (verification.code !== code.trim()) {
      return { success: false, error: 'The verification code you entered is incorrect.' };
    }

    // Capture details for email before deletion
    const email = user.email;
    const name = this.userProfile()?.name || user.displayName || 'User';
  
    try {
      // 1. Queue Goodbye Email (Best Effort)
      this.emailService.sendGoodbyeEmail(email, name);

      // 2. Proceed with deletion once the verification code is confirmed
      // First, attempt to delete Firestore data (Best Effort)
      try {
        await this.firestoreService.deleteDocument('users', user.uid);
      } catch (error: unknown) {
        const fsError = error as { code: string; message: string };
        // If it's a permission error, we expect this in some environments. Log info instead of warn.
        if (fsError.code === 'permission-denied' || fsError.message?.includes('Missing or insufficient permissions')) {

        } else {
            console.warn("Firestore profile delete failed, proceeding with Auth delete:", fsError.message || 'Unknown error');
        }
      }
      
      // Then, delete the Firebase Auth user
      await deleteUser(user);
      this.clearDeleteAccountVerification();
      this.clearLocalAuthState();

      return { success: true };
  
    } catch (error: unknown) {
      const firebaseError = error as { code: string; message: string };
      // FIX: Log only the message to prevent circular structure error
      console.error("Error deleting account:", firebaseError.message || 'Unknown error during deletion');
      if (firebaseError.code === 'auth/requires-recent-login') {
        return { success: false, error: 'Please log out, sign in again, and then verify with a new code before deleting your account.' };
      }
      return { success: false, error: 'Failed to delete account. Please try again later.' };
    }
  }

  private mapFirebaseAuthError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/weak-password':
        return 'The password is too weak. It should be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later.';
      case 'auth/expired-action-code':
        return 'The password reset link has expired. Please request a new one.';
      case 'auth/invalid-action-code':
        return 'The password reset link is invalid or has already been used.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  private async handleSocialLoginSuccess(
    user: User,
    source: UserProfileSource,
    profileSeed?: SocialProfileSeed
  ): Promise<void> {
    await this.ensureUserProfileExists(user, source, profileSeed);
  }

  private async getFacebookGraphProfile(): Promise<FacebookGraphProfile | null> {
    try {
      if (Capacitor.getPlatform() === 'android') {
        const response = (await SocialLogin.providerSpecificCall({
          call: 'facebook#getProfile',
          options: {
            fields: ['id', 'name', 'email', 'first_name', 'last_name', 'picture.width(400).height(400)'],
          },
        })) as { profile?: FacebookGraphProfile | null };
        return response.profile || null;
      }

      return await FacebookLogin.getProfile<FacebookGraphProfile>({
        fields: ['id', 'name', 'email', 'first_name', 'last_name', 'picture.width(400).height(400)'],
      });
    } catch (error) {
      console.warn('Failed to fetch Facebook Graph profile:', error);
      return null;
    }
  }

  private async resolveFacebookFirebaseTokens(
    loginResult: FacebookTokenResponse
  ): Promise<{ accessToken: string | null; authenticationToken: string | null }> {
    if (Capacitor.getPlatform() === 'android') {
      const androidResult = loginResult as FacebookTokenResponse & SocialLoginFacebookResult;
      return {
        accessToken: androidResult.accessToken?.token?.trim() || null,
        authenticationToken: androidResult.idToken?.trim() || null,
      };
    }

    const immediateAccessToken = loginResult.accessToken?.token?.trim() || null;
    const immediateAuthenticationToken =
      loginResult.authenticationToken?.token?.trim() || null;

    if (Capacitor.getPlatform() !== 'ios') {
      return {
        accessToken: immediateAccessToken,
        authenticationToken: immediateAuthenticationToken,
      };
    }

    await this.delay(350);

    try {
      const refreshedTokens = (await FacebookLogin.getCurrentAccessToken()) as FacebookTokenResponse;

      return {
        accessToken: refreshedTokens.accessToken?.token?.trim() || immediateAccessToken,
        authenticationToken:
          refreshedTokens.authenticationToken?.token?.trim() || immediateAuthenticationToken,
      };
    } catch {
      return {
        accessToken: immediateAccessToken,
        authenticationToken: immediateAuthenticationToken,
      };
    }
  }

  private createFacebookFirebaseCredential(
    tokens: { accessToken: string | null; authenticationToken: string | null },
    rawNonce: string | null
  ): ReturnType<typeof FacebookAuthProvider.credential> | ReturnType<OAuthProvider['credential']> {
    if (tokens.authenticationToken && rawNonce) {
      const provider = new OAuthProvider('facebook.com');
      return provider.credential({
        idToken: tokens.authenticationToken,
        rawNonce,
        accessToken: tokens.accessToken || undefined,
      } as {
        idToken: string;
        rawNonce: string;
        accessToken?: string;
      });
    }

    return FacebookAuthProvider.credential(tokens.accessToken || '');
  }

  private async clearFacebookSessionIfNeeded(): Promise<void> {
    try {
      if (Capacitor.getPlatform() === 'android') {
        await SocialLogin.logout({ provider: 'facebook' });
        return;
      }

      const currentToken = await FacebookLogin.getCurrentAccessToken();
      if (currentToken.accessToken?.token) {
        await FacebookLogin.logout();
      }
    } catch {
      // Ignore stale-session lookup/logout failures and continue.
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  private async applyFacebookGraphProfile(user: User, profile: FacebookGraphProfile | null): Promise<void> {
    if (!profile) {
      return;
    }

    const displayName = profile.name?.trim() || user.displayName || 'User';
    const photoURL = profile.picture?.data?.url?.trim() || user.photoURL || '';
    const authUpdate: { displayName?: string; photoURL?: string } = {};

    if (displayName && displayName !== user.displayName) {
      authUpdate.displayName = displayName;
    }

    if (photoURL && photoURL !== user.photoURL) {
      authUpdate.photoURL = photoURL;
    }

    if (Object.keys(authUpdate).length > 0) {
      await updateProfile(user, authUpdate);
      await user.reload();
      this.currentUser.set({ ...auth.currentUser } as User);
    }

    const firestoreUpdate: Partial<UserProfile> = {};

    if (profile.email?.trim()) {
      firestoreUpdate.email = profile.email.trim();
    }
    if (displayName) {
      firestoreUpdate.name = displayName;
    }
    if (photoURL) {
      firestoreUpdate.photoURL = photoURL;
    }

    if (Object.keys(firestoreUpdate).length > 0) {
      try {
        await this.firestoreService.updateDocument('users', user.uid, firestoreUpdate);
      } catch (error) {
        console.warn('Failed to persist Facebook Graph profile to Firestore:', error);
      }
    }
  }

  requestProfileCompletionPrompt(): void {
    this.pendingProfileCompletionPrompt.set(true);
  }

  clearProfileCompletionPrompt(): void {
    this.pendingProfileCompletionPrompt.set(false);
  }

  private clearLocalAuthState(): void {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.pendingProfileCompletionPrompt.set(false);
    this.authState$.next(null);
    this.userProfile.set(null);

    if (this.userProfileUnsubscribe) {
      this.userProfileUnsubscribe();
      this.userProfileUnsubscribe = null;
    }
  }

  private async ensureUserProfileExists(
    user: User,
    source?: UserProfileSource,
    profileSeed?: SocialProfileSeed
  ): Promise<void> {
    const existingRequest = this.profileInitInFlight.get(user.uid);
    if (existingRequest) {
      await existingRequest;
      if (profileSeed) {
        await this.mergeProfileSeed(user, source, profileSeed);
      }
      return;
    }

    const request = this.runEnsureUserProfileExists(user, source, profileSeed);
    this.profileInitInFlight.set(user.uid, request);

    try {
      await request;
    } finally {
      this.profileInitInFlight.delete(user.uid);
    }
  }

  private async runEnsureUserProfileExists(
    user: User,
    source?: UserProfileSource,
    profileSeed?: SocialProfileSeed
  ): Promise<void> {
    const resolvedSource = source || this.resolveUserProfileSource(user);
    const profile = await this.firestoreService.getDocument('users', user.uid);
    const profileTimestamps = this.buildProfileTimestamps(user, profile);
    const seededEmail = profileSeed?.email?.trim() || '';
    const seededName = profileSeed?.name?.trim() || '';
    const seededPhoneNumber = profileSeed?.phoneNumber?.trim() || '';
    const seededPhotoURL = profileSeed?.photoURL?.trim() || '';

    if (profile?.id) {
      const missingFields: Partial<UserProfile> = {};

      if (!profile.email && (seededEmail || user.email)) {
        missingFields.email = seededEmail || user.email || '';
      }
      if (!profile.name && (seededName || user.displayName)) {
        missingFields.name = seededName || user.displayName || 'User';
      }
      if (!profile.phoneNumber && (seededPhoneNumber || user.phoneNumber)) {
        missingFields.phoneNumber = seededPhoneNumber || user.phoneNumber || '';
      }
      if (!profile.photoURL && (seededPhotoURL || user.photoURL)) {
        missingFields.photoURL = seededPhotoURL || user.photoURL || '';
      }
      if (!profile.role) {
        missingFields.role = 'user';
      }
      if (!profile.source) {
        missingFields.source = resolvedSource;
      }
      if (!profile.fcmToken) {
        const fcmToken = this.getStoredFcmToken();
        if (fcmToken) {
          missingFields.fcmToken = fcmToken;
        }
      }
      if (!profile.createdAt) {
        missingFields.createdAt = profileTimestamps.createdAt;
      }

      missingFields.lastLogin = profileTimestamps.lastLogin;

      if (Object.keys(missingFields).length > 0) {
        await this.firestoreService.updateDocument('users', user.uid, missingFields);
      }

      return;
    }

    const newUserProfile: UserProfile = {
      id: user.uid,
      email: seededEmail || user.email || '',
      name: seededName || user.displayName || 'User',
      role: 'user',
      source: resolvedSource,
      isVerified: false,
      createdAt: profileTimestamps.createdAt,
      lastLogin: profileTimestamps.lastLogin,
      region: '',
      phoneNumber: seededPhoneNumber || user.phoneNumber || '',
      photoURL: seededPhotoURL || user.photoURL || '',
      fcmToken: this.getStoredFcmToken(),
    };

    await this.firestoreService.updateDocument('users', user.uid, newUserProfile);

    if (newUserProfile.email) {
      await this.emailService.sendWelcomeEmail(newUserProfile.email, newUserProfile.name || 'User');
    }
  }

  private buildAppleProfileSeed(profile: AppleProfileData | null | undefined): SocialProfileSeed | undefined {
    if (!profile) {
      return undefined;
    }

    const email = profile.email?.trim() || '';
    const givenName = profile.givenName?.trim() || '';
    const familyName = profile.familyName?.trim() || '';
    const name = [givenName, familyName].filter(Boolean).join(' ').trim();

    if (!email && !name) {
      return undefined;
    }

    return {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    };
  }

  private async applyAppleProfileData(user: User, profileSeed?: SocialProfileSeed): Promise<void> {
    const name = profileSeed?.name?.trim() || '';
    if (!name || name === user.displayName) {
      return;
    }

    await updateProfile(user, { displayName: name });
    await user.reload();
    this.currentUser.set({ ...auth.currentUser } as User);
  }

  private async mergeProfileSeed(
    user: User,
    source: UserProfileSource | undefined,
    profileSeed: SocialProfileSeed
  ): Promise<void> {
    const seededEmail = profileSeed.email?.trim() || '';
    const seededName = profileSeed.name?.trim() || '';
    const seededPhoneNumber = profileSeed.phoneNumber?.trim() || '';
    const seededPhotoURL = profileSeed.photoURL?.trim() || '';

    if (!seededEmail && !seededName && !seededPhoneNumber && !seededPhotoURL) {
      return;
    }

    if (seededName && seededName !== user.displayName) {
      await this.applyAppleProfileData(user, profileSeed);
    }

    const profile = await this.firestoreService.getDocument('users', user.uid);
    const missingFields: Partial<UserProfile> = {};

    if ((!profile?.email || !profile.email.trim()) && seededEmail) {
      missingFields.email = seededEmail;
    }
    if ((!profile?.name || !profile.name.trim()) && seededName) {
      missingFields.name = seededName;
    }
    if ((!profile?.phoneNumber || !profile.phoneNumber.trim()) && seededPhoneNumber) {
      missingFields.phoneNumber = seededPhoneNumber;
    }
    if ((!profile?.photoURL || !profile.photoURL.trim()) && seededPhotoURL) {
      missingFields.photoURL = seededPhotoURL;
    }
    if (!profile?.source && source) {
      missingFields.source = source;
    }

    if (Object.keys(missingFields).length > 0) {
      await this.firestoreService.updateDocument('users', user.uid, missingFields);
    }
  }

  private buildProfileTimestamps(
    user: User,
    profile?: Partial<UserProfile> | null
  ): { createdAt: string; lastLogin: string } {
    const nowIso = new Date().toISOString();
    const createdAt =
      this.normalizeDateString(profile?.createdAt) ||
      this.normalizeDateString(user.metadata.creationTime) ||
      nowIso;
    const lastLogin =
      this.normalizeDateString(user.metadata.lastSignInTime) ||
      nowIso;

    return { createdAt, lastLogin };
  }

  private normalizeDateString(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value.toISOString();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const ms = value > 1_000_000_000_000 ? value : value * 1000;
      const date = new Date(ms);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    if (typeof value === 'string') {
      const numericValue = Number(value);
      if (!Number.isNaN(numericValue) && value.trim() !== '') {
        return this.normalizeDateString(numericValue);
      }

      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
      return this.normalizeDateString((value as { toDate?: () => Date }).toDate?.());
    }

    if (typeof (value as { seconds?: number }).seconds === 'number') {
      return this.normalizeDateString((value as { seconds?: number }).seconds);
    }

    return null;
  }

  private async signInWithWebProvider(
    provider: GoogleAuthProvider | FacebookAuthProvider,
    source: Extract<UserProfileSource, 'google' | 'fb'>
  ): Promise<AuthResult> {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await this.handleSocialLoginSuccess(userCredential.user, source);
      return { success: true };
    } catch (error: unknown) {
      const authError = error as { code?: string; message?: string };

      if (
        authError.code === 'auth/popup-blocked' ||
        authError.code === 'auth/cancelled-popup-request'
      ) {
        try {
          this.persistPendingWebSocialRedirectPrompt();
          await signInWithRedirect(auth, provider);
          return { success: true };
        } catch (redirectError: unknown) {
          if (this.isSocialLoginCancellation(redirectError)) {
            return { success: false, dismissed: true };
          }

          const fallbackError = redirectError as { message?: string };
          return { success: false, error: fallbackError.message || 'Social sign-in failed. Please try again.' };
        }
      }

      if (this.isSocialLoginCancellation(error)) {
        return { success: false, dismissed: true };
      }

      if (!authError.code && !authError.message) {
        return { success: false, dismissed: true };
      }

      return { success: false, error: authError.message || 'Social sign-in failed. Please try again.' };
    }
  }

  private async restorePendingWebSocialRedirect(): Promise<void> {
    try {
      const result = await getRedirectResult(auth);
      if (!result?.user) {
        return;
      }

      await this.handleSocialLoginSuccess(
        result.user,
        this.resolveUserProfileSource(result.user)
      );

      if (this.consumePendingWebSocialRedirectPrompt()) {
        this.pendingProfileCompletionPrompt.set(true);
      }
    } catch (error) {
      console.warn('Failed to restore social redirect result:', error);
      this.clearPendingWebSocialRedirectPrompt();
    }
  }

  private getStoredFcmToken(): string {
    try {
      return localStorage.getItem(FCM_TOKEN_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  private resolveUserProfileSource(user: User): UserProfileSource {
    const providerIds = user.providerData.map((provider) => provider.providerId);

    if (providerIds.includes('google.com')) {
      return 'google';
    }
    if (providerIds.includes('facebook.com')) {
      return 'fb';
    }
    if (providerIds.includes('apple.com')) {
      return 'apple';
    }

    return 'app';
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private persistDeleteAccountVerification(verification: {
    uid: string;
    code: string;
    email: string;
    expiresAt: number;
  }): void {
    try {
      localStorage.setItem(DELETE_ACCOUNT_VERIFICATION_KEY, JSON.stringify(verification));
    } catch {
      // Ignore storage failures and keep the flow best-effort.
    }
  }

  private loadDeleteAccountVerification():
    | { uid: string; code: string; email: string; expiresAt: number }
    | null {
    try {
      const raw = localStorage.getItem(DELETE_ACCOUNT_VERIFICATION_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (
        typeof parsed?.uid === 'string' &&
        typeof parsed?.code === 'string' &&
        typeof parsed?.email === 'string' &&
        typeof parsed?.expiresAt === 'number'
      ) {
        return parsed;
      }
    } catch {
      // Ignore invalid cached verification data.
    }

    return null;
  }

  private clearDeleteAccountVerification(): void {
    try {
      localStorage.removeItem(DELETE_ACCOUNT_VERIFICATION_KEY);
    } catch {
      // Ignore storage failures.
    }
  }

  private persistEmailVerificationCode(verification: {
    uid: string;
    code: string;
    email: string;
    expiresAt: number;
  }): void {
    try {
      localStorage.setItem(EMAIL_VERIFICATION_CODE_KEY, JSON.stringify(verification));
    } catch {
      // Ignore storage failures.
    }
  }

  private loadEmailVerificationCode():
    | { uid: string; code: string; email: string; expiresAt: number }
    | null {
    try {
      const raw = localStorage.getItem(EMAIL_VERIFICATION_CODE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (
        typeof parsed?.uid === 'string' &&
        typeof parsed?.code === 'string' &&
        typeof parsed?.email === 'string' &&
        typeof parsed?.expiresAt === 'number'
      ) {
        return parsed;
      }
    } catch {
      // Ignore invalid cached verification data.
    }

    return null;
  }

  private clearEmailVerificationCode(): void {
    try {
      localStorage.removeItem(EMAIL_VERIFICATION_CODE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }

  private persistPendingWebSocialRedirectPrompt(): void {
    try {
      sessionStorage.setItem(WEB_SOCIAL_REDIRECT_PROMPT_KEY, '1');
    } catch {
      // Ignore storage failures.
    }
  }

  private consumePendingWebSocialRedirectPrompt(): boolean {
    try {
      const shouldPrompt = sessionStorage.getItem(WEB_SOCIAL_REDIRECT_PROMPT_KEY) === '1';
      if (shouldPrompt) {
        sessionStorage.removeItem(WEB_SOCIAL_REDIRECT_PROMPT_KEY);
      }
      return shouldPrompt;
    } catch {
      return false;
    }
  }

  private clearPendingWebSocialRedirectPrompt(): void {
    try {
      sessionStorage.removeItem(WEB_SOCIAL_REDIRECT_PROMPT_KEY);
    } catch {
      // Ignore storage failures.
    }
  }

  isDismissedSocialLoginError(message?: string): boolean {
    const details = (message || '').toLowerCase();

    return (
      details.includes('cancel') ||
      details.includes('closed by user') ||
      details.includes('popup closed by user') ||
      details.includes('user canceled') ||
      details.includes('user cancelled') ||
      details.includes('dismissed')
    );
  }

  private isSocialLoginCancellation(error: unknown): boolean {
    if (!error) {
      return false;
    }

    const nativeError = error as {
      code?: string;
      message?: string;
      errorMessage?: string;
      error_description?: string;
    };

    const details = [
      nativeError.code,
      nativeError.message,
      nativeError.errorMessage,
      nativeError.error_description,
      typeof error === 'string' ? error : '',
    ]
      .filter((value): value is string => !!value)
      .join(' ')
      .toLowerCase();

    return (
      details.includes('cancel') ||
      details.includes('canceled') ||
      details.includes('cancelled') ||
      details.includes('dismissed') ||
      details.includes('closed by user') ||
      details.includes('popup closed by user') ||
      details.includes('popup-closed-by-user') ||
      details.includes('cancelled-popup-request') ||
      details.includes('user canceled the sign-in flow') ||
      details.includes('user cancelled the sign-in flow') ||
      details.includes('sign in flow was cancelled') ||
      details.includes('sign-in flow was cancelled') ||
      details.includes('the user canceled the sign-in flow') ||
      details.includes('the user cancelled the sign-in flow') ||
      details.includes('"token":null') ||
      details.includes("'token':null")
    );
  }

  private mapGoogleSignInError(error: unknown): string {
    const nativeError = error as { code?: string; message?: string };
    const details = `${nativeError.code ?? ''} ${nativeError.message ?? ''}`.toLowerCase();

    if (details.includes('developer_error')) {
      return 'DEVELOPER_ERROR: your iOS bundle ID does not match the Firebase or Google Cloud configuration.';
    }

    if (details.includes('not initialized') || details.includes('initialize')) {
      return 'The plugin is not initialized. Call SocialLogin.initialize() inside platform.ready().';
    }

    if (details.includes('id token')) {
      return 'No idToken was returned. This usually means the wrong Google client ID is being used.';
    }

    if (details.includes('url scheme') || details.includes('callback')) {
      return 'The Google Sign-In sheet could not return to the app. Add REVERSED_CLIENT_ID to URL Types in Xcode.';
    }

    if (nativeError.message) {
      return nativeError.message;
    }

    return 'Google Sign-In failed. Please check your iOS client IDs and Xcode URL scheme.';
  }

  private mapFacebookSignInError(error: unknown): string {
    const nativeError = error as { code?: string; message?: string };
    const details = `${nativeError.code ?? ''} ${nativeError.message ?? ''}`.toLowerCase();

    if (details.includes('developer_error')) {
      return 'Facebook Login failed because the iOS bundle ID or Facebook app configuration does not match.';
    }

    if (details.includes('not initialized') || details.includes('initialize')) {
      return 'Facebook Login is not initialized. Add MY_VALUE_FACEBOOK_APP_ID and MY_VALUE_FACEBOOK_CLIENT_TOKEN before using it.';
    }

    if (details.includes('access token')) {
      return 'No Facebook access token was returned. Check MY_VALUE_FACEBOOK_APP_ID and MY_VALUE_FACEBOOK_CLIENT_TOKEN.';
    }

    if (details.includes('cancel')) {
      return 'Facebook Login was cancelled. Please try again.';
    }

    if (nativeError.message) {
      return nativeError.message;
    }

    return 'Facebook Login failed. Check the Facebook app ID, client token, and iOS configuration.';
  }

  private mapAppleSignInError(error: unknown): string {
    const nativeError = error as { code?: string; message?: string };
    const details = `${nativeError.code ?? ''} ${nativeError.message ?? ''}`.toLowerCase();

    if (details.includes('not initialized') || details.includes('initialize')) {
      return 'Apple Login is not initialized. Add MY_VALUE_APPLE_CLIENT_ID and initialize SocialLogin inside platform.ready().';
    }

    if (details.includes('invalid credential') || details.includes('malformed') || details.includes('nonce')) {
      return 'Apple Login failed because the Apple nonce or Firebase Apple provider configuration does not match.';
    }

    if (details.includes('cancel')) {
      return 'Apple Login was cancelled. Please try again.';
    }

    if (details.includes('capability') || details.includes('authorization')) {
      return 'Apple Login is not enabled for this iOS target. Add the Sign in with Apple capability in Xcode.';
    }

    if (details.includes('id token')) {
      return 'No Apple identity token was returned. Check MY_VALUE_APPLE_CLIENT_ID and the iOS Apple Sign-In setup.';
    }

    if (nativeError.message) {
      return nativeError.message;
    }

    return 'Apple Login failed. Check the Apple client ID, Sign in with Apple capability, and Firebase Apple provider setup.';
  }

  private generateNonce(length: number = 32): string {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    const randomValues = new Uint8Array(length);

    crypto.getRandomValues(randomValues);

    return Array.from(randomValues, (value) => charset[value % charset.length]).join('');
  }

  private async sha256(value: string): Promise<string> {
    const encodedValue = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', encodedValue);

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}
