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
import { type Loan, type Customer } from '@/lib/types';
import { calculateMonthlyPayment, formatCurrency, getInitials } from '@/lib/utils';
import { PaymentScheduleDialog } from '@/components/dashboard/payment-schedule-dialog';
import { Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/language-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomerProfilePopover } from '../customers/customer-profile-popover';

interface PaymentsTableProps {
  loans: Loan[];
  customers: Customer[];
}

export function PaymentsTable({ loans, customers }: PaymentsTableProps) {
  const { t } = useTranslation();
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const customerMap = useMemo(() => {
    return new Map(customers.map(c => [c.name, c]));
  }, [customers]);

  const handleViewPayments = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentScheduleOpen(true);
  };

  const loansWithPayments = useMemo(() => {
    return loans
      .filter(loan => loan.status === 'Approved' || loan.status === 'Paid')
      .map(loan => {
        const monthlyInterestPayment = calculateMonthlyPayment(loan.amount, loan.interestRate);
        const totalInterest = monthlyInterestPayment * loan.term;
        return {
          ...loan,
          monthlyInterestPayment,
          totalInterest,
        };
      });
  }, [loans]);

  const filteredLoans = useMemo(() => {
    if (!searchTerm) {
      return loansWithPayments;
    }
    return loansWithPayments.filter(loan =>
      loan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [loansWithPayments, searchTerm]);

  return (
    <>
      <PaymentScheduleDialog
        open={isPaymentScheduleOpen}
        onOpenChange={setIsPaymentScheduleOpen}
        loan={selectedLoan}
      />
      <div className="py-4">
        <Input
          placeholder={t('borrowersPage.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('paymentsPage.table.borrower')}</TableHead>
            <TableHead>{t('paymentsPage.table.paymentProgress')}</TableHead>
            <TableHead className="text-right hidden md:table-cell">{t('paymentsPage.table.monthlyInterest')}</TableHead>
            <TableHead className="text-right hidden lg:table-cell">{t('paymentsPage.table.totalInterest')}</TableHead>
            <TableHead className="text-center">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLoans.map((loan) => {
            const paidCount = loan.payments?.filter(p => p.status === 'Paid').length ?? 0;
            const totalCount = loan.payments?.length ?? 0;
            const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
            const customer = customerMap.get(loan.name);

            return (
                <TableRow key={loan.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CustomerProfilePopover customer={customer}>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={customer?.avatar || `https://avatar.vercel.sh/${loan.name}.png`} alt={loan.name} />
                        <AvatarFallback>{getInitials(loan.name)}</AvatarFallback>
                      </Avatar>
                    </CustomerProfilePopover>
                    <span className="font-medium">{loan.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                    {totalCount > 0 ? (
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Progress value={progress} className="h-2" />
                            </div>
                            <span className="text-xs text-muted-foreground w-24 text-right">
                                {paidCount} / {totalCount} {t('paymentsPage.paid')}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">{t('paymentsPage.noSchedule')}</span>
                    )}
                </TableCell>
                <TableCell className="text-right font-medium hidden md:table-cell">
                    {formatCurrency(loan.monthlyInterestPayment, loan.currency)}
                </TableCell>
                <TableCell className="text-right font-medium text-destructive hidden lg:table-cell">
                    {formatCurrency(loan.totalInterest, loan.currency)}
                </TableCell>
                <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleViewPayments(loan)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">{t('paymentsPage.viewSchedule')}</span>
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
