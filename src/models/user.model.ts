export type UserProfileSource = 'app' | 'google' | 'fb' | 'apple';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role?: 'user' | string;
  source?: UserProfileSource;
  phoneNumber?: string;
  city?: string;
  region?: string;
  address?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
  photoURL?: string;
  fcmToken?: string;
  authToken?: string;
  passwordHash?: string;
  createdAt?: string;
}
