
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addMonths, formatISO, isPast } from 'date-fns';
import type { Payment, Currency } from './types';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'KHR') {
  const options = {
    style: 'currency',
    currency,
  };
  const locale = currency === 'KHR' ? 'km-KH' : 'en-US';
  return new Intl.NumberFormat(locale, options).format(amount);
}

// This now calculates the monthly interest payment.
export function calculateMonthlyPayment(principal: number, interestRate: number, termMonths: number): number {
  if (principal <= 0) {
    return 0;
  }
   if (interestRate < 0) {
      interestRate = 0;
  }

  // Interest is calculated monthly on the original principal.
  const monthlyInterest = principal * (interestRate / 100);
  
  return monthlyInterest;
}

export function generatePaymentSchedule(principal: number, interestRate: number, termMonths: number, loanDateStr: string): Payment[] {
  if (principal <= 0 || termMonths <= 0) {
    return [];
  }
  if (interestRate < 0) {
    interestRate = 0;
  }

  const monthlyInterest = principal * (interestRate / 100);
  
  const schedule: Payment[] = [];
  const startDate = new Date(loanDateStr + 'T00:00:00'); // Avoid timezone issues

  for (let i = 1; i <= termMonths; i++) {
      const dueDate = addMonths(startDate, i);
      const status: 'Upcoming' | 'Overdue' = isPast(dueDate) ? 'Overdue' : 'Upcoming';
      
      const isFinalPayment = i === termMonths;
      const principalPaymentThisMonth = isFinalPayment ? principal : 0;
      const monthlyPayment = principalPaymentThisMonth + monthlyInterest;
      const remainingBalance = isFinalPayment ? 0 : principal;

      schedule.push({
          month: i,
          dueDate: formatISO(dueDate, { representation: 'date' }), // YYYY-MM-DD
          status: status,
          monthlyPayment: monthlyPayment,
          principalPayment: principalPaymentThisMonth,
          interestPayment: monthlyInterest,
          remainingBalance: remainingBalance,
      });
  }

  return schedule;
}

export function getInitials(name: string | undefined) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}
