'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
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
import { Loader2, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
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
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const idCardFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [state, formAction] = useActionState(saveCustomerAction, null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);

  const isEdit = !!customer;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        className: 'bg-accent text-accent-foreground',
      });
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange]);
  
  useEffect(() => {
      if (open) {
        formRef.current?.reset();
        setAvatarPreview(customer?.avatar ?? null);
        setIdCardPreview(customer?.idCardUrl ?? null);
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
            <input type="hidden" name="avatar" value={avatarPreview ?? ''} />
            <input type="hidden" name="idCardUrl" value={idCardPreview ?? ''} />
            
            <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={avatarPreview ?? `https://avatar.vercel.sh/${customer?.name ?? 'new'}.png`} alt={customer?.name} />
                        <AvatarFallback>{getInitials(customer?.name)}</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" onClick={() => avatarFileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    <input
                        type="file"
                        ref={avatarFileInputRef}
                        onChange={(e) => handleFileChange(e, setAvatarPreview)}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </div>

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

            <div className="space-y-2">
                <Label htmlFor="id-card">ID Card Photo</Label>
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-24 border rounded-md flex items-center justify-center bg-muted/50 overflow-hidden">
                        {idCardPreview ? (
                            <img src={idCardPreview} alt="ID Card Preview" className="h-full w-auto object-contain" />
                        ) : (
                            <span className="text-xs text-muted-foreground">ID Card Preview</span>
                        )}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => idCardFileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Upload ID
                    </Button>
                    <input
                        type="file"
                        id="id-card"
                        ref={idCardFileInputRef}
                        onChange={(e) => handleFileChange(e, setIdCardPreview)}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
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
