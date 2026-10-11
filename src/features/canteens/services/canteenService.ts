import {
  ref,
  get,
  set,
  push,
  update,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";
import type { Canteen, CanteenRequest } from "@/features/bunk/types";

/**
 * Realtime listener for Canteens
 */
export function subscribeToCanteens(
  onData: (canteens: Canteen[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const canteensRef = ref(db, "canteens");
  return onValue(
    canteensRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: Canteen[] = Object.keys(val).map((key) => ({
          ...val[key],
          id: val[key].id || key,
        }));
        onData(list);
      } else {
        onData([]);
      }
    },
    onError
  );
}

/**
 * Realtime listener for Canteen Requests
 */
export function subscribeToCanteenRequests(
  onData: (requests: CanteenRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const reqRef = ref(db, "canteenRequests");
  return onValue(
    reqRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: CanteenRequest[] = Object.keys(val).map((key) => ({
          ...val[key],
          id: val[key].id || key,
        }));
        onData(list);
      } else {
        onData([]);
      }
    },
    onError
  );
}

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserProfile } from "@/features/auth/services/authService";
import { resolveCampusCode } from "@/features/universities/services/universityService";

/**
 * Submit a Canteen Onboarding Request using a 6-character Campus Code
 */
export async function submitCanteenRequestWithCampusCode(data: {
  canteenName: string;
  ownerName: string;
  email: string;
  password?: string | undefined;
  phone?: string | undefined;
  campusCode: string;
  cuisine?: string | undefined;
}): Promise<string> {
  const normalizedCode = data.campusCode.trim().toUpperCase();
  const campus = await resolveCampusCode(normalizedCode);

  if (!campus) {
    throw new Error("Invalid or unverified Campus Code. Please confirm the 6-character code with your university administration.");
  }

  // If user is not authenticated and password was supplied, register or authenticate account
  let uid = auth.currentUser?.uid;
  if (!uid && data.password && data.password.length >= 6) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      uid = cred.user.uid;
      await ensureUserProfile(cred.user, {
        displayName: data.ownerName.trim(),
        role: "canteen",
        universityId: campus.universityId,
        universityName: campus.universityName,
      });
    } catch (authErr: any) {
      if (authErr?.code === "auth/email-already-in-use") {
        try {
          const cred = await signInWithEmailAndPassword(auth, data.email.trim(), data.password);
          uid = cred.user.uid;
        } catch {
          // Continue request creation
        }
      }
    }
  }

  const reqRef = ref(db, "canteenRequests");
  const newRef = push(reqRef);
  const id = newRef.key!;

  const newRequest: CanteenRequest = {
    id,
    canteenName: data.canteenName.trim(),
    campusCode: normalizedCode,
    universityId: campus.universityId,
    universityName: campus.universityName,
    ownerName: data.ownerName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() || "+91 98765 00000",
    cuisine: data.cuisine?.trim() || "Multi-Cuisine",
    status: "Pending",
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };

  await set(newRef, newRequest);
  return id;
}

/**
 * Approve a Canteen Onboarding Request (University Admin operation)
 */
export async function approveCanteenRequestInDb(
  requestId: string,
  request: CanteenRequest
): Promise<void> {
  // 1. Update request status
  await update(ref(db, `canteenRequests/${requestId}`), {
    status: "Approved",
  });

  // 2. Create the canteen record
  const canteenId = `canteen-${Date.now()}`;
  const newCanteen: Canteen = {
    id: canteenId,
    name: request.canteenName,
    universityId: request.universityId,
    universityName: request.universityName,
    owner: request.ownerName,
    ownerEmail: request.email,
    phone: request.phone,
    status: "Open",
    operationalStatus: "Active",
    items: 0,
    orders: 0,
    openingHours: "08:30 AM – 08:00 PM",
    counterLocation: "Food Court Counter",
  };

  await set(ref(db, `canteens/${canteenId}`), newCanteen);
}

/**
 * Toggle Canteen Operational Status (Active <-> Suspended)
 * Controlled exclusively by University Admin for this campus.
 */
export async function toggleCanteenOperationalStatusInDb(
  canteenId: string,
  nextOperationalStatus: "Active" | "Suspended"
): Promise<void> {
  await update(ref(db, `canteens/${canteenId}`), {
    operationalStatus: nextOperationalStatus,
    status: nextOperationalStatus === "Active" ? "Open" : "Closed",
  });
}

/**
 * Reject a Canteen Onboarding Request
 */
export async function rejectCanteenRequestInDb(requestId: string): Promise<void> {
  await update(ref(db, `canteenRequests/${requestId}`), {
    status: "Rejected",
  });
}
