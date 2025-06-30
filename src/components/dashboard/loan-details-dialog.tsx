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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { type Loan, type Customer } from '@/lib/types';
import { getInitials, formatCurrency } from '@/lib/utils';
import { useTranslation } from '@/contexts/language-context';
import { Progress } from '@/components/ui/progress';

interface LoanDetailsDialogProps {
  loan: Loan | null;
  customer: Customer | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanDetailsDialog({ loan, customer, open, onOpenChange }: LoanDetailsDialogProps) {
  const { t } = useTranslation();

  if (!loan) return null;

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

  const paidCount = loan.payments?.filter(p => p.status === 'Paid').length ?? 0;
  const totalCount = loan.payments?.length ?? 0;
  const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
           <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={customer?.avatar || `https://avatar.vercel.sh/${loan.name}.png`} alt={loan.name} />
              <AvatarFallback>{getInitials(loan.name)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5">
                <DialogTitle>Loan Details</DialogTitle>
                <DialogDescription>For {loan.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
            <Label className="text-muted-foreground">{t('loansPage.table.principal')}</Label>
            <p className="sm:col-span-2 text-sm font-medium">{formatCurrency(loan.amount, loan.currency)}</p>
          </div>
           <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
            <Label className="text-muted-foreground">{t('loansPage.table.interest')}</Label>
            <p className="sm:col-span-2 text-sm">{loan.interestRate}%</p>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
            <Label className="text-muted-foreground">{t('loansPage.table.term')}</Label>
            <p className="sm:col-span-2 text-sm">{loan.term} mo</p>
          </div>
           <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
            <Label className="text-muted-foreground">{t('loansPage.table.date')}</Label>
            <p className="sm:col-span-2 text-sm">{formatDate(loan.loanDate)}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
            <Label className="text-muted-foreground">{t('loansPage.table.status')}</Label>
            <div className="sm:col-span-2">
                <Badge variant={getStatusVariant(loan.status)}>{loan.status}</Badge>
            </div>
          </div>
           {totalCount > 0 && (loan.status === 'Approved' || loan.status === 'Paid') && (
             <>
                <Separator />
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
                    <Label className="text-muted-foreground">{t('paymentsPage.table.paymentProgress')}</Label>
                    <div className="sm:col-span-2">
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Progress value={progress} className="h-2" />
                            </div>
                            <span className="text-xs text-muted-foreground w-24 text-right">
                                {paidCount} / {totalCount} {t('paymentsPage.paid')}
                            </span>
                        </div>
                    </div>
                </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
