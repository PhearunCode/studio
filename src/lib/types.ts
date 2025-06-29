import type { VerifyLoanApplicationOutput } from "@/ai/flows/verify-loan-application";
import { z } from "zod";

export interface Loan {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  loanDate: string; // Storing as ISO string e.g., "2024-05-21"
  address: string;
  documents: { name: string; url: string }[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  verificationResult: VerifyLoanApplicationOutput | null;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  totalLoans: number;
  totalLoanAmount: number;
}

// Helper functions for validation
const isDataUrl = (s: string) => s.startsWith('data:');
const isValidDate = (date: string) => !isNaN(Date.parse(date));

export const loanSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  amount: z.coerce.number().positive('Amount must be positive'),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  loanDate: z.string().refine(isValidDate, 'Invalid date'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  documents: z.array(z.object({
    name: z.string(),
    dataUrl: z.string().refine(isDataUrl, 'Invalid data URL')
  })).min(1, 'At least one document is required'),
});

export const customerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

export type FormState = {
  message: string;
  verificationResult?: {
    flags: string[];
    summary: string;
  };
  error?: boolean;
} | null;
