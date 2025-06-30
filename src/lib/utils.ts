
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

export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) {
    return 0;
  }
   if (annualRate < 0) {
      annualRate = 0;
  }

  const termYears = termMonths / 12;
  const totalInterest = principal * (annualRate / 100) * termYears;
  const totalRepayable = principal + totalInterest;
  const monthlyPayment = totalRepayable / termMonths;
  
  return monthlyPayment;
}

export function generatePaymentSchedule(principal: number, annualRate: number, termMonths: number, loanDateStr: string): Payment[] {
  if (principal <= 0 || termMonths <= 0) {
    return [];
  }
  if (annualRate < 0) {
      annualRate = 0;
  }

  const termYears = termMonths / 12;
  const totalInterest = principal * (annualRate / 100) * termYears;
  const monthlyPayment = (principal + totalInterest) / termMonths;

  const monthlyInterest = totalInterest / termMonths;
  const monthlyPrincipal = principal / termMonths;

  const schedule: Payment[] = [];
  let remainingBalance = principal;
  const startDate = new Date(loanDateStr + 'T00:00:00'); // Avoid timezone issues

  for (let i = 1; i <= termMonths; i++) {
      remainingBalance -= monthlyPrincipal;

      // Ensure last payment clears balance exactly
      if (i === termMonths) {
          remainingBalance = 0;
      }

      const dueDate = addMonths(startDate, i);
      const status: 'Upcoming' | 'Overdue' = isPast(dueDate) ? 'Overdue' : 'Upcoming';

      schedule.push({
          month: i,
          dueDate: formatISO(dueDate, { representation: 'date' }), // YYYY-MM-DD
          status: status,
          monthlyPayment: monthlyPayment,
          principalPayment: monthlyPrincipal,
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
