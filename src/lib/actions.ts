
'use server';

import { revalidatePath } from 'next/cache';
import { addLoan, addCustomer, updateCustomer, deleteCustomer, getLoans, getCustomers, updateLoanStatus, deleteLoan, updateLoan, markPaymentAsPaid, recordPrincipalPayment, isUserAdmin, getUsers } from './firebase';
import { verifyLoanApplication } from '@/ai/flows/verify-loan-application';
import { loanSchema, customerSchema, updateLoanSchema, principalPaymentSchema, telegramMessageSchema, type FormState, type Loan, type Currency, type AppUser } from '@/lib/types';
import { sendTelegramNotification } from './telegram';
import { formatCurrency } from './utils';
import { addDays, formatISO } from 'date-fns';

export async function createLoanAction(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const validatedFields = loanSchema.safeParse({
      name: rawFormData.name,
      amount: rawFormData.amount,
      currency: rawFormData.currency,
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

    const { name, amount, currency, interestRate, term, loanDate, address } = validatedFields.data;
    
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
      currency,
      interestRate,
      term,
      loanDate,
      address,
      verificationResult,
    });

    // 3. Send Telegram Notification
    const notificationMessage = `
*New Loan Application Submitted*
-----------------------------------
*Name:* ${name}
*Amount:* ${formatCurrency(amount, currency)}
*Term:* ${term} months
*Interest Rate:* ${interestRate}%
*Date:* ${loanDate}
-----------------------------------
*AI Verification Summary:*
${verificationResult.summary}
*Flags:* ${verificationResult.flags.length > 0 ? verificationResult.flags.join(', ') : 'None'}
    `;
    await sendTelegramNotification(notificationMessage.trim());

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
      currency: formData.get('currency'),
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
      idCardNumber: formData.get('idCardNumber'),
      telegramChatId: formData.get('telegramChatId'),
      facebookUrl: formData.get('facebookUrl'),
      avatar: formData.get('avatar'),
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
        if (validatedFields.data.telegramChatId) {
            try {
                const welcomeMessage = 'សូមស្វាគមន៍មកកាន់កម្ចីជាមួយ LendEasy PH';
                await sendTelegramNotification(welcomeMessage, validatedFields.data.telegramChatId);
            } catch (telegramError) {
                console.warn('Failed to send welcome message to new customer:', (telegramError as Error).message);
                // Don't block the main success response if telegram fails
            }
        }
    }

    revalidatePath('/customers');
    revalidatePath('/');

    const message = id ? 'Customer updated successfully.' : 'Customer created successfully.';
    return { message };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error('Error saving customer:', errorMessage);
    return {
      message: errorMessage,
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
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Error deleting customer:', errorMessage);
        return {
            message: errorMessage,
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
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Error deleting loan:', errorMessage);
        return {
            message: errorMessage,
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

        // Try to send notification, but don't let it block the success response
        try {
            const loans = await getLoans();
            const customers = await getCustomers();
            const loan = loans.find(l => l.id === loanId);
            if (!loan) return { message: `Payment for month ${month} marked as paid. (Loan not found for notification)` };

            const customer = customers.find(c => c.name === loan.name);
            if (!customer?.telegramChatId) return { message: `Payment for month ${month} marked as paid.` };
            
            const payment = loan.payments?.find(p => p.month === month);
            if (!payment) return { message: `Payment for month ${month} marked as paid. (Payment details not found for notification)` };

            const message = `Hi ${customer.name}, we have received your payment of ${formatCurrency(payment.monthlyPayment, loan.currency)}. Thank you!`;
            await sendTelegramNotification(message, customer.telegramChatId);

        } catch (notificationError) {
            console.error('Failed to send payment confirmation notification:', notificationError);
            // Don't rethrow, just log it. The main action succeeded.
        }

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

export async function sendTestNotificationAction(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> {
  try {
    await sendTelegramNotification('Hello from LendEasy PH! 👋 Your Telegram notifications are set up correctly.');
    return { message: 'Test notification sent successfully!' };
  } catch (error) {
    console.error('Error sending test notification:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred while sending the test notification.';
    return {
      message,
      error: true
    };
  }
}

export async function sendPaymentRemindersAction(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    try {
        const loans = await getLoans();
        const customers = await getCustomers();
        const customerMap = new Map(customers.map(c => [c.name, c]));

        const today = new Date();
        const reminderDate = addDays(today, 3);
        const reminderDateString = formatISO(reminderDate, { representation: 'date' }); // "YYYY-MM-DD"
        
        let notificationsSent = 0;
        const notificationPromises = [];

        for (const loan of loans) {
            if (loan.status !== 'Approved' || !loan.payments) continue;

            for (const payment of loan.payments) {
                if (payment.status === 'Upcoming' && payment.dueDate === reminderDateString) {
                    const customer = customerMap.get(loan.name);
                    if (customer && customer.telegramChatId) {
                        const message = `Hi ${customer.name}, this is a friendly reminder that your loan payment of ${formatCurrency(payment.monthlyPayment, loan.currency)} is due in 3 days, on ${payment.dueDate}. Thank you!`;
                        
                        notificationPromises.push(
                            sendTelegramNotification(message, customer.telegramChatId)
                                .then(() => {
                                    notificationsSent++;
                                })
                                .catch(err => {
                                    console.error(`Failed to send reminder to ${customer.name}:`, err.message);
                                })
                        );
                    }
                }
            }
        }
        
        await Promise.all(notificationPromises);

        if (notificationsSent === 0) {
            return { message: 'No payments are due in 3 days. No reminders sent.' };
        }
        
        return { message: `Successfully sent ${notificationsSent} payment reminder(s).` };
    } catch (error) {
        console.error('Error sending payment reminders:', error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred while sending reminders.';
        return { message, error: true };
    }
}


export async function recordPrincipalPaymentAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = principalPaymentSchema.safeParse({
      loanId: formData.get('loanId'),
      amount: formData.get('amount'),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).flat().join('. ');
      return { 
        message: `Validation failed: ${errorMessages}.`, 
        error: true 
      };
    }
    
    const { loanId, amount } = validatedFields.data;

    await recordPrincipalPayment(loanId, amount);

    revalidatePath('/loans');
    revalidatePath('/payments');
    revalidatePath('/');

    // Try to send notification, but don't let it block the success response
    try {
        // Fetch fresh data after revalidation might take effect
        const loans = await getLoans();
        const customers = await getCustomers();
        const loan = loans.find(l => l.id === loanId);

        if (loan) {
            const customer = customers.find(c => c.name === loan.name);
            if (customer && customer.telegramChatId) {
                const message = `Hi ${customer.name}, we have received your principal payment of ${formatCurrency(amount, loan.currency)}. Your new remaining principal is ${formatCurrency(loan.amount, loan.currency)}. Thank you!`;
                await sendTelegramNotification(message, customer.telegramChatId);
            }
        }
    } catch (notificationError) {
        console.error('Failed to send principal payment confirmation notification:', notificationError);
        // Don't rethrow, just log it. The main action succeeded.
    }

    return { message: 'Principal payment recorded successfully.' };
  } catch (error) {
    console.error('Error recording principal payment:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      message,
      error: true
    };
  }
}

export async function sendManualTelegramMessageAction(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = telegramMessageSchema.safeParse({
      customerId: formData.get('customerId'),
      message: formData.get('message'),
      photo: formData.get('photo'),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).flat().join('. ');
      return { 
        message: `Validation failed: ${errorMessages}.`, 
        error: true 
      };
    }

    const { customerId, message, photo } = validatedFields.data;

    const customers = await getCustomers();
    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
      throw new Error('Customer not found.');
    }

    if (!customer.telegramChatId) {
      throw new Error('This customer does not have a Telegram Chat ID configured.');
    }
    
    await sendTelegramNotification(message, customer.telegramChatId, photo);

    return { message: `Message sent successfully to ${customer.name}.` };
  } catch (error) {
    console.error('Error sending manual message:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      message,
      error: true
    };
  }
}

export async function sendLoanDetailsToTelegramAction(loanId: string): Promise<FormState> {
    try {
        if (!loanId) {
            throw new Error('Loan ID is required.');
        }

        const loans = await getLoans();
        const loan = loans.find(l => l.id === loanId);
        if (!loan) {
            throw new Error('Loan not found.');
        }

        const customers = await getCustomers();
        const customer = customers.find(c => c.name === loan.name);

        if (!customer) {
            throw new Error(`Customer "${loan.name}" not found.`);
        }

        if (!customer.telegramChatId) {
            throw new Error(`Customer "${loan.name}" does not have a Telegram Chat ID configured.`);
        }

        const paidCount = loan.payments?.filter(p => p.status === 'Paid').length ?? 0;
        const totalCount = loan.payments?.length ?? 0;
        
        const message = `
*Loan Details for ${loan.name}*
-----------------------------------
*Status:* ${loan.status}
*Principal:* ${formatCurrency(loan.amount, loan.currency)}
*Interest Rate:* ${loan.interestRate}%
*Term:* ${loan.term} months
*Payments Made:* ${paidCount} / ${totalCount}
-----------------------------------
This is a summary of your loan. For more details, please contact us.
        `.trim();

        await sendTelegramNotification(message, customer.telegramChatId);

        return { message: `Loan details sent successfully to ${customer.name}.` };

    } catch (error) {
        console.error('Error sending loan details:', error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return {
            message,
            error: true,
        };
    }
}

export async function checkIsAdminAction(uid: string): Promise<boolean> {
    try {
        return await isUserAdmin(uid);
    } catch (error) {
        console.error("Error in checkIsAdminAction:", error);
        return false;
    }
}

export async function getUsersAction(): Promise<AppUser[]> {
    try {
        return await getUsers();
    } catch (error) {
        console.error("Error in getUsersAction:", error);
        return [];
    }
}
