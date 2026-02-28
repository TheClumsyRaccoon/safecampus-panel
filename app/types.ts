import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'author' | 'admin' | 'pending';
  createdAt: Timestamp; 
}