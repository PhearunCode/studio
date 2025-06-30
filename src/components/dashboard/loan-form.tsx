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
import { useTranslation } from '@/contexts/language-context';
import { ScrollArea } from '../ui/scroll-area';

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {t('save')}
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
  const { t } = useTranslation();

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
        title: t('toast.error'),
        description: state.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('toast.success'),
        description: state.message,
        className: 'bg-accent text-accent-foreground'
      });
      if(state.verificationResult) {
          setVerificationResult(state.verificationResult);
          setVerificationDialogOpen(true);
      }
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange, t]);

  useEffect(() => {
    if (!open) {
      resetFormState();
    }
  }, [open]);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('loanForm.newTitle')}</DialogTitle>
          <DialogDescription>
            {t('loanForm.newDesc')}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 pr-1">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">{t('loanForm.borrowerNameLabel')}</Label>
                <Select name="name" required onValueChange={handleCustomerSelect}>
                  <SelectTrigger id="name">
                    <SelectValue placeholder={t('loanForm.borrowerNamePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length > 0 ? customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.name}>
                        {customer.name}
                      </SelectItem>
                    )) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">{t('loanForm.noCustomers')}</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="amount">{t('loanForm.amountLabel')}</Label>
                      <Input id="amount" name="amount" type="number" placeholder={t('loanForm.amountPlaceholder')} required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="currency">{t('loanForm.currencyLabel')}</Label>
                      <Select name="currency" required defaultValue="KHR">
                          <SelectTrigger id="currency">
                              <SelectValue placeholder={t('loanForm.currencyPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="KHR">KHR (៛)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="interestRate">{t('loanForm.interestRateLabel')}</Label>
                  <Input id="interestRate" name="interestRate" type="number" step="0.1" placeholder={t('loanForm.interestRatePlaceholder')} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="term">{t('loanForm.termLabel')}</Label>
                    <Input id="term" name="term" type="number" placeholder={t('loanForm.termPlaceholder')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanDate">{t('loanForm.loanDateLabel')}</Label>
                    <Input id="loanDate" name="loanDate" type="date" required />
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('loanForm.addressLabel')}</Label>
                <Input 
                    id="address" 
                    name="address" 
                    placeholder={t('loanForm.addressPlaceholder')}
                    required 
                    key={selectedCustomer?.id ?? 'new-customer'}
                    defaultValue={selectedCustomer?.address ?? ''}
                    readOnly={!!selectedCustomer}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
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
