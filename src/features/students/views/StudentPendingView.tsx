import React, { useState } from "react";
import {
  Building2,
  Clock,
  KeyRound,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBunk } from "@/features/bunk/state";
import { redeemStudentCampusCode } from "@/features/students/services/studentService";
import { fetchUserProfile } from "@/features/auth/services/authService";

export function StudentPendingView() {
  const { currentUser, logout, setCurrentUser, setSelectedUniversityId } = useBunk();
  const [campusCode, setCampusCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusCode.trim()) {
      toast.error("Please enter a valid 6-character campus code.");
      return;
    }
    if (!currentUser) return;

    setIsVerifying(true);
    try {
      const res = await redeemStudentCampusCode(campusCode.trim(), currentUser);
      toast.success(`Campus access granted for ${res.universityName}!`);
      // Update local state immediately
      setSelectedUniversityId(res.universityId);
      const updated = await fetchUserProfile(currentUser.uid);
      if (updated) {
        setCurrentUser(updated);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to redeem campus code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      const updated = await fetchUserProfile(currentUser.uid);
      if (updated) {
        if (updated.status === "active" && (updated.universityId || updated.instituteMemberships)) {
          toast.success("Campus access detected! Loading your dining dashboard...");
          setCurrentUser(updated);
        } else {
          toast.info("Your account is still awaiting approval from campus administration.");
        }
      }
    } catch {
      toast.error("Could not refresh access status. Please check connectivity.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-8 px-4 sm:py-12 sm:px-6">
      <div className="rounded-3xl border border-amber-300/60 bg-card p-6 sm:p-9 shadow-card">
        {/* Status header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="size-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  Access Pending
                </span>
              </div>
              <h1 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Awaiting Campus Authorization
              </h1>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={logout}
            className="rounded-full text-xs font-semibold gap-1.5 self-start sm:self-center text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-3.5" />
            Sign Out
          </Button>
        </div>

        {/* User Info banner */}
        <div className="mt-5 rounded-2xl border border-border/70 bg-muted/30 p-4 text-xs">
          <p className="font-semibold text-foreground">
            Signed in as: <span className="font-bold">{currentUser?.displayName || "Campus Student"}</span> ({currentUser?.email})
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Your account has been created. However, your university dining network has not granted you access yet.
          </p>
        </div>

        {/* Informational Guidance */}
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-border/60 bg-card p-4 text-xs space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="size-4 text-primary" />
              What should you do?
            </h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li>Wait until your University Administrator adds your email to the campus student roll.</li>
              <li>Or, if you received an official <strong>6-character Campus Code</strong> from your university, enter it below to activate access immediately.</li>
            </ul>
          </div>
        </div>

        {/* Self-Activation via Campus Code Form */}
        <form onSubmit={handleRedeemCode} className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <KeyRound className="size-4 text-primary" />
            <span>Have an official Campus Code?</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Enter the 6-character code provided by your campus estate or canteen authority (e.g. <span className="font-mono font-bold text-foreground">AU2026</span>) to link your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Input
              value={campusCode}
              onChange={(e) => setCampusCode(e.target.value.toUpperCase())}
              placeholder="ENTER 6-CHAR CODE"
              maxLength={8}
              className="font-mono text-center sm:text-left text-sm tracking-widest uppercase rounded-xl bg-background"
            />
            <Button
              type="submit"
              disabled={isVerifying || !campusCode.trim()}
              className="rounded-xl text-xs font-bold gap-1.5 shrink-0 px-4"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Activate Access
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground text-center sm:text-left">
            Did your campus administrator just approve you? Click refresh to check:
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="rounded-full text-xs font-semibold gap-1.5 shrink-0"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}
