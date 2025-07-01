
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
import { Loader2, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { useTranslation } from '@/contexts/language-context';

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
  const { t } = useTranslation();

  const handleClick = () => {
    startTransition(async () => {
      const result = await markPaymentAsPaidAction(loanId, month);
      if (result?.error) {
        toast({ title: t('toast.error'), description: result.message, variant: 'destructive' });
      } else {
        toast({ title: t('toast.success'), description: result.message, className: 'bg-accent text-accent-foreground' });
      }
    });
  };

  return (
    <Button size="sm" onClick={handleClick} disabled={isPending} className="w-full sm:w-auto">
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {t('paymentScheduleDialog.markAsPaid')}
    </Button>
  );
}

export function PaymentScheduleDialog({ loan, open, onOpenChange }: PaymentScheduleDialogProps) {
  const { t } = useTranslation();
  if (!loan) return null;

  const handleExport = () => {
    if (!loan || !loan.payments || loan.payments.length === 0) return;

    // We use raw numbers for export to allow calculations in Excel.
    const dataToExport = loan.payments.map(p => ({
      'Month': p.month,
      'Due Date': p.dueDate,
      'Status': p.status,
      'Principal Payment': p.principalPayment,
      'Interest Payment': p.interestPayment,
      'Total Payment': p.monthlyPayment,
      'Remaining Balance': p.remainingBalance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Schedule');
    
    // Auto-adjust column widths
    const columnWidths = Object.keys(dataToExport[0]).map(key => ({
        wch: Math.max(
            key.length, 
            ...dataToExport.map(row => String(row[key as keyof typeof row]).length)
        ) + 2, // +2 for a little padding
    }));
    worksheet['!cols'] = columnWidths;
    
    XLSX.writeFile(workbook, `Payment_Schedule_${loan.name.replace(/ /g, '_')}.xlsx`);
  };

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
          <DialogTitle>{t('paymentScheduleDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('paymentScheduleDialog.desc')
                .replace('{amount}', formatCurrency(loan.amount, loan.currency))
                .replace('{term}', loan.term.toString())
                .replace('{interestRate}', loan.interestRate.toString())
                .replace('{monthlyInterest}', formatCurrency(monthlyInterestPayment, loan.currency))
            }
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[80px]">{t('paymentScheduleDialog.table.month')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('paymentScheduleDialog.table.dueDate')}</TableHead>
                <TableHead>{t('paymentScheduleDialog.table.status')}</TableHead>
                <TableHead className="text-right hidden md:table-cell">{t('paymentScheduleDialog.table.interest')}</TableHead>
                <TableHead className="text-right">{t('paymentScheduleDialog.table.totalPayment')}</TableHead>
                <TableHead className="text-right hidden lg:table-cell">{t('paymentScheduleDialog.table.remainingBalance')}</TableHead>
                <TableHead className="text-center">{t('paymentScheduleDialog.table.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {schedule.length > 0 ? (
                schedule.map((entry) => (
                <TableRow key={entry.month}>
                    <TableCell className="font-medium">{entry.month}</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDate(entry.dueDate)}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(entry.status)} className={cn(
                            entry.status === 'Paid' && 'bg-accent text-accent-foreground'
                        )}>
                            {entry.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">{formatCurrency(entry.interestPayment, loan.currency)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.monthlyPayment, loan.currency)}</TableCell>
                    <TableCell className="text-right hidden lg:table-cell">{formatCurrency(entry.remainingBalance, loan.currency)}</TableCell>
                    <TableCell className="text-center w-[150px]">
                        {entry.status !== 'Paid' && loan.status === 'Approved' && (
                            <MarkAsPaidButton loanId={loan.id} month={entry.month} />
                        )}
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        {t('paymentScheduleDialog.noSchedule')}
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </ScrollArea>
        <DialogFooter>
          <Button variant="secondary" onClick={handleExport} disabled={schedule.length === 0}>
              <FileDown className="mr-2 h-4 w-4" />
              {t('paymentScheduleDialog.exportToExcel')}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
