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
  telegramChatId?: string;
  facebookUrl?: string;
  avatar?: string;
  totalLoans: number;
  totalLoanAmountKhr: number;
  totalLoanAmountUsd: number;
  loans?: Loan[];
}

export interface AppUser {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  photoURL: string | undefined;
  role: string;
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
    phone: z.string().min(1, "Phone number is required.").max(20, "Phone number must be 20 characters or less."),
    idCardNumber: z.string().optional(),
    telegramChatId: z.string().optional(),
    facebookUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    avatar: z.string().optional(),
});

export const principalPaymentSchema = z.object({
  loanId: z.string(),
  amount: z.coerce.number().positive('Payment amount must be positive'),
});

export const telegramMessageSchema = z.object({
  customerId: z.string(),
  message: z.string().optional(),
  photo: z.string().optional(),
}).refine(data => data.message || data.photo, {
  message: "A message or a photo is required.",
  path: ["message"],
});


export type FormState = {
  message: string;
  verificationResult?: {
    flags: string[];
    summary: string;
  };
  error?: boolean;
} | null;
