import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'author' | 'admin' | 'pending';
  createdAt: Timestamp; 
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  authorId: string;
}