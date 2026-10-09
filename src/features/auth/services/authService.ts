import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  updateProfile,
  type User as FirebaseUser,
  type ActionCodeSettings,
} from "firebase/auth";
import { get, ref, set, update } from "firebase/database";
import { auth, googleProvider, db } from "@/lib/firebase";
import type { UserProfile, UserRole, InstituteMembership } from "../types";

export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/user-disabled":
      return "This account has been suspended by administration.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please verify your credentials.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Sign-in cancelled. Popup was closed before completion.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connectivity.";
    case "auth/invalid-action-code":
      return "This sign-in link is invalid or has expired. Please request a new link.";
    default:
      return "Authentication failed. Please try again.";
  }
}

/**
 * Fetch user profile from Realtime Database
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snapshot = await get(ref(db, `users/${uid}`));
    if (snapshot.exists()) {
      const profile = snapshot.val() as UserProfile;
      // Auto-migrate legacy universityId to instituteMemberships if missing
      if (profile.universityId && (!profile.instituteMemberships || Object.keys(profile.instituteMemberships).length === 0)) {
        profile.instituteMemberships = {
          [profile.universityId]: {
            universityId: profile.universityId,
            universityName: profile.universityName || "",
            status: profile.status === "suspended" ? "suspended" : "active",
            addedAt: profile.createdAt || Date.now(),
            addedBy: "legacy_migration",
          },
        };
      }
      return profile;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

/**
 * Creates or ensures database-backed UserProfile linked to Firebase UID.
 * Security rule: Non-admin users default to "student". Admin roles must never be self-assigned.
 * Strict: Never automatically assigns Ahmedabad University or any default university!
 */
export async function ensureUserProfile(
  firebaseUser: FirebaseUser,
  additionalData?: Partial<UserProfile>
): Promise<UserProfile> {
  const existing = await fetchUserProfile(firebaseUser.uid);
  if (existing) {
    return existing;
  }

  const now = Date.now();
  const memberships: Record<string, InstituteMembership> = {};

  if (additionalData?.universityId) {
    memberships[additionalData.universityId] = {
      universityId: additionalData.universityId,
      universityName: additionalData.universityName || "",
      status: "active",
      addedAt: now,
      addedBy: "registration",
    };
  }

  // Safe default profile: newly registered users are students with NO default university
  const profile: UserProfile = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || additionalData?.displayName || "Campus User",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || null,
    role: "student", // Strict safe default
    status: "active",
    instituteMemberships: additionalData?.instituteMemberships || memberships,
    universityId: additionalData?.universityId || undefined,
    universityName: additionalData?.universityName || undefined,
    isProfileComplete: Boolean(firebaseUser.displayName || additionalData?.displayName),
    createdAt: now,
    updatedAt: now,
  };

  try {
    await set(ref(db, `users/${firebaseUser.uid}`), profile);
  } catch (err) {
    console.warn("Could not write user profile to database (rules may restrict unauthenticated writes):", err);
  }

  return profile;
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  let profile = await fetchUserProfile(cred.user.uid);
  if (!profile) {
    profile = await ensureUserProfile(cred.user);
  }
  return profile;
}

/**
 * Sign up with Email and Password
 */
export async function registerStudentWithEmail(
  email: string,
  pass: string,
  displayName: string,
  universityId?: string,
  universityName?: string
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }

  const profile = await ensureUserProfile(cred.user, {
    displayName,
    universityId: universityId || undefined,
    universityName: universityName || undefined,
  });

  return profile;
}

/**
 * Google Sign-In
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  let profile = await fetchUserProfile(result.user.uid);
  if (!profile) {
    profile = await ensureUserProfile(result.user);
  }
  return profile;
}

/**
 * Send passwordless sign-in link via Firebase Authentication
 */
export async function sendPasswordlessSignInLink(
  email: string,
  universityId?: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const urlOrigin = typeof window !== "undefined" ? window.location.origin : "https://bunknbite.web.app";
  const redirectUrl = `${urlOrigin}/?emailLink=true${
    universityId ? `&univId=${encodeURIComponent(universityId)}` : ""
  }`;

  const actionCodeSettings: ActionCodeSettings = {
    url: redirectUrl,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("emailForSignIn", cleanEmail);
      if (universityId) {
        window.localStorage.setItem("emailLinkUniversityId", universityId);
      }
    } catch {
      // localStorage may fail in strict private browsing
    }
  }
}

/**
 * Checks if current URL is a passwordless email sign-in link
 */
export function isPasswordlessEmailLink(href: string): boolean {
  return isSignInWithEmailLink(auth, href);
}

/**
 * Completes passwordless sign-in using email and link URL
 */
export async function completePasswordlessSignIn(
  email: string,
  href: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const cred = await signInWithEmailLink(auth, cleanEmail, href);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("emailForSignIn");
    } catch {}
  }

  let profile = await fetchUserProfile(cred.user.uid);
  if (!profile) {
    profile = await ensureUserProfile(cred.user, {
      displayName: cleanEmail.split("@")[0] || "Student",
      email: cleanEmail,
    });
  }

  return profile;
}

/**
 * Update user profile details (e.g. name, studentId, completed profile flag)
 */
export async function updateUserProfileDetails(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const profileRef = ref(db, `users/${uid}`);
  await update(profileRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Optional: Set account password for an already authenticated user
 */
export async function setOptionalAccountPassword(newPass: string): Promise<void> {
  if (!auth.currentUser) throw new Error("No authenticated user.");
  await updatePassword(auth.currentUser, newPass);
}

/**
 * Send password reset email
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
