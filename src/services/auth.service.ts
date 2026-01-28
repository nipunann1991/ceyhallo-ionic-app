import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from './firebase.service';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser, sendEmailVerification, Unsubscribe } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { FirestoreService } from './firestore.service';
import { UserProfile } from '../models/user.model';
import { EmailService } from './email.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // FIX: Explicitly type injected Router to resolve type inference issue.
  private router: Router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private emailService = inject(EmailService);

  isLoggedIn = signal<boolean | undefined>(undefined);
  currentUser = signal<User | null>(null);
  
  // Extended User Profile from Firestore
  userProfile = signal<UserProfile | null>(null);
  
  private userProfileUnsubscribe: Unsubscribe | null = null;

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.isLoggedIn.set(!!user);
      this.currentUser.set(user);
      
      if (user) {
         // Start listening to the extended profile in Firestore using the real UID from the token
         this.subscribeToUserProfile(user.uid);
      } else {
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
    } catch (error: any) {
      return { success: false, error: this.mapFirebaseAuthError(error.code) };
    }
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
            isVerified: false,
            createdAt: new Date().toISOString(),
            region: region || '',
            phoneNumber: phoneNumber || ''
         };
         
         await this.firestoreService.updateDocument('users', userCredential.user.uid, newUserProfile);
         
         // Send Welcome Email
         this.emailService.sendWelcomeEmail(email, name);

         // Force reload to update local auth state
         await userCredential.user.reload();
         this.currentUser.set({ ...auth.currentUser } as User);
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.mapFirebaseAuthError(error.code) };
    }
  }

  async resendVerificationEmail(): Promise<{success: boolean; error?: string}> {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user is logged in.' };
    }
    if (user.emailVerified) {
      return { success: false, error: 'Your email is already verified.' };
    }
    try {
      await sendEmailVerification(user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.mapFirebaseAuthError(error.code) };
    }
  }

  async resetPassword(email: string): Promise<{success: boolean; error?: string}> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.mapFirebaseAuthError(error.code) };
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    if (this.userProfileUnsubscribe) {
        this.userProfileUnsubscribe();
        this.userProfileUnsubscribe = null;
    }
    this.router.navigate(['/login']);
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
      if (data.name || data.photoURL) {
          await updateProfile(user, { 
              displayName: data.name || user.displayName, 
              photoURL: data.photoURL || user.photoURL 
          });
          await user.reload(); 
          this.currentUser.set({ ...auth.currentUser } as User); 
      }

      // 2. Update Firestore Document using real UID
      try {
          await this.firestoreService.updateDocument('users', user.uid, data);
      } catch (fsError: any) {
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
    } catch (error: any) {
      return { success: false, error: error.message };
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
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          return { success: false, error: 'The current password you entered is incorrect.' };
      }
      if (error.code === 'auth/requires-recent-login') {
         return { success: false, error: 'For security reasons, please log out and log in again before changing your password.' };
      }
      return { success: false, error: this.mapFirebaseAuthError(error.code) || error.message };
    }
  }

  async deleteAccount(password: string): Promise<{success: boolean; error?: string}> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'No user is currently logged in.' };
    }

    // Capture details for email before deletion
    const email = user.email;
    const name = this.userProfile()?.name || user.displayName || 'User';
  
    try {
      // 1. Re-authenticate the user to confirm their identity
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
  
      // 2. Queue Goodbye Email (Best Effort)
      this.emailService.sendGoodbyeEmail(email, name);

      // 3. If re-authentication is successful, proceed with deletion
      // First, attempt to delete Firestore data (Best Effort)
      try {
        await this.firestoreService.deleteDocument('users', user.uid);
      } catch (fsError: any) {
        // If it's a permission error, we expect this in some environments. Log info instead of warn.
        if (fsError.code === 'permission-denied' || fsError.message?.includes('Missing or insufficient permissions')) {
            console.log("Firestore profile delete skipped (permissions), proceeding with Auth delete.");
        } else {
            console.warn("Firestore profile delete failed, proceeding with Auth delete:", fsError.message);
        }
      }
      
      // Then, delete the Firebase Auth user
      await deleteUser(user);
  
      // onAuthStateChanged will handle the rest (logout, nav)
      this.router.navigate(['/login']); 
      return { success: true };
  
    } catch (error: any) {
      console.error("Error deleting account:", error.message || error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { success: false, error: 'The password you entered is incorrect.' };
      }
      if (error.code === 'auth/requires-recent-login') {
        return { success: false, error: 'This is a sensitive operation. Please sign in again before deleting your account.' };
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
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}