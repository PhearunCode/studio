'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import Image from 'next/image';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sendManualTelegramMessageAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Upload, X } from 'lucide-react';
import type { Customer } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Send Message
    </Button>
  );
}

interface TelegramChatDialogProps {
    customer: Customer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TelegramChatDialog({ customer, open, onOpenChange }: TelegramChatDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const [state, formAction] = useActionState(sendManualTelegramMessageAction, null);
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            toast({ title: 'Invalid File Type', description: 'Please upload a PNG or JPG image.', variant: 'destructive' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: 'File Too Large', description: 'Photo must be smaller than 5MB.', variant: 'destructive' });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
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
        className: 'bg-accent text-accent-foreground',
      });
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange, t]);
  
  useEffect(() => {
      if (open) {
        formRef.current?.reset();
        setMessage('');
        setPhoto('');
      }
  }, [open]);

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message to {customer.name}</DialogTitle>
          <DialogDescription>
            The message will be sent to the customer via the LendEasy Telegram bot. You can send text, a photo, or both.
          </DialogDescription>
        </DialogHeader>
        <form 
            key={customer.id}
            ref={formRef} 
            action={formAction} 
            className="space-y-4"
        >
            <input type="hidden" name="customerId" value={customer.id} />
            <input type="hidden" name="photo" value={photo} />
            
            <div className="space-y-2">
                <Label htmlFor="message">Message / Caption</Label>
                <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="photo-upload">Attach Photo</Label>
                <div className="flex items-start gap-4">
                    {photo && (
                        <div className="relative">
                            <Image src={photo} alt="Preview" width={80} height={80} className="rounded-md object-cover aspect-square" />
                            <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setPhoto('')}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove photo</span>
                            </Button>
                        </div>
                    )}
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/png, image/jpeg"
                        className="hidden"
                        id="photo-upload"
                    />
                </div>
            </div>

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button variant="outline">{t('cancel')}</Button>
                </DialogClose>
                <SubmitButton disabled={!message && !photo} />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
