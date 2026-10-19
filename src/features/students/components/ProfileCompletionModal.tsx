import React, { useState } from "react";
import { User, Hash, Lock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/features/auth/types";
import {
  updateUserProfileDetails,
  setOptionalAccountPassword,
} from "@/features/auth/services/authService";

interface ProfileCompletionModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onComplete: () => void;
}

export function ProfileCompletionModal({
  user,
  isOpen,
  onComplete,
}: ProfileCompletionModalProps) {
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [studentId, setStudentId] = useState("");
  const [optionalPassword, setOptionalPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfileDetails(user.uid, {
        displayName: fullName.trim(),
        isProfileComplete: true,
      });

      // Optional password setup if user typed one
      if (optionalPassword.trim() && optionalPassword.trim().length >= 6) {
        try {
          await setOptionalAccountPassword(optionalPassword.trim());
          toast.success("Account password set successfully!");
        } catch (pwErr: any) {
          toast.warning("Profile saved, but password setup failed: " + (pwErr?.message || ""));
        }
      }

      toast.success("Profile completed! Welcome to BUNK N BITE.");
      onComplete();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md rounded-2xl p-6 shadow-card border border-border">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <CheckCircle2 className="size-4" />
            </div>
            <DialogTitle className="text-base font-black tracking-tight text-foreground">
              Complete Your Student Profile
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            You are signed in via secure email link ({user.email}). Confirm your name to activate your campus dining counter pass.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl pl-9 text-xs h-9 bg-card"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Student ID / Roll No (Optional)</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="e.g. AU-2026-081"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="rounded-xl pl-9 text-xs h-9 bg-card"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-border/50">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">Set Optional Password</Label>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Leave blank for passwordless sign-in"
                value={optionalPassword}
                onChange={(e) => setOptionalPassword(e.target.value)}
                className="rounded-xl pl-9 text-xs h-9 bg-card"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              You can always sign in passwordlessly via email link without setting a password.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" /> Saving...
                </span>
              ) : (
                <>
                  Enter BUNK N BITE <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
