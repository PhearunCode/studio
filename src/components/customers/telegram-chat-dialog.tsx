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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sendManualTelegramMessageAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import type { Customer } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
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
  const { toast } = useToast();
  const { t } = useTranslation();

  const [state, formAction] = useActionState(sendManualTelegramMessageAction, null);

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
      }
  }, [open]);

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message to {customer.name}</DialogTitle>
          <DialogDescription>
            The message will be sent to the customer via the LendEasy Telegram bot.
          </DialogDescription>
        </DialogHeader>
        <form 
            key={customer.id}
            ref={formRef} 
            action={formAction} 
            className="space-y-4"
        >
            <input type="hidden" name="customerId" value={customer.id} />
            
            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Type your message here..."
                    required
                    rows={5}
                />
            </div>

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
