'use client';

import { useState, useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLoanAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { VerificationResultDialog } from './verification-result-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Customer } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Save
    </Button>
  );
}

interface LoanFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: React.ReactNode;
    customers: Customer[];
}

export function LoanForm({ open, onOpenChange, children, customers }: LoanFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [verificationResult, setVerificationResult] = useState<{flags: string[], summary: string} | null>(null);
  const [isVerificationDialogOpen, setVerificationDialogOpen] = useState(false);

  const [state, formAction] = useActionState(createLoanAction, null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleCustomerSelect = (customerName: string) => {
    const customer = customers.find((c) => c.name === customerName) || null;
    setSelectedCustomer(customer);
  };
  
  const resetFormState = () => {
    formRef.current?.reset();
    setSelectedCustomer(null);
  };

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
        className: 'bg-accent text-accent-foreground'
      });
      if(state.verificationResult) {
          setVerificationResult(state.verificationResult);
          setVerificationDialogOpen(true);
      }
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange]);

  useEffect(() => {
    if (!open) {
      resetFormState();
    }
  }, [open]);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Loan</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new loan for an existing customer.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Borrower Name</Label>
            <Select name="name" required onValueChange={handleCustomerSelect}>
              <SelectTrigger id="name">
                <SelectValue placeholder="Select an existing customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.length > 0 ? customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.name}>
                    {customer.name}
                  </SelectItem>
                )) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">Please add a customer first.</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" placeholder="50000" required />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                   <Select name="currency" required defaultValue="KHR">
                       <SelectTrigger id="currency">
                           <SelectValue placeholder="Select currency" />
                       </SelectTrigger>
                       <SelectContent>
                           <SelectItem value="KHR">KHR (៛)</SelectItem>
                           <SelectItem value="USD">USD ($)</SelectItem>
                       </SelectContent>
                   </Select>
               </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input id="interestRate" name="interestRate" type="number" step="0.1" placeholder="5.5" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="term">Term (Months)</Label>
                <Input id="term" name="term" type="number" placeholder="36" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanDate">Loan Date</Label>
                <Input id="loanDate" name="loanDate" type="date" required />
              </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
                id="address" 
                name="address" 
                placeholder="Address is auto-filled from customer" 
                required 
                key={selectedCustomer?.id ?? 'new-customer'}
                defaultValue={selectedCustomer?.address ?? ''}
                readOnly={!!selectedCustomer}
            />
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

    {verificationResult && (
        <VerificationResultDialog 
            isOpen={isVerificationDialogOpen}
            setIsOpen={setVerificationDialogOpen}
            result={verificationResult}
        />
    )}
    </>
  );
}
