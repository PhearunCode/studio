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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/contexts/language-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { CustomerProfilePopover } from '../customers/customer-profile-popover';
import type { Customer } from '@/lib/types';

export interface DialogItem {
    id: string;
    avatar?: string;
    name: string;
    value: string;
    customer?: Customer;
}

interface StatDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: DialogItem[];
}

export function StatDetailsDialog({ open, onOpenChange, title, items }: StatDetailsDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            A detailed list for the selected metric.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-md border p-3">
                <CustomerProfilePopover customer={item.customer}>
                    <Avatar className="cursor-pointer">
                        <AvatarImage src={item.avatar || `https://avatar.vercel.sh/${item.name}.png`} alt={item.name} />
                        <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                    </Avatar>
                </CustomerProfilePopover>
                <div className="flex-1 grid gap-0.5">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
            {items.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No items to display.</p>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
