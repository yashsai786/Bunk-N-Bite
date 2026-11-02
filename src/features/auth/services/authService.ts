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
import type { Role } from "@/features/bunk/types";

/**
 * Strips all `undefined` fields from an object so Firebase Realtime Database `set()` / `update()` never rejects it.
 */
export function cleanForFirebase<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        result[key] = cleanForFirebase(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

/**
 * Encodes an email address into a safe Firebase Realtime Database node key.
 */
export function encodeEmailKey(email: string): string {
  return email.trim().toLowerCase().replace(/[\.#$\[\]\/]/g, "_");
}

export interface ResolvedRoleGrant {
  role: Role;
  universityId?: string;
  universityName?: string;
  canteenId?: string;
  canteenName?: string;
}

/**
 * Resolves whether an email address has been granted an administrative role
 * via pre-approved grants, approved university requests, or active canteens.
 */
export async function resolveRoleForEmail(email: string): Promise<ResolvedRoleGrant | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  // 1. Check preapprovedRoles
  try {
    const preSnap = await get(ref(db, `preapprovedRoles/${encodeEmailKey(cleanEmail)}`));
    if (preSnap.exists()) {
      const val = preSnap.val();
      if (val && val.role) {
        return {
          role: val.role as Role,
          universityId: val.universityId,
          universityName: val.universityName,
          canteenId: val.canteenId,
          canteenName: val.canteenName,
        };
      }
    }
  } catch (err) {
    console.warn("Could not check preapprovedRoles:", err);
  }

  // 2. Check active universities (universities has public read in security rules)
  try {
    const univSnap = await get(ref(db, "universities"));
    if (univSnap.exists()) {
      const allUnivs = univSnap.val();
      for (const uId of Object.keys(allUnivs)) {
        const u = allUnivs[uId];
        if (
          u.contactEmail &&
          u.contactEmail.trim().toLowerCase() === cleanEmail &&
          u.status === "Active"
        ) {
          return {
            role: "university",
            universityId: u.id || uId,
            universityName: u.name,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Could not check universities for role grant:", err);
  }

  // 3. Check active canteens (canteens has public read in security rules)
  try {
    const canteensSnap = await get(ref(db, "canteens"));
    if (canteensSnap.exists()) {
      const allCanteens = canteensSnap.val();
      for (const cId of Object.keys(allCanteens)) {
        const c = allCanteens[cId];
        if (
          c.ownerEmail &&
          c.ownerEmail.trim().toLowerCase() === cleanEmail
        ) {
          return {
            role: "canteen",
            canteenId: c.id || cId,
            canteenName: c.name,
            universityId: c.universityId,
            universityName: c.universityName,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Could not check canteens for role grant:", err);
  }

  // 4. Check universityRequests (if readable in current auth context)
  try {
    const uReqSnap = await get(ref(db, "universityRequests"));
    if (uReqSnap.exists()) {
      const allReqs = uReqSnap.val();
      for (const rId of Object.keys(allReqs)) {
        const req = allReqs[rId];
        if (
          req.email &&
          req.email.trim().toLowerCase() === cleanEmail &&
          req.status === "Approved"
        ) {
          return {
            role: "university",
            universityId: req.universityId,
            universityName: req.university,
          };
        }
      }
    }
  } catch {
    // Handled gracefully if restricted
  }

  // 5. Check canteenRequests (if readable in current auth context)
  try {
    const cReqSnap = await get(ref(db, "canteenRequests"));
    if (cReqSnap.exists()) {
      const allReqs = cReqSnap.val();
      for (const rId of Object.keys(allReqs)) {
        const req = allReqs[rId];
        if (
          req.email &&
          req.email.trim().toLowerCase() === cleanEmail &&
          req.status === "Approved"
        ) {
          return {
            role: "canteen",
            canteenId: req.canteenId,
            canteenName: req.canteenName,
            universityId: req.universityId,
            universityName: req.universityName,
          };
        }
      }
    }
  } catch {
    // Handled gracefully if restricted
  }

  return null;
}

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
  const email = (firebaseUser.email || additionalData?.email || "").trim().toLowerCase();

  // Check if this user's email has pre-approved or granted role access
  const roleGrant = email ? await resolveRoleForEmail(email) : null;

  if (existing) {
    // If user already exists in DB with default role (student/visitor), but was granted an administrative role:
    if (
      roleGrant &&
      (existing.role === "student" || existing.role === "visitor") &&
      roleGrant.role !== existing.role
    ) {
      const upgrades: Partial<UserProfile> = {
        role: roleGrant.role,
        updatedAt: Date.now(),
      };
      if (roleGrant.universityId) upgrades.universityId = roleGrant.universityId;
      if (roleGrant.universityName) upgrades.universityName = roleGrant.universityName;
      if (roleGrant.canteenId) upgrades.canteenId = roleGrant.canteenId;
      if (roleGrant.canteenName) upgrades.canteenName = roleGrant.canteenName;

      if (roleGrant.universityId) {
        upgrades.instituteMemberships = {
          ...(existing.instituteMemberships || {}),
          [roleGrant.universityId]: {
            universityId: roleGrant.universityId,
            universityName: roleGrant.universityName || "",
            status: "active",
            addedAt: Date.now(),
            addedBy: "admin_approval",
          },
        };
      }

      try {
        await update(ref(db, `users/${firebaseUser.uid}`), cleanForFirebase(upgrades));
      } catch (err) {
        console.error("Failed to upgrade user profile in db:", err);
      }
      return { ...existing, ...upgrades };
    }
    return existing;
  }

  const now = Date.now();
  const memberships: Record<string, InstituteMembership> = {};

  const assignedRole: UserRole = roleGrant?.role || additionalData?.role || "student";
  const assignedUnivId = roleGrant?.universityId || additionalData?.universityId;
  const assignedUnivName = roleGrant?.universityName || additionalData?.universityName;
  const assignedCanteenId = roleGrant?.canteenId || additionalData?.canteenId;
  const assignedCanteenName = roleGrant?.canteenName || additionalData?.canteenName;

  if (assignedUnivId) {
    memberships[assignedUnivId] = {
      universityId: assignedUnivId,
      universityName: assignedUnivName || "",
      status: "active",
      addedAt: now,
      addedBy: roleGrant ? "admin_approval" : "registration",
    };
  }

  const isStudentWithoutApproval = assignedRole === "student" && !roleGrant && !assignedUnivId;
  const profileStatus: "active" | "pending" | "suspended" = isStudentWithoutApproval ? "pending" : "active";

  const profile: UserProfile = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || additionalData?.displayName || (roleGrant?.role === "university" ? "Campus Admin" : roleGrant?.role === "canteen" ? "Canteen Owner" : "Campus User"),
    email: email,
    photoURL: firebaseUser.photoURL || null,
    role: assignedRole,
    status: profileStatus,
    isProfileComplete: Boolean(firebaseUser.displayName || additionalData?.displayName),
    createdAt: now,
    updatedAt: now,
  };

  if (assignedUnivId) profile.universityId = assignedUnivId;
  if (assignedUnivName) profile.universityName = assignedUnivName;
  if (assignedCanteenId) profile.canteenId = assignedCanteenId;
  if (assignedCanteenName) profile.canteenName = assignedCanteenName;
  if (Object.keys(memberships).length > 0) profile.instituteMemberships = memberships;

  try {
    const cleaned = cleanForFirebase(profile);
    await set(ref(db, `users/${firebaseUser.uid}`), cleaned);
  } catch (err) {
    console.error("Could not write user profile to database:", err);
  }

  return profile;
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  let profile = await fetchUserProfile(cred.user.uid);
  if (!profile || profile.role === "student" || profile.role === "visitor") {
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
  if (!profile || profile.role === "student" || profile.role === "visitor") {
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
  if (!profile || profile.role === "student" || profile.role === "visitor") {
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
