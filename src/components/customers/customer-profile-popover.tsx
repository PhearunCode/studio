'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import NextLink from 'next/link';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { TelegramIcon } from '@/components/icons/telegram-icon';

interface CustomerProfilePopoverProps {
  customer: Customer | undefined;
  children: React.ReactNode;
}

export function CustomerProfilePopover({ customer, children }: CustomerProfilePopoverProps) {
  if (!customer) return <>{children}</>;

  const hasSocialLinks = customer.telegramChatId || customer.facebookUrl;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={customer.avatar || `https://avatar.vercel.sh/${customer.name}.png`} alt={customer.name} />
            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <p className="text-sm font-semibold">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
          </div>
        </div>
        
        {hasSocialLinks && (
          <>
            <div className="my-4 h-px bg-muted" />
            <div className="grid gap-2">
              <p className="text-xs font-medium text-muted-foreground">Social Links</p>
              <div className="flex flex-col gap-2">
                {customer.telegramChatId && (
                  <Button asChild variant="outline" size="sm" className="justify-start">
                    <NextLink href={`https://t.me/${customer.telegramChatId.replace('@','')}`} target="_blank" rel="noopener noreferrer">
                      <TelegramIcon className="mr-2 h-4 w-4" />
                      Telegram
                    </NextLink>
                  </Button>
                )}
                {customer.facebookUrl && (
                  <Button asChild variant="outline" size="sm" className="justify-start">
                    <NextLink href={customer.facebookUrl} target="_blank" rel="noopener noreferrer">
                      <FacebookIcon className="mr-2 h-4 w-4" />
                      Facebook
                    </NextLink>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
