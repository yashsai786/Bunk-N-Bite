import { ref, push, set, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { sendPasswordlessSignInLink } from "@/features/auth/services/authService";

export interface MailTask {
  id: string;
  to: string;
  subject: string;
  template: "welcome_existing" | "invite_new";
  universityId: string;
  universityName: string;
  studentName?: string | undefined;
  studentId?: string | undefined;
  actionUrl: string;
  status: "queued" | "sent" | "failed";
  authLinkSent?: boolean | undefined;
  createdAt: number;
  sentAt?: number | undefined;
  error?: string | undefined;
  retries: number;
}

/**
 * Dispatches an email via the backend Nodemailer API route.
 */
async function dispatchEmailViaApi(payload: {
  to: string;
  subject: string;
  template: "welcome_existing" | "invite_new";
  universityName: string;
  studentName?: string | undefined;
  studentId?: string | undefined;
  actionUrl: string;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn("Direct /api/send-email dispatch error:", err);
    return { success: false, error: err?.message || "Network request failed" };
  }
}

/**
 * Queue a Welcome Email for a student who already has an account on BUNK N BITE.
 * Automatically dispatches the email via Nodemailer.
 */
export async function queueWelcomeExistingEmail(data: {
  email: string;
  studentName?: string | undefined;
  studentId?: string | undefined;
  universityId: string;
  universityName: string;
}): Promise<MailTask> {
  const cleanEmail = data.email.trim().toLowerCase();
  const queueRef = ref(db, "mailQueue");
  const newRef = push(queueRef);
  const id = newRef.key!;

  const urlOrigin = typeof window !== "undefined" ? window.location.origin : "https://bunknbite.web.app";
  const actionUrl = `${urlOrigin}/?signin=true&univId=${encodeURIComponent(data.universityId)}`;

  const task: MailTask = {
    id,
    to: cleanEmail,
    subject: `Welcome to ${data.universityName} on BUNK N BITE`,
    template: "welcome_existing",
    universityId: data.universityId,
    universityName: data.universityName,
    studentName: data.studentName,
    studentId: data.studentId,
    actionUrl,
    status: "queued",
    createdAt: Date.now(),
    retries: 0,
  };

  await set(newRef, task);

  // Dispatch live email via Nodemailer
  const dispatchRes = await dispatchEmailViaApi({
    to: cleanEmail,
    subject: task.subject,
    template: "welcome_existing",
    universityName: data.universityName,
    studentName: data.studentName,
    studentId: data.studentId,
    actionUrl,
  });

  if (dispatchRes.success) {
    const sentAt = Date.now();
    await update(ref(db, `mailQueue/${id}`), {
      status: "sent",
      sentAt,
    });
    task.status = "sent";
    task.sentAt = sentAt;
  } else {
    await update(ref(db, `mailQueue/${id}`), {
      status: "failed",
      error: dispatchRes.error || "Failed to dispatch via Nodemailer",
    });
    task.status = "failed";
    task.error = dispatchRes.error;
  }

  return task;
}

/**
 * Queue an Invitation Email for a new student who does NOT have an account yet.
 * Also triggers Firebase Authentication passwordless email link sending and Nodemailer dispatch.
 */
export async function queueInviteNewEmail(data: {
  email: string;
  studentName?: string | undefined;
  studentId?: string | undefined;
  universityId: string;
  universityName: string;
}): Promise<MailTask> {
  const cleanEmail = data.email.trim().toLowerCase();
  const queueRef = ref(db, "mailQueue");
  const newRef = push(queueRef);
  const id = newRef.key!;

  const urlOrigin = typeof window !== "undefined" ? window.location.origin : "https://bunknbite.web.app";
  const actionUrl = `${urlOrigin}/?emailLink=true&univId=${encodeURIComponent(data.universityId)}`;

  let authLinkSuccess = false;
  try {
    // Official Firebase Modular Web SDK sendSignInLinkToEmail
    await sendPasswordlessSignInLink(cleanEmail, data.universityId);
    authLinkSuccess = true;
  } catch (err: any) {
    console.warn("Could not dispatch client-side auth link (may require authorized domain in Firebase Console):", err);
  }

  const task: MailTask = {
    id,
    to: cleanEmail,
    subject: `Your ${data.universityName} BUNK N BITE invitation`,
    template: "invite_new",
    universityId: data.universityId,
    universityName: data.universityName,
    studentName: data.studentName,
    studentId: data.studentId,
    actionUrl,
    status: "queued",
    authLinkSent: authLinkSuccess,
    createdAt: Date.now(),
    retries: 0,
  };

  await set(newRef, task);

  // Dispatch live email via Nodemailer
  const dispatchRes = await dispatchEmailViaApi({
    to: cleanEmail,
    subject: task.subject,
    template: "invite_new",
    universityName: data.universityName,
    studentName: data.studentName,
    studentId: data.studentId,
    actionUrl,
  });

  if (dispatchRes.success) {
    const sentAt = Date.now();
    await update(ref(db, `mailQueue/${id}`), {
      status: "sent",
      sentAt,
    });
    task.status = "sent";
    task.sentAt = sentAt;
  } else {
    await update(ref(db, `mailQueue/${id}`), {
      status: "failed",
      error: dispatchRes.error || "Failed to dispatch via Nodemailer",
    });
    task.status = "failed";
    task.error = dispatchRes.error;
  }

  return task;
}
