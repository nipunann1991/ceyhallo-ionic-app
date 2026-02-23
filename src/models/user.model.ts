export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  city?: string;
  region?: string;
  address?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
  photoURL?: string;
  authToken?: string;
  passwordHash?: string;
  createdAt?: string;
}