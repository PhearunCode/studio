'use client';

import { useEffect, useRef, useActionState } from 'react';
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
import { updateLoanAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Loan } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Save Changes
    </Button>
  );
}

interface EditLoanFormProps {
    loan: Loan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: React.ReactNode;
}

export function EditLoanForm({ loan, open, onOpenChange, children }: EditLoanFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [state, formAction] = useActionState(updateLoanAction, null);

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
      if (!open) {
        formRef.current?.reset();
      }
  }, [open, loan]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Loan</DialogTitle>
          <DialogDescription>
            Update the details for this loan. Customer name and address cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form 
            key={loan?.id ?? 'edit'}
            ref={formRef} 
            action={formAction} 
            className="space-y-4 py-4"
        >
            <input type="hidden" name="id" value={loan?.id ?? ''} />

            <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" name="name" defaultValue={loan?.name ?? ''} readOnly disabled />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input id="amount" name="amount" type="number" placeholder="50000" required defaultValue={loan?.amount} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input id="interestRate" name="interestRate" type="number" step="0.1" placeholder="5.5" required defaultValue={loan?.interestRate} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="term">Term (Months)</Label>
                    <Input id="term" name="term" type="number" placeholder="36" required defaultValue={loan?.term} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="loanDate">Loan Date</Label>
                    <Input id="loanDate" name="loanDate" type="date" required defaultValue={loan?.loanDate} />
                </div>
            </div>

          <DialogFooter>
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
