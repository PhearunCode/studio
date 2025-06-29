import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addMonths, formatISO, isPast } from 'date-fns';
import type { Payment } from './types';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
    return 0;
  }
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal / termMonths;
  }
  const monthlyPayment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return monthlyPayment;
}

export function generatePaymentSchedule(principal: number, annualRate: number, termMonths: number, loanDateStr: string): Payment[] {
  if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
    return [];
  }
  
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const monthlyRate = annualRate / 100 / 12;
  
  const schedule: Payment[] = [];
  let remainingBalance = principal;
  const startDate = new Date(loanDateStr + 'T00:00:00'); // Avoid timezone issues

  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    // Ensure last payment clears balance exactly
    if (i === termMonths && remainingBalance > -1 && remainingBalance < 1) {
        remainingBalance = 0;
    }

    const dueDate = addMonths(startDate, i);
    const status: 'Upcoming' | 'Overdue' = isPast(dueDate) ? 'Overdue' : 'Upcoming';

    schedule.push({
      month: i,
      dueDate: formatISO(dueDate, { representation: 'date' }), // YYYY-MM-DD
      status: status,
      monthlyPayment: monthlyPayment,
      principalPayment: principalPayment,
      interestPayment: interestPayment,
      remainingBalance: remainingBalance,
    });
  }

  return schedule;
}
