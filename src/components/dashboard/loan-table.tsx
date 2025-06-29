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
import { type Loan } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateLoanStatusAction } from '@/lib/actions';
import { DeleteLoanDialog } from './delete-loan-dialog';
import { EditLoanForm } from './edit-loan-form';
import { PaymentScheduleDialog } from './payment-schedule-dialog';

interface LoanTableProps {
  loans: Loan[];
}

export function LoanTable({ loans }: LoanTableProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const handleStatusChange = (loanId: string, status: Loan['status']) => {
    startTransition(async () => {
      const result = await updateLoanStatusAction(loanId, status);
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: Loan['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch(status) {
        case 'Approved':
            return 'default';
        case 'Paid':
            return 'secondary';
        case 'Pending':
            return 'outline';
        case 'Rejected':
            return 'destructive';
        default:
            return 'outline';
    }
  }

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Borrower</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell className="font-medium">{loan.name}</TableCell>
              <TableCell>
                {formatCurrency(loan.amount)}
              </TableCell>
              <TableCell>{loan.interestRate}%</TableCell>
              <TableCell>{loan.term} mo</TableCell>
              <TableCell>{formatDate(loan.loanDate)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(loan.status)} className={cn(
                  getStatusVariant(loan.status) === 'default' && 'bg-accent text-accent-foreground',
                )}>{loan.status}</Badge>
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleViewPayments(loan)}>
                        View Payments
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleEdit(loan)}>
                      Edit Loan
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDelete(loan)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      Delete Loan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    {loan.status !== 'Approved' && (
                      <DropdownMenuItem onSelect={() => handleStatusChange(loan.id, 'Approved')}>
                        Approve
                      </DropdownMenuItem>
                    )}
                    {loan.status !== 'Rejected' && (
                      <DropdownMenuItem onSelect={() => handleStatusChange(loan.id, 'Rejected')}>
                        Reject
                      </DropdownMenuItem>
                    )}
                    {loan.status !== 'Pending' && (
                        <DropdownMenuItem onSelect={() => handleStatusChange(loan.id, 'Pending')}>
                            Set as Pending
                        </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
