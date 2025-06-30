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
import { useTranslation } from '@/contexts/language-context';

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEdit ? t('save') : t('save')}
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
  const { t } = useTranslation();
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
          <DialogTitle>{isEdit ? t('customerForm.editTitle') : t('customerForm.newTitle')}</DialogTitle>
          <DialogDescription>
            {isEdit ? t('customerForm.editDesc') : t('customerForm.newDesc')}
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
                <Label htmlFor="name">{t('customerForm.nameLabel')}</Label>
                <Input id="name" name="name" placeholder={t('customerForm.namePlaceholder')} required defaultValue={customer?.name ?? ''} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">{t('customerForm.phoneLabel')}</Label>
                <Input id="phone" name="phone" placeholder={t('customerForm.phonePlaceholder')} type="tel" required defaultValue={customer?.phone ?? ''} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="telegramChatId">{t('customerForm.telegramLabel')}</Label>
                <Input id="telegramChatId" name="telegramChatId" placeholder={t('customerForm.telegramPlaceholder')} defaultValue={customer?.telegramChatId ?? ''} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="idCardNumber">{t('customerForm.idCardLabel')}</Label>
                <Input id="idCardNumber" name="idCardNumber" placeholder={t('customerForm.idCardPlaceholder')} defaultValue={customer?.idCardNumber ?? ''} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">{t('customerForm.addressLabel')}</Label>
                <Input id="address" name="address" placeholder={t('customerForm.addressPlaceholder')} required defaultValue={customer?.address ?? ''} />
            </div>
            
            <div className="space-y-2">
                <Label>{t('customerForm.profilePicLabel')}</Label>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={avatar || `https://avatar.vercel.sh/${name || 'user'}.png`} alt={name} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="avatar-url">{t('customerForm.avatarUrlLabel')}</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="avatar-url"
                                placeholder={t('customerForm.avatarUrlPlaceholder')}
                                value={avatar.startsWith('data:') ? 'Uploaded File' : avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                readOnly={avatar.startsWith('data:')}
                            />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                {t('settingsPage.upload')}
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
                    <Button variant="outline">{t('cancel')}</Button>
                </DialogClose>
                <SubmitButton isEdit={isEdit} />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
