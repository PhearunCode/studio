'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { type Loan, type Customer } from '@/lib/types';
import { formatCurrency, getInitials } from '@/lib/utils';
import { useState, useTransition, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateLoanStatusAction } from '@/lib/actions';
import { DeleteLoanDialog } from './delete-loan-dialog';
import { EditLoanForm } from './edit-loan-form';
import { PaymentScheduleDialog } from './payment-schedule-dialog';
import { PrincipalPaymentDialog } from './principal-payment-dialog';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/language-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomerProfilePopover } from '../customers/customer-profile-popover';

interface LoanTableProps {
  loans: Loan[];
  customers: Customer[];
}

export function LoanTable({ loans, customers }: LoanTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [isPrincipalPaymentOpen, setIsPrincipalPaymentOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const customerMap = useMemo(() => {
    return new Map(customers.map(c => [c.name, c]));
  }, [customers]);

  const handleStatusChange = (loanId: string, status: Loan['status']) => {
    startTransition(async () => {
      const result = await updateLoanStatusAction(loanId, status);
      if (result?.error) {
        toast({
          title: t('toast.error'),
          description: result.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('toast.success'),
          description: result.message,
          className: 'bg-accent text-accent-foreground',
        });
      }
    });
  };

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewPayments = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentScheduleOpen(true);
  };

  const handlePrincipalPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPrincipalPaymentOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: Loan['status']): "success" | "warning" | "destructive" | "secondary" | "outline" => {
    switch(status) {
        case 'Approved':
            return 'success';
        case 'Pending':
            return 'warning';
        case 'Rejected':
            return 'destructive';
        case 'Paid':
            return 'secondary';
        default:
            return 'outline';
    }
  }

  const filteredLoans = useMemo(() => {
    if (!searchTerm) {
      return loans;
    }
    return loans.filter(loan =>
      loan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [loans, searchTerm]);

  return (
    <>
      <EditLoanForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        loan={selectedLoan}
      />
      <DeleteLoanDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        loan={selectedLoan}
      />
      <PaymentScheduleDialog
        open={isPaymentScheduleOpen}
        onOpenChange={setIsPaymentScheduleOpen}
        loan={selectedLoan}
      />
      <PrincipalPaymentDialog
        open={isPrincipalPaymentOpen}
        onOpenChange={setIsPrincipalPaymentOpen}
        loan={selectedLoan}
      />
      <div className="py-4">
        <Input
          placeholder={t('loansPage.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('loansPage.table.borrower')}</TableHead>
            <TableHead>{t('loansPage.table.principal')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('loansPage.table.interest')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('loansPage.table.term')}</TableHead>
            <TableHead className="hidden lg:table-cell">{t('loansPage.table.date')}</TableHead>
            <TableHead>{t('loansPage.table.status')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLoans.map((loan) => {
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
                {formatCurrency(loan.amount, loan.currency)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{loan.interestRate}%</TableCell>
              <TableCell className="hidden md:table-cell">{loan.term} mo</TableCell>
              <TableCell className="hidden lg:table-cell">{formatDate(loan.loanDate)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(loan.status)}>{loan.status}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleViewPayments(loan)}>
                        {t('loansPage.actions.viewPayments')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handlePrincipalPayment(loan)} disabled={loan.status !== 'Approved'}>
                        {t('loansPage.actions.makePrincipalPayment')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleEdit(loan)}>
                      {t('loansPage.actions.editLoan')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDelete(loan)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      {t('loansPage.actions.deleteLoan')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{t('loansPage.actions.changeStatus')}</DropdownMenuLabel>
                    {loan.status !== 'Approved' && (
                      <DropdownMenuItem onSelect={() => handleStatusChange(loan.id, 'Approved')}>
                        {t('loansPage.actions.approve')}
                      </DropdownMenuItem>
                    )}
                    {loan.status !== 'Rejected' && (
                      <DropdownMenuItem onSelect={() => handleStatusChange(loan.id, 'Rejected')}>
                        {t('loansPage.actions.reject')}
                      </DropdownMenuItem>
                    )}
                    {loan.status !== 'Pending' && (
                        <DropdownMenuItem onSelect={() => handleStatusChange(loan.id, 'Pending')}>
                            {t('loansPage.actions.setAsPending')}
                        </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </>
  );
}
