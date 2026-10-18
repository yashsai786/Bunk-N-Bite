import * as XLSX from "xlsx";
import type { UniversityStudentMember } from "@/features/auth/types";

export interface ParsedStudentRow {
  rowNumber: number;
  name: string;
  email: string;
  studentId: string;
  department: string;
  isValid: boolean;
  errors: string[];
  statusNote?: string;
  isDuplicateInFile?: boolean;
  isAlreadyMember?: boolean;
}

export interface ImportValidationResult {
  totalRows: number;
  validRows: ParsedStudentRow[];
  invalidRows: ParsedStudentRow[];
  duplicateInFileRows: ParsedStudentRow[];
  alreadyEnrolledRows: ParsedStudentRow[];
  newInvitationRows: ParsedStudentRow[];
  allRows: ParsedStudentRow[];
}

/**
 * Normalizes header keys to standard names
 */
function normalizeHeaderKey(key: string): string {
  const clean = key.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  if (["email", "emailaddress", "mail", "studentemail"].includes(clean)) return "email";
  if (["name", "studentname", "fullname"].includes(clean)) return "name";
  if (["studentid", "id", "rollno", "enrollmentno", "idnumber", "studentno"].includes(clean)) return "studentId";
  if (["department", "dept", "branch", "course", "program"].includes(clean)) return "department";
  return clean;
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Parses an uploaded XLSX file into raw rows
 */
export async function parseStudentXlsx(file: File): Promise<any[]> {
  // 1. Validate file extension and size (max 5MB)
  if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls")) {
    throw new Error("Invalid file format. Please upload an .xlsx or .xls spreadsheet.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File exceeds 5MB size limit.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("Spreadsheet contains no readable sheets.");
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Spreadsheet contains no readable sheets.");
  }
  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    throw new Error("Failed to read first worksheet.");
  }

  const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
  return rawJson;
}

/**
 * Validates and normalizes parsed rows against existing university members
 */
export function validateStudentRows(
  rawRows: Record<string, any>[],
  existingMembers: UniversityStudentMember[]
): ImportValidationResult {
  const seenEmails = new Set<string>();
  const existingEmailSet = new Set<string>(
    existingMembers.map((m) => m.email?.toLowerCase().trim()).filter(Boolean)
  );

  const allRows: ParsedStudentRow[] = [];
  const validRows: ParsedStudentRow[] = [];
  const invalidRows: ParsedStudentRow[] = [];
  const duplicateInFileRows: ParsedStudentRow[] = [];
  const alreadyEnrolledRows: ParsedStudentRow[] = [];
  const newInvitationRows: ParsedStudentRow[] = [];

  rawRows.forEach((raw, idx) => {
    const rowNumber = idx + 2; // 1-based, considering row 1 is header

    // Normalize keys
    const normalizedRow: Record<string, string> = {};
    Object.keys(raw).forEach((k) => {
      const normKey = normalizeHeaderKey(k);
      normalizedRow[normKey] = String(raw[k] || "").trim();
    });

    const email = (normalizedRow["email"] || "").toLowerCase().trim();
    const name = normalizedRow["name"] || "";
    const studentId = normalizedRow["studentId"] || "";
    const department = normalizedRow["department"] || "General";

    // Ignore completely empty rows
    if (!email && !name && !studentId) {
      return;
    }

    const errors: string[] = [];
    if (!email) {
      errors.push("Missing required Email address.");
    } else if (!isValidEmail(email)) {
      errors.push(`Invalid email syntax: "${email}".`);
    }

    let isDuplicateInFile = false;
    let isAlreadyMember = false;

    if (email) {
      if (seenEmails.has(email)) {
        isDuplicateInFile = true;
        errors.push(`Duplicate email in spreadsheet: "${email}".`);
      } else {
        seenEmails.add(email);
      }

      if (existingEmailSet.has(email)) {
        isAlreadyMember = true;
      }
    }

    const isValid = errors.length === 0;

    const parsed: ParsedStudentRow = {
      rowNumber,
      name,
      email,
      studentId,
      department,
      isValid,
      errors,
      isDuplicateInFile,
      isAlreadyMember,
    };

    allRows.push(parsed);

    if (!isValid) {
      invalidRows.push(parsed);
      if (isDuplicateInFile) {
        duplicateInFileRows.push(parsed);
      }
    } else if (isAlreadyMember) {
      alreadyEnrolledRows.push(parsed);
    } else {
      validRows.push(parsed);
      newInvitationRows.push(parsed);
    }
  });

  return {
    totalRows: allRows.length,
    validRows,
    invalidRows,
    duplicateInFileRows,
    alreadyEnrolledRows,
    newInvitationRows,
    allRows,
  };
}

/**
 * Generates a downloadable CSV text report of validation errors or import results
 */
export function generateValidationReportCsv(rows: ParsedStudentRow[]): string {
  const headers = ["Row", "Email", "Name", "Student ID", "Department", "Status", "Errors"];
  const lines = [headers.join(",")];

  rows.forEach((r) => {
    const status = r.isValid
      ? r.isAlreadyMember
        ? "Already Enrolled"
        : "Valid New"
      : "Invalid";
    const escapedErrors = `"${r.errors.join("; ").replace(/"/g, '""')}"`;
    lines.push(
      [
        r.rowNumber,
        `"${r.email}"`,
        `"${r.name}"`,
        `"${r.studentId}"`,
        `"${r.department}"`,
        status,
        escapedErrors,
      ].join(",")
    );
  });

  return lines.join("\n");
}

/**
 * Generates and downloads a sample XLSX template for University Admins
 */
export function downloadSampleStudentTemplate(): void {
  const sampleData = [
    {
      "Name": "Aarav Sharma",
      "Email": "aarav.sharma@campus.edu.in",
      "Student ID": "AU-2026-001",
      "Department": "Computer Science",
    },
    {
      "Name": "Diya Patel",
      "Email": "diya.patel@campus.edu.in",
      "Student ID": "AU-2026-002",
      "Department": "Business Management",
    },
    {
      "Name": "Rohan Mehta",
      "Email": "rohan.mehta@campus.edu.in",
      "Student ID": "AU-2026-003",
      "Department": "Design & Architecture",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  XLSX.writeFile(workbook, "Bunk_N_Bite_Students_Template.xlsx");
}

/**
 * Generates and downloads a sample XLSX template for Bulk Actions (Suspend/Reactivate)
 */
export function downloadSampleBulkActionsTemplate(): void {
  const sampleData = [
    {
      "Email": "student1@campus.edu.in",
      "Student ID": "AU-2026-001",
    },
    {
      "Email": "student2@campus.edu.in",
      "Student ID": "AU-2026-002",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk_Actions");

  XLSX.writeFile(workbook, "Bunk_N_Bite_Bulk_Actions_Template.xlsx");
}
