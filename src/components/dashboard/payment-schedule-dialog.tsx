'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Loan } from '@/lib/types';
import { calculateAmortizationSchedule, calculateMonthlyPayment } from '@/lib/utils';
import { useMemo } from 'react';

interface PaymentScheduleDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
};

export function PaymentScheduleDialog({ loan, open, onOpenChange }: PaymentScheduleDialogProps) {
  const schedule = useMemo(() => {
    if (!loan || !loan.term) return [];
    return calculateAmortizationSchedule(loan.amount, loan.interestRate, loan.term);
  }, [loan]);

  const monthlyPayment = useMemo(() => {
      if (!loan || !loan.term) return 0;
      return calculateMonthlyPayment(loan.amount, loan.interestRate, loan.term);
  }, [loan]);

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Monthly Payment Schedule</DialogTitle>
          <DialogDescription>
            For a loan of {formatCurrency(loan.amount)} over {loan.term} months at {loan.interestRate}% interest.
            The calculated monthly payment is{' '}
            <span className="font-semibold text-foreground">{formatCurrency(monthlyPayment)}</span>.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[80px]">Month</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Total Payment</TableHead>
                <TableHead className="text-right">Remaining Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.length > 0 ? (
                schedule.map((entry) => (
                  <TableRow key={entry.month}>
                    <TableCell className="font-medium">{entry.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.principalPayment)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.interestPayment)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.monthlyPayment)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.remainingBalance)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No term is set for this loan. Please edit the loan to add a term.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
