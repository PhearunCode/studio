'use server';

import { revalidatePath } from 'next/cache';
import { addLoan } from './firebase';
import { verifyLoanApplication } from '@/ai/flows/verify-loan-application';
import type { Loan } from './types';
import { loanSchema, type FormState } from '@/lib/types';

export async function createLoanAction(
  historicalData: Loan[], 
  prevState: FormState, 
  formData: FormData
): Promise<FormState> {
  try {
    const rawFormData = Object.fromEntries(formData.entries());
    const documents = JSON.parse(rawFormData.documents as string);

    const validatedFields = loanSchema.safeParse({
      name: rawFormData.name,
      amount: rawFormData.amount,
      interestRate: rawFormData.interestRate,
      loanDate: rawFormData.loanDate,
      address: rawFormData.address,
      documents: documents,
    });
    
    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).flat().join('. ');
      return { 
        message: `Validation failed: ${errorMessages}.`, 
        error: true 
      };
    }

    const { name, amount, interestRate, loanDate, address } = validatedFields.data;
    
    // 1. Call AI verification flow
    const verificationInput = {
      name,
      amount,
      interestRate,
      loanDate,
      address,
      supportingDocuments: validatedFields.data.documents.map(d => d.dataUrl),
      historicalData: JSON.stringify(historicalData.slice(0, 5).map(l => ({
        name: l.name, amount: l.amount, address: l.address
      })), null, 2),
    };

    const verificationResult = await verifyLoanApplication(verificationInput);

    // 2. Save to database (mock)
    await addLoan({
      name,
      amount,
      interestRate,
      loanDate,
      address,
      documents: validatedFields.data.documents.map(d => ({ name: d.name, data: d.dataUrl })),
      verificationResult,
    });

    revalidatePath('/');

    return { 
      message: 'Loan application submitted successfully.',
      verificationResult: verificationResult,
    };
  } catch (error) {
    console.error('Error creating loan:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    return {
      message,
      error: true
    };
  }
}
