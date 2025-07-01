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
import { MoreHorizontal, MessageSquare } from 'lucide-react';
import { type Loan, type Customer } from '@/lib/types';
import { formatCurrency, getInitials } from '@/lib/utils';
import { useState, useTransition, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateLoanStatusAction, sendLoanDetailsToTelegramAction } from '@/lib/actions';
import { DeleteLoanDialog } from './delete-loan-dialog';
import { EditLoanForm } from './edit-loan-form';
import { PaymentScheduleDialog } from './payment-schedule-dialog';
import { PrincipalPaymentDialog } from './principal-payment-dialog';
import { LoanDetailsDialog } from './loan-details-dialog';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/language-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomerProfilePopover } from '../customers/customer-profile-popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

interface LoanTableProps {
  loans: Loan[];
  customers: Customer[];
}

export function LoanTable({ loans, customers }: LoanTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSendingTelegram, startTelegramTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [isPrincipalPaymentOpen, setIsPrincipalPaymentOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

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

  const handleSendTelegramDetails = (loan: Loan) => {
    startTelegramTransition(async () => {
        const result = await sendLoanDetailsToTelegramAction(loan.id);
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

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    // Add T00:00:00 to treat the date as local time and avoid timezone shifts
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
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

  const dialogs = (
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
      <LoanDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        loan={selectedLoan}
        customer={selectedLoan ? customerMap.get(selectedLoan.name) : undefined}
      />
    </>
  );

  const searchBar = (
    <div className="py-4">
      <Input
        placeholder={t('loansPage.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={isMobile ? "w-full" : "max-w-sm"}
      />
    </div>
  );
  
  if (isMobile) {
    return (
        <>
            {dialogs}
            {searchBar}
            <div className="space-y-4">
                {filteredLoans.map((loan) => {
                    const customer = customerMap.get(loan.name);
                    return (
                        <Card key={loan.id} className="cursor-pointer" onClick={() => handleViewDetails(loan)}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <CustomerProfilePopover customer={customer}>
                                            <Avatar>
                                                <AvatarImage src={customer?.avatar || `https://avatar.vercel.sh/${loan.name}.png`} alt={loan.name} />
                                                <AvatarFallback>{getInitials(loan.name)}</AvatarFallback>
                                            </Avatar>
                                        </CustomerProfilePopover>
                                        <div>
                                            <CardTitle className="text-base">{loan.name}</CardTitle>
                                            <CardDescription>{formatDate(loan.loanDate)}</CardDescription>
                                        </div>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending || isSendingTelegram}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => handleViewDetails(loan)}>
                                                    {t('viewDetails')}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onSelect={() => handleViewPayments(loan)}>
                                                    {t('loansPage.actions.viewPayments')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onSelect={() => handleSendTelegramDetails(loan)} 
                                                    disabled={!customer?.telegramChatId}
                                                >
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    {t('loansPage.actions.sendTelegramDetails')}
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
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-lg">{formatCurrency(loan.amount, loan.currency)}</span>
                                    <Badge variant={getStatusVariant(loan.status)} className="text-xs">{loan.status}</Badge>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Interest</span>
                                    <span>{loan.interestRate}%</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Term</span>
                                    <span>{loan.term} months</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </>
    );
  }

  return (
    <>
      {dialogs}
      {searchBar}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('loansPage.table.borrower')}</TableHead>
            <TableHead>{t('loansPage.table.principal')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('loansPage.table.interest')}</TableHead>
            <TableHead className="hidden lg:table-cell">{t('loansPage.table.term')}</TableHead>
            <TableHead className="hidden xl:table-cell">{t('loansPage.table.date')}</TableHead>
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
            <TableRow key={loan.id} className="cursor-pointer" onClick={() => handleViewDetails(loan)}>
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
              <TableCell className="hidden md:table-cell">{loan.interestRate}%</TableCell>
              <TableCell className="hidden lg:table-cell">{loan.term} mo</TableCell>
              <TableCell className="hidden xl:table-cell">{formatDate(loan.loanDate)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(loan.status)}>{loan.status}</Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending || isSendingTelegram}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleViewDetails(loan)}>
                      {t('viewDetails')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleViewPayments(loan)}>
                        {t('loansPage.actions.viewPayments')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onSelect={() => handleSendTelegramDetails(loan)} 
                        disabled={!customer?.telegramChatId}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {t('loansPage.actions.sendTelegramDetails')}
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
