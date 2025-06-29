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

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete
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
  
  const deleteActionWithId = deleteLoanAction.bind(null, loan?.id ?? '');
  const [state, formAction] = useActionState(deleteActionWithId, null);

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
  }, [state, onOpenChange, toast]);

  if (!loan) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form action={formAction}>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the loan record for{' '}
                <span className="font-semibold text-foreground">{loan.name}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogCancel asChild>
                    <Button variant="outline" type="button">Cancel</Button>
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
