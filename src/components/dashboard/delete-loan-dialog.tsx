'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteLoanAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Loan } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';

function DeleteButton() {
    const { pending } = useFormStatus();
    const { t } = useTranslation();
    return (
        <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('delete')}
        </Button>
    );
}

interface DeleteLoanDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLoanDialog({ loan, open, onOpenChange }: DeleteLoanDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const deleteActionWithId = deleteLoanAction.bind(null, loan?.id ?? '');
  const [state, formAction] = useActionState(deleteActionWithId, null);

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
  }, [state, onOpenChange, toast, t]);

  if (!loan) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form action={formAction}>
            <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
                {t('deleteDialog.loanDesc', 'This action cannot be undone. This will permanently delete the loan record for {name}.').replace('{name}', loan.name)}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogCancel asChild>
                    <Button variant="outline" type="button">{t('cancel')}</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                    <DeleteButton />
                </AlertDialogAction>
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
