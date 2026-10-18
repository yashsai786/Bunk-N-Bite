import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UniversityStudentMember } from "@/features/auth/types";
import {
  parseStudentXlsx,
  downloadSampleBulkActionsTemplate,
} from "../utils/xlsxHelper";
import { bulkUpdateStudentStatus } from "../services/studentService";

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string;
  universityName: string;
  adminUid: string;
  existingMembers: UniversityStudentMember[];
}

export function BulkActionsModal({
  isOpen,
  onClose,
  universityId,
  universityName,
  adminUid,
  existingMembers,
}: BulkActionsModalProps) {
  const [actionType, setActionType] = useState<"suspend" | "reactivate">("suspend");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [matchingMembers, setMatchingMembers] = useState<UniversityStudentMember[]>([]);
  const [unmatchedEmails, setUnmatchedEmails] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultSummary, setResultSummary] = useState<{ updated: number; failed: number } | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    setIsParsing(false);
    setParsedEmails([]);
    setMatchingMembers([]);
    setUnmatchedEmails([]);
    setIsProcessing(false);
    setResultSummary(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    try {
      const rawRows = await parseStudentXlsx(file);
      if (rawRows.length === 0) {
        toast.error("Spreadsheet is empty.");
        setIsParsing(false);
        return;
      }

      // Extract unique emails
      const emailList: string[] = [];
      rawRows.forEach((r) => {
        const email = (r["Email"] || r["email"] || r["Student Email"] || "").toLowerCase().trim();
        if (email && email.includes("@") && !emailList.includes(email)) {
          emailList.push(email);
        }
      });

      if (emailList.length === 0) {
        toast.error("No valid email addresses found in the spreadsheet.");
        setIsParsing(false);
        return;
      }

      // Match against existing members in this university
      const matched: UniversityStudentMember[] = [];
      const unmatched: string[] = [];
      const memberEmailMap = new Map<string, UniversityStudentMember>();

      existingMembers.forEach((m) => {
        if (m.email) {
          memberEmailMap.set(m.email.toLowerCase().trim(), m);
        }
      });

      emailList.forEach((e) => {
        const found = memberEmailMap.get(e);
        if (found) {
          matched.push(found);
        } else {
          unmatched.push(e);
        }
      });

      setParsedEmails(emailList);
      setMatchingMembers(matched);
      setUnmatchedEmails(unmatched);
    } catch (err: any) {
      toast.error(err?.message || "Failed to parse file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteBulkAction = async () => {
    if (matchingMembers.length === 0) {
      toast.error("No matching enrolled students found in this university.");
      return;
    }

    setIsProcessing(true);
    try {
      const emailsToProcess = matchingMembers.map((m) => m.email);
      const targetStatus = actionType === "suspend" ? "suspended" : "active";

      const res = await bulkUpdateStudentStatus(
        universityId,
        emailsToProcess,
        targetStatus,
        adminUid
      );

      setResultSummary({
        updated: res.updatedCount,
        failed: res.failedCount,
      });

      if (actionType === "suspend") {
        toast.warning(`Bulk suspended ${res.updatedCount} student memberships.`);
      } else {
        toast.success(`Bulk reactivated ${res.updatedCount} student memberships.`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Bulk operation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetState();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-xl rounded-2xl p-6 shadow-card border border-border">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              {actionType === "suspend" ? (
                <ShieldAlert className="size-4 text-rose-600" />
              ) : (
                <ShieldCheck className="size-4 text-emerald-600" />
              )}
              Bulk Student Actions (XLSX)
            </DialogTitle>
            <span className="text-[11px] font-bold text-muted-foreground">{universityName}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Apply bulk membership status updates to multiple enrolled students using an Excel spreadsheet.
          </p>
        </DialogHeader>

        {/* Action Selector */}
        {!resultSummary && (
          <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => {
                setActionType("suspend");
                resetState();
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                actionType === "suspend"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-card"
              }`}
            >
              Bulk Suspend Memberships
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType("reactivate");
                resetState();
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                actionType === "reactivate"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-card"
              }`}
            >
              Bulk Reactivate Memberships
            </button>
          </div>
        )}

        {/* Upload Zone */}
        {!resultSummary && !parsedEmails.length && (
          <div className="space-y-4 pt-1">
            <div className="rounded-xl border-2 border-dashed border-border/80 p-6 text-center hover:border-primary/60 transition-colors bg-muted/20">
              <input
                type="file"
                id="bulk-actions-upload"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isParsing}
                className="hidden"
              />
              <label
                htmlFor="bulk-actions-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  {isParsing ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <Upload className="size-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {isParsing ? "Reading spreadsheet..." : "Click to upload student roster"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Columns: Email (Required), Student ID (Optional)
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 text-xs">
              <span className="text-muted-foreground text-[11px]">
                Download a clean two-column template.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleBulkActionsTemplate}
                className="h-7 text-xs font-semibold gap-1.5"
              >
                <Download className="size-3" />
                Template
              </Button>
            </div>
          </div>
        )}

        {/* Preview of Matched & Unmatched */}
        {!resultSummary && parsedEmails.length > 0 && (
          <div className="space-y-3.5 pt-1">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Targeted Campus Members
                </p>
                <p className="font-mono text-xl font-black text-primary">{matchingMembers.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Will be {actionType}ed</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Unmatched Emails
                </p>
                <p className="font-mono text-xl font-black text-muted-foreground">{unmatchedEmails.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Not in this university</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 max-h-40 overflow-y-auto space-y-1 text-xs">
              <p className="text-[10px] font-bold uppercase text-muted-foreground sticky top-0 bg-card pb-1">
                Preview of students to be {actionType}ed:
              </p>
              {matchingMembers.slice(0, 8).map((m, i) => (
                <div key={i} className="flex justify-between items-center py-0.5 border-b border-border/40 text-[11px]">
                  <span className="font-semibold text-foreground">{m.name}</span>
                  <span className="text-muted-foreground font-mono">{m.email}</span>
                </div>
              ))}
              {matchingMembers.length > 8 && (
                <p className="text-[10px] text-center text-muted-foreground pt-1">
                  ...and {matchingMembers.length - 8} more students.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetState}
                className="h-8 text-xs font-semibold"
              >
                Choose Another File
              </Button>
              <Button
                size="sm"
                disabled={isProcessing || matchingMembers.length === 0}
                onClick={handleExecuteBulkAction}
                className={`h-8 text-xs font-bold gap-1.5 ${
                  actionType === "suspend"
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" /> Processing...
                  </span>
                ) : (
                  `Confirm Bulk ${actionType === "suspend" ? "Suspension" : "Reactivation"}`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {resultSummary && (
          <div className="space-y-4 py-2 text-center">
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <CheckCircle2 className="size-8 mx-auto text-emerald-600" />
              <h3 className="text-sm font-black text-foreground">
                Bulk {actionType === "suspend" ? "Suspension" : "Reactivation"} Completed
              </h3>
              <p className="text-xs text-muted-foreground">
                Successfully updated <strong>{resultSummary.updated}</strong> student memberships in {universityName}.
                {resultSummary.failed > 0 && ` (${resultSummary.failed} failed)`}
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => {
                  resetState();
                  onClose();
                }}
                className="rounded-xl text-xs font-bold h-8.5 px-4"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
