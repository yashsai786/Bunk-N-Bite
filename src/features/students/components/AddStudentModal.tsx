import React, { useState } from "react";
import { Mail, User, Hash, GraduationCap, Loader2, Check } from "lucide-react";
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
import { addSingleStudent } from "../services/studentService";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string;
  universityName: string;
  adminUid: string;
}

export function AddStudentModal({
  isOpen,
  onClose,
  universityId,
  universityName,
  adminUid,
}: AddStudentModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addSingleStudent(
        universityId,
        universityName,
        {
          email: email.trim(),
          name: name.trim() || undefined,
          studentId: studentId.trim() || undefined,
          department: department.trim() || undefined,
        },
        adminUid
      );

      if (res.isExistingAccount) {
        toast.success(`Enrolled existing user (${email.trim()}) to ${universityName}! Welcome email queued.`);
      } else {
        toast.success(`Student invitation created for ${email.trim()}! Invitation email with passwordless link queued.`);
      }

      setEmail("");
      setName("");
      setStudentId("");
      setDepartment("");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-6 shadow-card border border-border">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-base font-black tracking-tight text-foreground">
            Enroll Individual Student
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Add a student to <strong className="text-foreground">{universityName}</strong>. If an account already exists, they will be instantly enrolled; otherwise, a passwordless invitation will be issued.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Student Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="student@campus.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl pl-9 text-xs h-9 bg-card"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Full Name (Optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl pl-9 text-xs h-9 bg-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Student ID / Roll No</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="AU-2026-042"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="rounded-xl pl-9 text-xs h-9 bg-card"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Department</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="rounded-xl pl-9 text-xs h-9 bg-card"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs font-semibold h-8.5 px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold h-8.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" /> Adding...
                </span>
              ) : (
                "Enroll Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
