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
import type { Customer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [state, formAction] = useActionState(saveCustomerAction, null);
  const [name, setName] = useState(customer?.name ?? '');
  const [avatar, setAvatar] = useState(customer?.avatar ?? '');

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
        setName(customer?.name ?? '');
        setAvatar(customer?.avatar ?? '');
      }
  }, [open, customer]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            toast({ title: 'Invalid File Type', description: 'Please upload a PNG or JPG image.', variant: 'destructive' });
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({ title: 'File Too Large', description: 'Please upload an image smaller than 2MB.', variant: 'destructive' });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

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
            <input type="hidden" name="avatar" value={avatar} />
            
            <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" name="name" placeholder="Juan dela Cruz" required defaultValue={customer?.name ?? ''} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="09123456789" type="tel" required defaultValue={customer?.phone ?? ''} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="idCardNumber">ID Card Number</Label>
                <Input id="idCardNumber" name="idCardNumber" placeholder="1234-5678-9012" defaultValue={customer?.idCardNumber ?? ''} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="123 Rizal St, Manila" required defaultValue={customer?.address ?? ''} />
            </div>
            
            <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={avatar || `https://avatar.vercel.sh/${name || 'user'}.png`} alt={name} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="avatar-url">URL or Upload</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="avatar-url"
                                placeholder="https://example.com/avatar.png"
                                value={avatar.startsWith('data:') ? 'Uploaded File' : avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                readOnly={avatar.startsWith('data:')}
                            />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/png, image/jpeg"
                                className="hidden"
                            />
                        </div>
                    </div>
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
