import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
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
import { Progress } from "@/components/ui/progress";
import type { UniversityStudentMember } from "@/features/auth/types";
import {
  parseStudentXlsx,
  validateStudentRows,
  generateValidationReportCsv,
  downloadSampleStudentTemplate,
  type ImportValidationResult,
  type ParsedStudentRow,
} from "../utils/xlsxHelper";
import { addSingleStudent } from "../services/studentService";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string;
  universityName: string;
  adminUid: string;
  existingMembers: UniversityStudentMember[];
}

type ImportStep = "upload" | "preview" | "processing" | "results";

export function BulkImportModal({
  isOpen,
  onClose,
  universityId,
  universityName,
  adminUid,
  existingMembers,
}: BulkImportModalProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);

  // Processing state
  const [progressPercent, setProgressPercent] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [invitedCount, setInvitedCount] = useState(0);
  const [failedRows, setFailedRows] = useState<{ row: ParsedStudentRow; error: string }[]>([]);

  const resetState = () => {
    setStep("upload");
    setSelectedFile(null);
    setIsParsing(false);
    setValidationResult(null);
    setProgressPercent(0);
    setEnrolledCount(0);
    setInvitedCount(0);
    setFailedRows([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    try {
      const rawRows = await parseStudentXlsx(file);
      if (rawRows.length === 0) {
        toast.error("Spreadsheet is empty or has no data rows.");
        setIsParsing(false);
        return;
      }

      const result = validateStudentRows(rawRows, existingMembers);
      setValidationResult(result);
      setStep("preview");
    } catch (err: any) {
      toast.error(err?.message || "Failed to parse spreadsheet.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!validationResult) return;
    const csvContent = generateValidationReportCsv(validationResult.allRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Student_Import_Validation_${universityId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) {
      toast.error("No valid student rows to import.");
      return;
    }

    setStep("processing");
    setProgressPercent(0);
    setEnrolledCount(0);
    setInvitedCount(0);
    setFailedRows([]);

    const targets = validationResult.validRows;
    const BATCH_SIZE = 10;
    let enrolled = 0;
    let invited = 0;
    const errors: { row: ParsedStudentRow; error: string }[] = [];

    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const chunk = targets.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map(async (row) => {
          try {
            const res = await addSingleStudent(
              universityId,
              universityName,
              {
                email: row.email,
                name: row.name || undefined,
                studentId: row.studentId || undefined,
                department: row.department || undefined,
              },
              adminUid
            );
            if (res.isExistingAccount) {
              enrolled += 1;
            } else {
              invited += 1;
            }
          } catch (err: any) {
            errors.push({ row, error: err?.message || "Database write failed" });
          }
        })
      );

      const percent = Math.min(100, Math.round(((i + chunk.length) / targets.length) * 100));
      setProgressPercent(percent);
      setEnrolledCount(enrolled);
      setInvitedCount(invited);
    }

    setFailedRows(errors);
    setStep("results");
    toast.success(`Bulk import completed: ${enrolled + invited} students processed.`);
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
      <DialogContent className="max-w-2xl rounded-2xl p-6 shadow-card border border-border">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-primary" />
              Bulk Import Students via XLSX
            </DialogTitle>
            <span className="text-[11px] font-bold text-muted-foreground">
              {universityName}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload an Excel (.xlsx) roster to enroll students and dispatch welcome/invitation emails.
          </p>
        </DialogHeader>

        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border-2 border-dashed border-border/80 p-6 text-center hover:border-primary/60 transition-colors bg-muted/20">
              <input
                type="file"
                id="xlsx-upload"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isParsing}
                className="hidden"
              />
              <label
                htmlFor="xlsx-upload"
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
                    {isParsing ? "Reading and validating spreadsheet..." : "Click to upload .xlsx spreadsheet"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Supports columns: Name, Email (Required), Student ID, Department
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 text-xs">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-primary" />
                <span className="text-muted-foreground text-[11px]">
                  Need the standard format? Download the official template.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleStudentTemplate}
                className="h-7 text-xs font-semibold gap-1.5"
              >
                <Download className="size-3" />
                Download Template
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === "preview" && validationResult && (
          <div className="space-y-4 pt-1">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-xl border border-border bg-card p-2.5">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Rows</p>
                <p className="font-mono text-base font-black text-foreground">{validationResult.totalRows}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                <p className="text-[10px] font-bold uppercase text-emerald-600">Valid to Enroll</p>
                <p className="font-mono text-base font-black text-emerald-600">{validationResult.validRows.length}</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                <p className="text-[10px] font-bold uppercase text-amber-600">Already Enrolled</p>
                <p className="font-mono text-base font-black text-amber-600">{validationResult.alreadyEnrolledRows.length}</p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5">
                <p className="text-[10px] font-bold uppercase text-rose-600">Invalid Rows</p>
                <p className="font-mono text-base font-black text-rose-600">{validationResult.invalidRows.length}</p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Row</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Student ID</th>
                      <th className="py-2 px-3">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {validationResult.allRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground">#{r.rowNumber}</td>
                        <td className="py-2 px-3 font-semibold text-foreground truncate max-w-[140px]">{r.email}</td>
                        <td className="py-2 px-3 text-muted-foreground truncate max-w-[100px]">{r.name || "—"}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">{r.studentId || "—"}</td>
                        <td className="py-2 px-3">
                          {!r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                              <XCircle className="size-3" /> {r.errors[0]}
                            </span>
                          ) : r.isAlreadyMember ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                              <AlertTriangle className="size-3" /> Already Enrolled (Skipped)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 className="size-3" /> Ready to Import
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {validationResult.allRows.length > 10 && (
                <p className="p-2 text-center text-[10px] font-medium text-muted-foreground border-t border-border/60 bg-muted/10">
                  Showing first 10 of {validationResult.allRows.length} rows.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                className="h-8 text-xs font-semibold gap-1.5"
              >
                <Download className="size-3.5" />
                Download Validation Report
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("upload")}
                  className="h-8 text-xs font-semibold"
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  disabled={validationResult.validRows.length === 0}
                  onClick={handleStartImport}
                  className="h-8 text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Enroll {validationResult.validRows.length} Students
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING */}
        {step === "processing" && (
          <div className="space-y-4 py-6 text-center">
            <Loader2 className="size-8 animate-spin mx-auto text-primary" />
            <div>
              <p className="text-sm font-bold text-foreground">
                Processing Batch Import...
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enrolling students, updating university memberships, and queueing welcome emails.
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <Progress value={progressPercent} className="h-2 rounded-full" />
              <p className="text-[11px] font-mono text-muted-foreground font-bold">
                {progressPercent}% Completed ({enrolledCount + invitedCount} processed)
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {step === "results" && (
          <div className="space-y-4 pt-1">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <CheckCircle2 className="size-8 mx-auto text-emerald-600 mb-1.5" />
              <h3 className="text-sm font-black text-foreground">Import Processing Completed</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enrolled {enrolledCount} existing accounts and created {invitedCount} new invitations for {universityName}.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-border bg-card p-2.5">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Accounts Enrolled</p>
                <p className="font-mono text-base font-black text-foreground">{enrolledCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-2.5">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Invitations Queued</p>
                <p className="font-mono text-base font-black text-primary">{invitedCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-2.5">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Failed Rows</p>
                <p className="font-mono text-base font-black text-rose-600">{failedRows.length}</p>
              </div>
            </div>

            {failedRows.length > 0 && (
              <div className="rounded-xl border border-rose-300 bg-rose-50/20 p-3 text-xs text-rose-700">
                <p className="font-bold">Failed Rows ({failedRows.length}):</p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                  {failedRows.slice(0, 3).map((f, i) => (
                    <li key={i}>{f.row.email}: {f.error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border/60">
              <Button
                size="sm"
                onClick={() => {
                  resetState();
                  onClose();
                }}
                className="h-8.5 rounded-xl text-xs font-bold px-4"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
