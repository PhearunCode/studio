'use server';

import { revalidatePath } from 'next/cache';
import { addLoan, addCustomer, updateCustomer, deleteCustomer, getLoans, updateLoanStatus, deleteLoan, updateLoan, markPaymentAsPaid } from './firebase';
import { verifyLoanApplication } from '@/ai/flows/verify-loan-application';
import { loanSchema, customerSchema, updateLoanSchema, type FormState, type Loan } from '@/lib/types';

export async function createLoanAction(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const validatedFields = loanSchema.safeParse({
      name: rawFormData.name,
      amount: rawFormData.amount,
      interestRate: rawFormData.interestRate,
      term: rawFormData.term,
      loanDate: rawFormData.loanDate,
      address: rawFormData.address,
    });
    
    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).flat().join('. ');
      return { 
        message: `Validation failed: ${errorMessages}.`, 
        error: true 
      };
    }

    const { name, amount, interestRate, term, loanDate, address } = validatedFields.data;
    
    // Fetch historical data inside the action
    const historicalData = await getLoans();

    // 1. Call AI verification flow
    const verificationInput = {
      name,
      amount,
      interestRate,
      term,
      loanDate,
      address,
      historicalData: JSON.stringify(historicalData.slice(0, 5).map(l => ({
        name: l.name, amount: l.amount, address: l.address
      })), null, 2),
    };

    const verificationResult = await verifyLoanApplication(verificationInput);

    // 2. Save to database
    await addLoan({
      name,
      amount,
      interestRate,
      term,
      loanDate,
      address,
      verificationResult,
    });

    revalidatePath('/loans');
    revalidatePath('/');
    revalidatePath('/customers');

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

export async function updateLoanAction(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get('id') as string | null;
    if (!id) {
        throw new Error("Loan ID is required.");
    }
    
    const validatedFields = updateLoanSchema.safeParse({
      amount: formData.get('amount'),
      interestRate: formData.get('interestRate'),
      term: formData.get('term'),
      loanDate: formData.get('loanDate'),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).flat().join('. ');
      return { 
        message: `Validation failed: ${errorMessages}.`, 
        error: true 
      };
    }

    await updateLoan(id, validatedFields.data);

    revalidatePath('/loans');
    revalidatePath('/');
    revalidatePath('/payments');

    return { message: 'Loan updated successfully.' };
  } catch (error) {
    console.error('Error updating loan:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      message,
      error: true
    };
  }
}

export async function saveCustomerAction(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get('id') as string | null;
    
    const validatedFields = customerSchema.safeParse({
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).flat().join('. ');
      return { 
        message: `Validation failed: ${errorMessages}.`, 
        error: true 
      };
    }

    if (id) {
        await updateCustomer(id, validatedFields.data);
    } else {
        await addCustomer(validatedFields.data);
    }

    revalidatePath('/customers');
    revalidatePath('/');

    const message = id ? 'Customer updated successfully.' : 'Customer created successfully.';
    return { message };
  } catch (error) {
    console.error('Error saving customer:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      message,
      error: true
    };
  }
}


export async function deleteCustomerAction(
    customerId: string,
    prevState: FormState, 
    formData: FormData
): Promise<FormState> {
    try {
        if (!customerId) throw new Error("Customer ID is required.");
        await deleteCustomer(customerId);
        revalidatePath('/customers');
        revalidatePath('/');
        return { message: 'Customer and all associated loans have been deleted.' };
    } catch (error) {
        console.error('Error deleting customer:', error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return {
            message,
            error: true
        };
    }
}

export async function updateLoanStatusAction(
    loanId: string,
    status: Loan['status']
  ): Promise<FormState> {
    try {
      if (!loanId || !status) {
        throw new Error('Loan ID and status are required.');
      }
      await updateLoanStatus(loanId, status);
      revalidatePath('/loans');
      revalidatePath('/');
      revalidatePath('/payments');
      return { message: `Loan status updated to ${status}.` };
    } catch (error) {
      console.error('Error updating loan status:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      return {
        message,
        error: true,
      };
    }
}

export async function deleteLoanAction(
    loanId: string,
    prevState: FormState, 
    formData: FormData
): Promise<FormState> {
    try {
        if (!loanId) throw new Error("Loan ID is required.");
        await deleteLoan(loanId);
        revalidatePath('/loans');
        revalidatePath('/');
        return { message: 'Loan has been deleted.' };
    } catch (error) {
        console.error('Error deleting loan:', error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return {
            message,
            error: true
        };
    }
}

export async function markPaymentAsPaidAction(
    loanId: string,
    month: number
): Promise<FormState> {
    try {
        if (!loanId || !month) {
            throw new Error('Loan ID and payment month are required.');
        }
        await markPaymentAsPaid(loanId, month);
        revalidatePath('/payments');
        revalidatePath('/loans');
        return { message: `Payment for month ${month} marked as paid.` };
    } catch (error) {
        console.error('Error marking payment as paid:', error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return {
            message,
            error: true,
        };
    }
}
