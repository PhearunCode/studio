
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { type Loan } from '@/lib/types';
import { calculateMonthlyPayment } from '@/lib/utils';
import { PaymentScheduleDialog } from '@/components/dashboard/payment-schedule-dialog';
import { Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PaymentsTableProps {
  loans: Loan[];
}

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
};

export function PaymentsTable({ loans }: PaymentsTableProps) {
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const handleViewPayments = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentScheduleOpen(true);
  };

  const loansWithPayments = useMemo(() => {
    return loans
      .filter(loan => loan.status === 'Approved' || loan.status === 'Paid')
      .map(loan => {
        const monthlyPayment = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.term);
        const totalPaid = monthlyPayment * loan.term;
        const totalInterest = totalPaid > loan.amount ? totalPaid - loan.amount : 0;
        return {
          ...loan,
          monthlyPayment,
          totalInterest,
        };
      });
  }, [loans]);

  return (
    <>
      <PaymentScheduleDialog
        open={isPaymentScheduleOpen}
        onOpenChange={setIsPaymentScheduleOpen}
        loan={selectedLoan}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Borrower</TableHead>
            <TableHead>Payment Progress</TableHead>
            <TableHead className="text-right">Monthly Payment</TableHead>
            <TableHead className="text-right">Total Interest</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loansWithPayments.map((loan) => {
            const paidCount = loan.payments?.filter(p => p.status === 'Paid').length ?? 0;
            const totalCount = loan.payments?.length ?? 0;
            const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

            return (
                <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.name}</TableCell>
                <TableCell>
                    {totalCount > 0 ? (
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Progress value={progress} className="h-2" />
                            </div>
                            <span className="text-xs text-muted-foreground w-20 text-right">
                                {paidCount} / {totalCount} paid
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">No schedule generated</span>
                    )}
                </TableCell>
                <TableCell className="text-right font-medium">
                    {formatCurrency(loan.monthlyPayment)}
                </TableCell>
                <TableCell className="text-right font-medium text-destructive">
                    {formatCurrency(loan.totalInterest)}
                </TableCell>
                <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleViewPayments(loan)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Payment Schedule</span>
                    </Button>
                </TableCell>
                </TableRow>
            );
        })}
        </TableBody>
      </Table>
    </>
  );
}
