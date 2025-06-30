
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

export function calculateMonthlyPayment(principal: number, interestRate: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) {
    return 0;
  }
   if (interestRate < 0) {
      interestRate = 0;
  }

  // Interest is calculated monthly on the original principal (simple interest per month).
  const monthlyInterest = principal * (interestRate / 100);
  const monthlyPrincipal = principal / termMonths;
  
  const monthlyPayment = monthlyPrincipal + monthlyInterest;
  
  return monthlyPayment;
}

export function generatePaymentSchedule(principal: number, interestRate: number, termMonths: number, loanDateStr: string): Payment[] {
  if (principal <= 0 || termMonths <= 0) {
    return [];
  }
  if (interestRate < 0) {
    interestRate = 0;
  }

  // Interest is calculated monthly on the original principal.
  const monthlyInterest = principal * (interestRate / 100);
  const monthlyPrincipal = principal / termMonths;
  
  const schedule: Payment[] = [];
  let remainingBalance = principal;
  const startDate = new Date(loanDateStr + 'T00:00:00'); // Avoid timezone issues

  for (let i = 1; i <= termMonths; i++) {
      // For the last month, adjust to ensure the balance is exactly zero.
      const principalPaymentThisMonth = (i === termMonths) ? remainingBalance : monthlyPrincipal;
      remainingBalance -= principalPaymentThisMonth;

      const dueDate = addMonths(startDate, i);
      const status: 'Upcoming' | 'Overdue' = isPast(dueDate) ? 'Overdue' : 'Upcoming';

      schedule.push({
          month: i,
          dueDate: formatISO(dueDate, { representation: 'date' }), // YYYY-MM-DD
          status: status,
          monthlyPayment: principalPaymentThisMonth + monthlyInterest,
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
