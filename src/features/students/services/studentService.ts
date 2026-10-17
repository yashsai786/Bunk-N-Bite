import {
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  query,
  orderByChild,
  equalTo,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";
import type {
  InstituteMembership,
  UserProfile,
  StudentInvitation,
  UniversityStudentMember,
} from "@/features/auth/types";
import {
  queueWelcomeExistingEmail,
  queueInviteNewEmail,
} from "@/features/mail/services/mailService";

/**
 * Subscribe to Realtime university student memberships
 */
export function subscribeToUniversityMembers(
  universityId: string,
  onData: (members: UniversityStudentMember[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const membersRef = ref(db, `universityMemberships/${universityId}`);
  return onValue(
    membersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: UniversityStudentMember[] = Object.keys(val).map((key) => ({
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
 * Find a user in the `users` table by email
 */
export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const q = query(ref(db, "users"), orderByChild("email"), equalTo(cleanEmail));
    const snapshot = await get(q);
    if (snapshot.exists()) {
      const val = snapshot.val();
      const firstKey = Object.keys(val)[0];
      if (firstKey && val[firstKey]) {
        return val[firstKey] as UserProfile;
      }
    }
  } catch (err) {
    console.warn("Index query on users.email failed, falling back to direct scan:", err);
    try {
      const allUsersSnap = await get(ref(db, "users"));
      if (allUsersSnap.exists()) {
        const val = allUsersSnap.val();
        for (const uid of Object.keys(val)) {
          if (val[uid]?.email?.toLowerCase() === cleanEmail) {
            return val[uid] as UserProfile;
          }
        }
      }
    } catch (fallbackErr) {
      console.error("Could not scan users:", fallbackErr);
    }
  }
  return null;
}

/**
 * Add a single student by email
 */
export async function addSingleStudent(
  universityId: string,
  universityName: string,
  data: {
    email: string;
    name?: string | undefined;
    studentId?: string | undefined;
    department?: string | undefined;
  },
  adminUid: string
): Promise<{ success: boolean; isExistingAccount: boolean; memberId: string }> {
  const cleanEmail = data.email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("A valid email address is required.");
  }

  const now = Date.now();
  const existingUser = await findUserByEmail(cleanEmail);

  if (existingUser) {
    const uid = existingUser.uid;
    const existingMembership = existingUser.instituteMemberships?.[universityId];

    if (existingMembership && existingMembership.status === "active") {
      throw new Error(`Student ${cleanEmail} is already actively enrolled in this university.`);
    }

    // 1. Add/Update institute membership on user profile
    const membership: InstituteMembership = {
      universityId,
      universityName,
      status: "active",
      studentId: data.studentId?.trim() || existingMembership?.studentId,
      department: data.department?.trim() || existingMembership?.department || "General",
      addedAt: existingMembership?.addedAt || now,
      addedBy: adminUid,
      updatedAt: now,
      updatedBy: adminUid,
    };

    await update(ref(db, `users/${uid}/instituteMemberships/${universityId}`), membership);

    // Also update active university context if user has none
    if (!existingUser.universityId) {
      await update(ref(db, `users/${uid}`), {
        universityId,
        universityName,
      });
    }

    // 2. Index in universityMemberships/{universityId}/{uid}
    const memberRecord: UniversityStudentMember = {
      id: uid,
      uid,
      email: cleanEmail,
      name: data.name?.trim() || existingUser.displayName || cleanEmail.split("@")[0] || "Student",
      studentId: data.studentId?.trim() || existingMembership?.studentId || "",
      department: data.department?.trim() || existingMembership?.department || "General",
      universityId,
      universityName,
      status: "active",
      isInvitation: false,
      addedAt: existingMembership?.addedAt || now,
      addedBy: adminUid,
      updatedAt: now,
      updatedBy: adminUid,
    };

    await set(ref(db, `universityMemberships/${universityId}/${uid}`), memberRecord);

    // 3. Queue Welcome Email
    await queueWelcomeExistingEmail({
      email: cleanEmail,
      studentName: memberRecord.name,
      studentId: memberRecord.studentId,
      universityId,
      universityName,
    });

    return { success: true, isExistingAccount: true, memberId: uid };
  } else {
    // New Account: Create invitation and pending membership
    const invRef = push(ref(db, "studentInvitations"));
    const invitationId = invRef.key!;

    const invitation: StudentInvitation = {
      id: invitationId,
      email: cleanEmail,
      name: data.name?.trim() || undefined,
      studentId: data.studentId?.trim() || undefined,
      department: data.department?.trim() || "General",
      universityId,
      universityName,
      status: "pending",
      invitedAt: now,
      invitedBy: adminUid,
    };

    await set(invRef, invitation);

    // Index in universityMemberships
    const memberRecord: UniversityStudentMember = {
      id: invitationId,
      email: cleanEmail,
      name: data.name?.trim() || cleanEmail.split("@")[0] || "Invited Student",
      studentId: data.studentId?.trim() || "",
      department: data.department?.trim() || "General",
      universityId,
      universityName,
      status: "pending",
      isInvitation: true,
      invitationId,
      addedAt: now,
      addedBy: adminUid,
    };

    await set(ref(db, `universityMemberships/${universityId}/${invitationId}`), memberRecord);

    // Queue Invitation Email & Dispatch Passwordless Link
    await queueInviteNewEmail({
      email: cleanEmail,
      studentName: data.name?.trim(),
      studentId: data.studentId?.trim(),
      universityId,
      universityName,
    });

    return { success: true, isExistingAccount: false, memberId: invitationId };
  }
}

/**
 * Remove a student from a university
 * Strict: Never deletes Firebase Auth account or global profile or other memberships!
 */
export async function removeStudentMembership(
  universityId: string,
  memberId: string,
  adminUid: string
): Promise<void> {
  const memberSnap = await get(ref(db, `universityMemberships/${universityId}/${memberId}`));
  if (!memberSnap.exists()) {
    throw new Error("Student membership record not found.");
  }

  const member = memberSnap.val() as UniversityStudentMember;

  // 1. Remove from universityMemberships
  await remove(ref(db, `universityMemberships/${universityId}/${memberId}`));

  // 2. If it was an invitation, cancel invitation
  if (member.isInvitation && member.invitationId) {
    await update(ref(db, `studentInvitations/${member.invitationId}`), {
      status: "cancelled",
    });
  }

  // 3. If it is an existing user account
  if (member.uid) {
    const userRef = ref(db, `users/${member.uid}`);
    const userSnap = await get(userRef);

    if (userSnap.exists()) {
      const user = userSnap.val() as UserProfile;

      // Remove specific institute membership
      await remove(ref(db, `users/${member.uid}/instituteMemberships/${universityId}`));

      // If active context matches removed university, switch to another active one or null
      if (user.universityId === universityId) {
        const remaining = { ...(user.instituteMemberships || {}) };
        delete remaining[universityId];

        const otherActive = Object.values(remaining).find((m) => m.status === "active");
        await update(userRef, {
          universityId: otherActive?.universityId || null,
          universityName: otherActive?.universityName || null,
          updatedAt: Date.now(),
        });
      }
    }
  }
}

/**
 * Suspend or reactivate a student's membership for a specific university
 */
export async function setStudentMembershipStatus(
  universityId: string,
  memberId: string,
  newStatus: "active" | "suspended",
  adminUid: string
): Promise<void> {
  const memberRef = ref(db, `universityMemberships/${universityId}/${memberId}`);
  const memberSnap = await get(memberRef);
  if (!memberSnap.exists()) {
    throw new Error("Student record not found in this university.");
  }

  const member = memberSnap.val() as UniversityStudentMember;
  const now = Date.now();

  // Update universityMemberships record
  await update(memberRef, {
    status: newStatus,
    updatedAt: now,
    updatedBy: adminUid,
  });

  // If user account exists, update user's instituteMemberships
  if (member.uid) {
    await update(ref(db, `users/${member.uid}/instituteMemberships/${universityId}`), {
      status: newStatus,
      updatedAt: now,
      updatedBy: adminUid,
    });
  }
}

/**
 * Bulk suspend or reactivate student memberships
 */
export async function bulkUpdateStudentStatus(
  universityId: string,
  emails: string[],
  newStatus: "active" | "suspended",
  adminUid: string
): Promise<{ updatedCount: number; notFoundEmails: string[]; failedCount: number }> {
  const membersSnap = await get(ref(db, `universityMemberships/${universityId}`));
  if (!membersSnap.exists()) {
    return { updatedCount: 0, notFoundEmails: emails, failedCount: 0 };
  }

  const membersVal = membersSnap.val();
  const emailToMemberMap: Record<string, UniversityStudentMember> = {};

  Object.keys(membersVal).forEach((key) => {
    const item = membersVal[key] as UniversityStudentMember;
    if (item.email) {
      emailToMemberMap[item.email.toLowerCase().trim()] = { ...item, id: key };
    }
  });

  let updatedCount = 0;
  let failedCount = 0;
  const notFoundEmails: string[] = [];

  // Process in bounded batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const slice = emails.slice(i, i + BATCH_SIZE);
    await Promise.all(
      slice.map(async (rawEmail) => {
        const clean = rawEmail.toLowerCase().trim();
        const member = emailToMemberMap[clean];
        if (!member) {
          notFoundEmails.push(clean);
          return;
        }

        try {
          await setStudentMembershipStatus(universityId, member.id, newStatus, adminUid);
          updatedCount += 1;
        } catch (err) {
          console.error(`Failed to update status for ${clean}:`, err);
          failedCount += 1;
        }
      })
    );
  }

  return { updatedCount, notFoundEmails, failedCount };
}

/**
 * Resolve pending invitations when a student completes sign in
 */
export async function resolvePendingInvitationsForEmail(
  email: string,
  uid: string,
  displayName?: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const invSnap = await get(ref(db, "studentInvitations"));
    if (!invSnap.exists()) return;

    const val = invSnap.val();
    const now = Date.now();

    for (const invId of Object.keys(val)) {
      const inv = val[invId] as StudentInvitation;
      if (inv.email?.toLowerCase().trim() === cleanEmail && inv.status === "pending") {
        const universityId = inv.universityId;

        // 1. Create membership on user profile
        const membership: InstituteMembership = {
          universityId,
          universityName: inv.universityName,
          status: "active",
          studentId: inv.studentId,
          department: inv.department || "General",
          addedAt: inv.invitedAt || now,
          addedBy: inv.invitedBy || "invitation",
          updatedAt: now,
          updatedBy: uid,
        };

        await update(ref(db, `users/${uid}/instituteMemberships/${universityId}`), membership);

        // 2. Set active context if missing
        const userSnap = await get(ref(db, `users/${uid}`));
        if (userSnap.exists()) {
          const user = userSnap.val() as UserProfile;
          if (!user.universityId) {
            await update(ref(db, `users/${uid}`), {
              universityId,
              universityName: inv.universityName,
            });
          }
        }

        // 3. Replace invitation record in universityMemberships with proper UID record
        await remove(ref(db, `universityMemberships/${universityId}/${invId}`));

        const memberRecord: UniversityStudentMember = {
          id: uid,
          uid,
          email: cleanEmail,
          name: displayName || inv.name || cleanEmail.split("@")[0] || "Student",
          studentId: inv.studentId || "",
          department: inv.department || "General",
          universityId,
          universityName: inv.universityName,
          status: "active",
          isInvitation: false,
          addedAt: inv.invitedAt || now,
          addedBy: inv.invitedBy || "invitation",
          updatedAt: now,
          updatedBy: uid,
        };

        await set(ref(db, `universityMemberships/${universityId}/${uid}`), memberRecord);

        // 4. Mark invitation accepted
        await update(ref(db, `studentInvitations/${invId}`), {
          status: "accepted",
          acceptedAt: now,
        });
      }
    }
  } catch (err) {
    console.error("Failed resolving invitations for", cleanEmail, err);
  }
}

/**
 * Safe Migration Strategy:
 * Converts existing legacy user records with single universityId into multi-institute memberships
 */
export async function migrateLegacyUserData(
  adminUid: string
): Promise<{ migratedCount: number; scannedCount: number }> {
  try {
    const usersSnap = await get(ref(db, "users"));
    if (!usersSnap.exists()) return { migratedCount: 0, scannedCount: 0 };

    const users = usersSnap.val();
    let migratedCount = 0;
    let scannedCount = 0;
    const now = Date.now();

    for (const uid of Object.keys(users)) {
      scannedCount += 1;
      const user = users[uid] as UserProfile;

      // Check if user has legacy universityId but no instituteMemberships
      if (user.universityId && (!user.instituteMemberships || Object.keys(user.instituteMemberships).length === 0)) {
        const uId = user.universityId;
        const uName = user.universityName || "Campus";

        const membership: InstituteMembership = {
          universityId: uId,
          universityName: uName,
          status: user.status === "suspended" ? "suspended" : "active",
          addedAt: user.createdAt || now,
          addedBy: "legacy_migration",
        };

        // Write to user profile
        await update(ref(db, `users/${uid}/instituteMemberships/${uId}`), membership);

        // Write index in universityMemberships
        const memberRecord: UniversityStudentMember = {
          id: uid,
          uid,
          email: user.email,
          name: user.displayName || user.email.split("@")[0] || "Student",
          universityId: uId,
          universityName: uName,
          status: user.status === "suspended" ? "suspended" : "active",
          isInvitation: false,
          addedAt: user.createdAt || now,
          addedBy: "legacy_migration",
        };

        await set(ref(db, `universityMemberships/${uId}/${uid}`), memberRecord);
        migratedCount += 1;
      }
    }

    return { migratedCount, scannedCount };
  } catch (err) {
    console.error("Legacy migration error:", err);
    return { migratedCount: 0, scannedCount: 0 };
  }
}
