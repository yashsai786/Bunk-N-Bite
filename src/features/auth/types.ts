import type { Role } from "@/features/bunk/types";

export type UserRole = Role;

export interface InstituteMembership {
  universityId: string;
  universityName?: string | undefined;
  status: "active" | "suspended" | "removed";
  studentId?: string | undefined;
  department?: string | undefined;
  addedAt: number;
  addedBy: string;
  updatedAt?: number | undefined;
  updatedBy?: string | undefined;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null | undefined;
  role: UserRole;
  status: "active" | "pending" | "suspended";
  instituteMemberships?: Record<string, InstituteMembership> | undefined;
  // Legacy / active context fields
  universityId?: string | undefined;
  universityName?: string | undefined;
  canteenId?: string | undefined;
  canteenName?: string | undefined;
  isProfileComplete?: boolean | undefined;
  createdAt: number;
  updatedAt: number;
}

export interface StudentInvitation {
  id: string;
  email: string;
  name?: string | undefined;
  studentId?: string | undefined;
  department?: string | undefined;
  universityId: string;
  universityName: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedAt: number;
  invitedBy: string;
  acceptedAt?: number | undefined;
}

export interface UniversityStudentMember {
  id: string; // UID or invitation ID
  uid?: string | undefined;
  email: string;
  name: string;
  studentId?: string | undefined;
  department?: string | undefined;
  universityId: string;
  universityName?: string | undefined;
  status: "active" | "suspended" | "removed" | "pending";
  isInvitation?: boolean | undefined;
  invitationId?: string | undefined;
  ordersCount?: number | undefined;
  addedAt: number;
  addedBy: string;
  updatedAt?: number | undefined;
  updatedBy?: string | undefined;
}

export interface AuthState {
  user: UserProfile | null;
  firebaseUser: any | null;
  isLoading: boolean;
  error: string | null;
}
