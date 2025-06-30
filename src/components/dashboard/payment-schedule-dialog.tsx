
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
import { type Loan, type Payment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { markPaymentAsPaidAction } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentScheduleDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (dateString: string) => {
    // Add T00:00:00 to treat the date as local time and avoid timezone shifts
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

function MarkAsPaidButton({ loanId, month }: { loanId: string, month: number }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleClick = () => {
    startTransition(async () => {
      const result = await markPaymentAsPaidAction(loanId, month);
      if (result?.error) {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: result.message, className: 'bg-accent text-accent-foreground' });
      }
    });
  };

  return (
    <Button size="sm" onClick={handleClick} disabled={isPending}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Mark as Paid
    </Button>
  );
}

export function PaymentScheduleDialog({ loan, open, onOpenChange }: PaymentScheduleDialogProps) {
  if (!loan) return null;

  const schedule = loan?.payments ?? [];
  const monthlyInterestPayment = loan.amount * (loan.interestRate / 100);
  
  const getStatusVariant = (status: Payment['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch(status) {
        case 'Paid':
            return 'default';
        case 'Upcoming':
            return 'outline';
        case 'Overdue':
            return 'destructive';
        default:
            return 'outline';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Monthly Payment Schedule</DialogTitle>
          <DialogDescription>
            For a loan of {formatCurrency(loan.amount, loan.currency)} over {loan.term} months at {loan.interestRate}% interest.
            The borrower pays a fixed interest of{' '}
            <span className="font-semibold text-foreground">{formatCurrency(monthlyInterestPayment, loan.currency)}</span> each month.
            The full principal amount is due with the final payment.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[80px]">Month</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Total Payment</TableHead>
                <TableHead className="text-right">Remaining Balance</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.length > 0 ? (
                schedule.map((entry) => (
                  <TableRow key={entry.month}>
                    <TableCell className="font-medium">{entry.month}</TableCell>
                    <TableCell>{formatDate(entry.dueDate)}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(entry.status)} className={cn(
                            entry.status === 'Paid' && 'bg-accent text-accent-foreground'
                        )}>
                            {entry.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.principalPayment, loan.currency)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.interestPayment, loan.currency)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.monthlyPayment, loan.currency)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.remainingBalance, loan.currency)}</TableCell>
                    <TableCell className="text-center w-[150px]">
                        {entry.status !== 'Paid' && loan.status === 'Approved' && (
                            <MarkAsPaidButton loanId={loan.id} month={entry.month} />
                        )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                        This loan has not been approved yet. A payment schedule will be generated upon approval.
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
