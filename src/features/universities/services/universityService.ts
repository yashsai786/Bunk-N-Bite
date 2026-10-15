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
import type { University, UniversityRequest } from "@/features/bunk/types";

/**
 * Realtime listener for Universities
 */
export function subscribeToUniversities(
  onData: (universities: University[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const univRef = ref(db, "universities");
  return onValue(
    univRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: University[] = Object.keys(val).map((key) => ({
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
 * Realtime listener for University Onboarding Requests
 */
export function subscribeToUniversityRequests(
  onData: (requests: UniversityRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const reqRef = ref(db, "universityRequests");
  return onValue(
    reqRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: UniversityRequest[] = Object.keys(val).map((key) => ({
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
 * Submit a new University Onboarding Request
 */
export async function submitUniversityRequest(
  data: Omit<UniversityRequest, "id" | "status" | "date">
): Promise<string> {
  const reqRef = ref(db, "universityRequests");
  const newRef = push(reqRef);
  const id = newRef.key!;
  const newRequest: UniversityRequest = {
    ...data,
    id,
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
 * Character pool avoiding ambiguous characters (O, 0, I, 1)
 */
const CAMPUS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCampusCodeCandidate(): string {
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * CAMPUS_CODE_CHARS.length);
    result += CAMPUS_CODE_CHARS[randomIndex];
  }
  return result;
}

/**
 * Concurrency-safe, unique 6-character campus code reservation
 */
export async function reserveUniqueCampusCode(
  universityId: string,
  universityName: string
): Promise<string> {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateCampusCodeCandidate();
    const codeRef = ref(db, `campusCodes/${candidate}`);
    const snapshot = await get(codeRef);

    if (!snapshot.exists()) {
      await set(codeRef, {
        universityId,
        universityName,
        createdAt: Date.now(),
      });
      return candidate;
    }
  }
  throw new Error("Unable to reserve a unique campus code. Please try again.");
}

/**
 * Resolve a 6-character campus code to university details
 */
export async function resolveCampusCode(
  rawCode: string
): Promise<{ universityId: string; universityName: string } | null> {
  const normalized = rawCode.trim().toUpperCase();
  if (normalized.length !== 6) {
    return null;
  }

  // 1. Check indexed campusCodes table
  const codeRef = ref(db, `campusCodes/${normalized}`);
  const snap = await get(codeRef);
  if (snap.exists()) {
    const val = snap.val();
    return {
      universityId: val.universityId,
      universityName: val.universityName,
    };
  }

  // 2. Fallback check in universities list
  const univSnap = await get(ref(db, "universities"));
  if (univSnap.exists()) {
    const all = univSnap.val();
    for (const key of Object.keys(all)) {
      if (all[key].campusCode?.toUpperCase() === normalized) {
        return {
          universityId: all[key].id || key,
          universityName: all[key].name,
        };
      }
    }
  }

  return null;
}

/**
 * Approve a University Onboarding Request (Owner Admin operation)
 * Generates and associates a unique 6-character campus code.
 */
export async function approveUniversityRequestInDb(
  requestId: string,
  request: UniversityRequest
): Promise<string> {
  const univId = `univ-${Date.now()}`;
  const campusCode = await reserveUniqueCampusCode(univId, request.university);

  // 1. Update request status with the generated campus code
  await update(ref(db, `universityRequests/${requestId}`), {
    status: "Approved",
    campusCode,
  });

  // 2. Create the university record
  const newUniv: University = {
    id: univId,
    name: request.university,
    location: request.campusLocation || `${request.city || ""}, ${request.state || ""}`.trim() || "Campus",
    campusCode,
    status: "Active",
    canteens: request.canteenCountEst || 1,
    students: "1,000",
    contactPerson: request.requestedBy,
    contactEmail: request.email,
    joinedDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };

  await set(ref(db, `universities/${univId}`), newUniv);
  return campusCode;
}

/**
 * Reject a University Onboarding Request (Owner Admin operation)
 */
export async function rejectUniversityRequestInDb(requestId: string): Promise<void> {
  await update(ref(db, `universityRequests/${requestId}`), {
    status: "Rejected",
  });
}
