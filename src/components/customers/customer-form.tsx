'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveCustomerAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Customer } from '@/lib/types';

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEdit ? 'Save Changes' : 'Save'}
    </Button>
  );
}

interface CustomerFormProps {
    customer?: Customer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: React.ReactNode;
}

export function CustomerForm({ customer, open, onOpenChange, children }: CustomerFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [state, formAction] = useActionState(saveCustomerAction, null);

  const isEdit = !!customer;

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
      }
  }, [open, customer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Customer' : 'New Customer'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details for this customer.' : 'Fill in the details below to create a new customer.'}
          </DialogDescription>
        </DialogHeader>
        <form 
            key={customer?.id ?? 'new'}
            ref={formRef} 
            action={formAction} 
            className="space-y-4"
        >
            {isEdit && <input type="hidden" name="id" value={customer.id} />}
            
            <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" name="name" placeholder="Juan dela Cruz" required defaultValue={customer?.name ?? ''} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="09123456789" type="tel" required defaultValue={customer?.phone ?? ''} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="123 Rizal St, Manila" required defaultValue={customer?.address ?? ''} />
            </div>

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <SubmitButton isEdit={isEdit} />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
