import React, { useState } from "react";
import {
  User,
  Mail,
  Hash,
  GraduationCap,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmModal } from "@/features/bunk/components/ConfirmModal";
import type { UniversityStudentMember } from "@/features/auth/types";
import {
  setStudentMembershipStatus,
  removeStudentMembership,
} from "../services/studentService";

interface StudentDetailModalProps {
  member: UniversityStudentMember | null;
  onClose: () => void;
  universityId: string;
  universityName: string;
  adminUid: string;
}

export function StudentDetailModal({
  member,
  onClose,
  universityId,
  universityName,
  adminUid,
}: StudentDetailModalProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!member) return null;

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    const newStatus = member.status === "suspended" ? "active" : "suspended";
    try {
      await setStudentMembershipStatus(universityId, member.id, newStatus, adminUid);
      if (newStatus === "active") {
        toast.success(`Membership for ${member.name} reactivated.`);
      } else {
        toast.warning(`Membership for ${member.name} suspended.`);
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update membership status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmRemove = async () => {
    setIsUpdating(true);
    try {
      await removeStudentMembership(universityId, member.id, adminUid);
      toast.info(`Removed ${member.name} from ${universityName}. Global account preserved.`);
      setConfirmRemove(false);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove student.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Dialog open={!!member && !confirmRemove} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md rounded-2xl p-6 shadow-card border border-border">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-black tracking-tight text-foreground">
                Student Membership Record
              </DialogTitle>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  member.status === "active"
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25"
                    : member.status === "suspended"
                    ? "bg-rose-500/15 text-rose-600 border border-rose-500/25"
                    : "bg-amber-500/15 text-amber-600 border border-amber-500/25"
                }`}
              >
                {member.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{universityName}</p>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5" /> Full Name
                </span>
                <span className="font-bold text-foreground">{member.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5" /> Email
                </span>
                <span className="font-mono text-foreground font-medium">{member.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Hash className="size-3.5" /> Student ID
                </span>
                <span className="font-mono text-foreground font-bold">{member.studentId || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="size-3.5" /> Department
                </span>
                <span className="font-medium text-foreground">{member.department || "General"}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" /> Enrolled / Invited
                </span>
                <span className="text-muted-foreground">
                  {new Date(member.addedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating}
                onClick={() => setConfirmRemove(true)}
                className="h-8 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 border-border"
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Remove from University
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isUpdating}
                  className="h-8 rounded-xl text-xs font-semibold"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={isUpdating || member.status === "pending"}
                  onClick={handleToggleStatus}
                  className={`h-8 rounded-xl text-xs font-bold ${
                    member.status === "suspended"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {isUpdating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : member.status === "suspended" ? (
                    <>
                      <ShieldCheck className="mr-1.5 size-3.5" /> Reactivate
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="mr-1.5 size-3.5" /> Suspend
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Membership Removal */}
      <ConfirmModal
        open={confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(false)}
        title="Remove Student from University?"
        description={`Remove ${member.name} (${member.email}) from ${universityName}? This action only removes membership in this university. The user's BUNK N BITE global account and any other university memberships remain completely intact.`}
        confirmLabel="Remove Membership"
        isDestructive={true}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
