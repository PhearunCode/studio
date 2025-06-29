import type { VerifyLoanApplicationOutput } from "@/ai/flows/verify-loan-application";
import { z } from "zod";

export interface Payment {
  month: number;
  dueDate: string;
  status: 'Paid' | 'Upcoming' | 'Overdue';
  monthlyPayment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

export type Currency = 'KHR' | 'USD';

export interface Loan {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  interestRate: number;
  term: number; // Loan term in months
  loanDate: string; // Storing as ISO string e.g., "2024-05-21"
  address: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  verificationResult: VerifyLoanApplicationOutput | null;
  payments?: Payment[];
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  idCardNumber?: string;
  avatar?: string;
  totalLoans: number;
  totalLoanAmountKhr: number;
  totalLoanAmountUsd: number;
}

// Helper functions for validation
const isValidDate = (date: string) => !isNaN(Date.parse(date));

export const loanSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.enum(['KHR', 'USD']),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  term: z.coerce.number().positive('Term must be in months').int(),
  loanDate: z.string().refine(isValidDate, 'Invalid date'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

export const updateLoanSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.enum(['KHR', 'USD']),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  term: z.coerce.number().positive('Term must be in months').int(),
  loanDate: z.string().refine(isValidDate, 'Invalid date'),
});

export const customerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    idCardNumber: z.string().optional(),
});

export type FormState = {
  message: string;
  verificationResult?: {
    flags: string[];
    summary: string;
  };
  error?: boolean;
} | null;
