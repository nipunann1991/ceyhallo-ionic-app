
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
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
  signInWithRedirect
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { FirestoreService } from './firestore.service';
import { UserProfile, UserProfileSource } from '../models/user.model';
import { EmailService } from './email.service';
import { BehaviorSubject } from 'rxjs';

type AuthResult = { success: boolean; error?: string };
const FCM_TOKEN_STORAGE_KEY = 'ceyhallo_fcm_token';
const DELETE_ACCOUNT_VERIFICATION_KEY = 'ceyhallo_delete_account_verification';
const EMAIL_VERIFICATION_CODE_KEY = 'ceyhallo_email_verification_code';

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
    onAuthStateChanged(auth, (user) => {
      this.isLoggedIn.set(!!user);
      this.currentUser.set(user);
      this.authState$.next(user);
      
      if (user) {
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

      const result = await SocialLogin.login({
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
      console.error('Google Sign-In failed:', error);
      return { success: false, error: this.mapGoogleSignInError(error) };
    }
  }

  async loginWithGoogle(): Promise<AuthResult> {
    return this.signInWithGoogle();
  }

  async signInWithFacebook(): Promise<AuthResult> {
    try {
      if (!Capacitor.isNativePlatform()) {
        const provider = new FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');

        return this.signInWithWebProvider(provider, 'fb');
      }

      const result = await SocialLogin.login({
        provider: 'facebook',
        options: {
          permissions: ['email', 'public_profile'],
        },
      });

      const accessToken = result.result.accessToken?.token ?? null;

      if (!accessToken) {
        return {
          success: false,
          error:
            'No Facebook access token was returned. Check MY_VALUE_FACEBOOK_APP_ID and MY_VALUE_FACEBOOK_CLIENT_TOKEN.',
        };
      }

      const credential = FacebookAuthProvider.credential(accessToken);
      const userCredential = await signInWithCredential(auth, credential);

      await this.handleSocialLoginSuccess(userCredential.user, 'fb');

      return { success: true };
    } catch (error: unknown) {
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

      await this.handleSocialLoginSuccess(userCredential.user, 'apple');

      return { success: true };
    } catch (error: unknown) {
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
         
         // Create initial Firestore profile
         const newUserProfile: UserProfile = {
            id: userCredential.user.uid,
            email: email,
            name: name,
            role: 'user',
            source: 'app',
            isVerified: false,
            createdAt: new Date().toISOString(),
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
      if (Capacitor.isNativePlatform()) {
        const providerIds = auth.currentUser?.providerData.map((provider) => provider.providerId) ?? [];

        if (providerIds.includes('google.com')) {
          await SocialLogin.logout({ provider: 'google' });
        }

        if (providerIds.includes('facebook.com')) {
          await SocialLogin.logout({ provider: 'facebook' });
        }

        if (providerIds.includes('apple.com')) {
          await SocialLogin.logout({ provider: 'apple' });
        }
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

  private async handleSocialLoginSuccess(user: User, source: UserProfileSource): Promise<void> {
    await this.ensureUserProfileExists(user, source);
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

  private async ensureUserProfileExists(user: User, source?: UserProfileSource): Promise<void> {
    const existingRequest = this.profileInitInFlight.get(user.uid);
    if (existingRequest) {
      return existingRequest;
    }

    const request = this.runEnsureUserProfileExists(user, source);
    this.profileInitInFlight.set(user.uid, request);

    try {
      await request;
    } finally {
      this.profileInitInFlight.delete(user.uid);
    }
  }

  private async runEnsureUserProfileExists(user: User, source?: UserProfileSource): Promise<void> {
    const resolvedSource = source || this.resolveUserProfileSource(user);
    const profile = await this.firestoreService.getDocument('users', user.uid);

    if (profile?.id) {
      const missingFields: Partial<UserProfile> = {};

      if (!profile.email && user.email) {
        missingFields.email = user.email;
      }
      if (!profile.name && user.displayName) {
        missingFields.name = user.displayName;
      }
      if (!profile.phoneNumber && user.phoneNumber) {
        missingFields.phoneNumber = user.phoneNumber;
      }
      if (!profile.photoURL && user.photoURL) {
        missingFields.photoURL = user.photoURL;
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

      if (Object.keys(missingFields).length > 0) {
        await this.firestoreService.updateDocument('users', user.uid, missingFields);
      }

      return;
    }

    const newUserProfile: UserProfile = {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || 'User',
      role: 'user',
      source: resolvedSource,
      isVerified: false,
      createdAt: new Date().toISOString(),
      region: '',
      phoneNumber: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      fcmToken: this.getStoredFcmToken(),
    };

    await this.firestoreService.updateDocument('users', user.uid, newUserProfile);

    if (user.email) {
      await this.emailService.sendWelcomeEmail(user.email, user.displayName || 'User');
    }
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
        authError.code === 'auth/popup-closed-by-user' ||
        authError.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return { success: true };
        } catch (redirectError: unknown) {
          const fallbackError = redirectError as { message?: string };
          return { success: false, error: fallbackError.message || 'Social sign-in failed. Please try again.' };
        }
      }

      return { success: false, error: authError.message || 'Social sign-in failed. Please try again.' };
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
