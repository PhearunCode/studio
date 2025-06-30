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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Loan } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';
import { ScrollArea } from '../ui/scroll-area';

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {t('settingsPage.saveChanges')}
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
  const { t } = useTranslation();

  const [state, formAction] = useActionState(updateLoanAction, null);

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
        className: 'bg-accent text-accent-foreground',
      });
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange, t]);
  
  useEffect(() => {
      if (!open) {
        formRef.current?.reset();
      }
  }, [open, loan]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('loanForm.editTitle')}</DialogTitle>
          <DialogDescription>
            {t('loanForm.editDesc')}
          </DialogDescription>
        </DialogHeader>
        <form 
            key={loan?.id ?? 'edit'}
            ref={formRef} 
            action={formAction} 
            className="space-y-4"
        >
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 pr-1">
                <input type="hidden" name="id" value={loan?.id ?? ''} />

                <div className="space-y-2">
                    <Label htmlFor="name">{t('loanForm.borrowerNameLabel')}</Label>
                    <Input id="name" name="name" defaultValue={loan?.name ?? ''} readOnly disabled />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">{t('loanForm.amountLabel')}</Label>
                        <Input id="amount" name="amount" type="number" placeholder={t('loanForm.amountPlaceholder')} required defaultValue={loan?.amount} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">{t('loanForm.currencyLabel')}</Label>
                        <Select name="currency" required defaultValue={loan?.currency ?? 'KHR'}>
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
                    <Input id="interestRate" name="interestRate" type="number" step="0.1" placeholder={t('loanForm.interestRatePlaceholder')} required defaultValue={loan?.interestRate} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="term">{t('loanForm.termLabel')}</Label>
                        <Input id="term" name="term" type="number" placeholder={t('loanForm.termPlaceholder')} required defaultValue={loan?.term} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="loanDate">{t('loanForm.loanDateLabel')}</Label>
                        <Input id="loanDate" name="loanDate" type="date" required defaultValue={loan?.loanDate} />
                    </div>
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
  );
}
