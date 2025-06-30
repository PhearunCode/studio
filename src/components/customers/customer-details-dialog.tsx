'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { type Customer } from '@/lib/types';
import { getInitials, formatCurrency } from '@/lib/utils';
import { useTranslation } from '@/contexts/language-context';
import NextLink from 'next/link';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { TelegramIcon } from '@/components/icons/telegram-icon';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({ customer, open, onOpenChange }: CustomerDetailsDialogProps) {
  const { t } = useTranslation();

  if (!customer) return null;
  
  const hasSocialLinks = customer.telegramChatId || customer.facebookUrl;

  const formatTotalLoaned = (customer: Customer) => {
    const khrAmount = customer.totalLoanAmountKhr > 0 ? formatCurrency(customer.totalLoanAmountKhr, 'KHR') : null;
    const usdAmount = customer.totalLoanAmountUsd > 0 ? formatCurrency(customer.totalLoanAmountUsd, 'USD') : null;

    if (khrAmount && usdAmount) {
        return `${khrAmount} / ${usdAmount}`;
    }
    return khrAmount || usdAmount || '-';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={customer.avatar || `https://avatar.vercel.sh/${customer.name}.png`} alt={customer.name} />
              <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5">
                <DialogTitle>{customer.name}</DialogTitle>
                <DialogDescription>{t('borrowersPage.borrowerListDesc')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">{t('borrowersPage.table.phone')}</Label>
            <div className="col-span-2 flex items-center gap-2">
               <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
                {customer.phone && (
                    <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp">
                        <WhatsAppIcon className="h-4 w-4 text-success hover:opacity-80" />
                        <span className="sr-only">Chat on WhatsApp</span>
                    </a>
                )}
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">{t('borrowersPage.table.address')}</Label>
            <p className="col-span-2 text-sm">{customer.address}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">{t('borrowersPage.table.idCardNumber')}</Label>
            <p className="col-span-2 text-sm">{customer.idCardNumber || '-'}</p>
          </div>

          {hasSocialLinks && (
              <>
                <Separator />
                {customer.telegramChatId && (
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-muted-foreground">Telegram</Label>
                        <div className="col-span-2">
                            <Button asChild variant="outline" size="sm" className="justify-start w-full">
                                <NextLink href={`https://t.me/${customer.telegramChatId.replace('@','')}`} target="_blank" rel="noopener noreferrer">
                                <TelegramIcon className="mr-2 h-4 w-4" />
                                {customer.telegramChatId}
                                </NextLink>
                            </Button>
                        </div>
                    </div>
                )}
                {customer.facebookUrl && (
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-muted-foreground">Facebook</Label>
                        <div className="col-span-2">
                             <Button asChild variant="outline" size="sm" className="justify-start w-full">
                                <NextLink href={customer.facebookUrl} target="_blank" rel="noopener noreferrer">
                                <FacebookIcon className="mr-2 h-4 w-4" />
                                View Profile
                                </NextLink>
                            </Button>
                        </div>
                    </div>
                )}
              </>
          )}

          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">{t('borrowersPage.table.totalLoans')}</Label>
            <p className="col-span-2 text-sm font-medium">{customer.totalLoans}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-muted-foreground">{t('borrowersPage.table.totalLoanedAmount')}</Label>
            <p className="col-span-2 text-sm font-medium">{formatTotalLoaned(customer)}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
