'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { recordPrincipalPaymentAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Loan } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Record Payment
    </Button>
  );
}

interface PrincipalPaymentDialogProps {
    loan: Loan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PrincipalPaymentDialog({ loan, open, onOpenChange }: PrincipalPaymentDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [amount, setAmount] = useState('');

  const [state, formAction] = useActionState(recordPrincipalPaymentAction, null);

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: state.message,
        className: 'bg-accent text-accent-foreground',
      });
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange]);
  
  useEffect(() => {
      if (open) {
        formRef.current?.reset();
        setAmount('');
      }
  }, [open]);

  if (!loan) return null;

  const remainingPrincipal = loan.amount;
  const percentages = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const handlePercentagePay = (percentage: number) => {
    const paymentValue = (remainingPrincipal * percentage) / 100;
    // Round to 2 decimal places to avoid floating point issues
    setAmount(String(Math.round(paymentValue * 100) / 100));
  };
  
  const paymentAmount = Number(amount) || 0;
  const newPrincipal = remainingPrincipal - paymentAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Principal Payment</DialogTitle>
          <DialogDescription>
            Record a payment towards the principal amount for {loan.name}.
            The current remaining principal is {formatCurrency(remainingPrincipal, loan.currency)}.
          </DialogDescription>
        </DialogHeader>
        <form 
            key={loan.id}
            ref={formRef} 
            action={formAction} 
            className="space-y-4"
        >
            <input type="hidden" name="loanId" value={loan.id} />
            
            <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    placeholder="Enter amount" 
                    required 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {percentages.map((p) => (
                    <Button 
                        key={p}
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handlePercentagePay(p)}
                    >
                        {p}%
                    </Button>
                ))}
            </div>
            
            {paymentAmount > 0 && paymentAmount <= remainingPrincipal && (
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Payment Summary</AlertTitle>
                    <AlertDescription>
                        A payment of {formatCurrency(paymentAmount, loan.currency)} will be recorded. The new remaining principal will be <span className="font-semibold">{formatCurrency(newPrincipal, loan.currency)}</span>. Future interest payments will be recalculated.
                    </AlertDescription>
                </Alert>
            )}
             {paymentAmount > remainingPrincipal && (
                 <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Overpayment</AlertTitle>
                    <AlertDescription>
                        The payment amount cannot exceed the remaining principal.
                    </AlertDescription>
                </Alert>
            )}

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
