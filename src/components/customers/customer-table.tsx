'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, MessageSquare } from 'lucide-react';
import { type Customer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomerForm } from './customer-form';
import { DeleteCustomerDialog } from './delete-customer-dialog';
import { TelegramChatDialog } from './telegram-chat-dialog';
import { CustomerDetailsDialog } from './customer-details-dialog';
import { formatCurrency, getInitials } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/language-context';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { CustomerProfilePopover } from './customer-profile-popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const { t } = useTranslation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };
  
  const handleChat = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsChatDialogOpen(true);
  };
  
  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsDialogOpen(true);
  };

  const formatTotalLoaned = (customer: Customer) => {
    const khrAmount = customer.totalLoanAmountKhr > 0 ? formatCurrency(customer.totalLoanAmountKhr, 'KHR') : null;
    const usdAmount = customer.totalLoanAmountUsd > 0 ? formatCurrency(customer.totalLoanAmountUsd, 'USD') : null;

    if (khrAmount && usdAmount) {
        return `${khrAmount} / ${usdAmount}`;
    }
    return khrAmount || usdAmount || '-';
  }

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const dialogs = (
    <>
      <CustomerForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={selectedCustomer}
      />
      <DeleteCustomerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        customer={selectedCustomer}
      />
      <TelegramChatDialog
        open={isChatDialogOpen}
        onOpenChange={setIsChatDialogOpen}
        customer={selectedCustomer}
      />
      <CustomerDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        customer={selectedCustomer}
      />
    </>
  );

  const searchBar = (
    <div className="py-4">
      <Input
        placeholder={t('borrowersPage.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={isMobile ? "w-full" : "max-w-sm"}
      />
    </div>
  );

  if (isMobile) {
    return (
      <>
        {dialogs}
        {searchBar}
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="cursor-pointer" onClick={() => handleViewDetails(customer)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CustomerProfilePopover customer={customer}>
                      <Avatar>
                        <AvatarImage src={customer.avatar || `https://avatar.vercel.sh/${customer.name}.png`} alt={customer.name} />
                        <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                    </CustomerProfilePopover>
                    <div>
                      <CardTitle className="text-base">{customer.name}</CardTitle>
                      <CardDescription>{customer.phone}</CardDescription>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleViewDetails(customer)}>
                          {t('viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleEdit(customer)}>
                          {t('borrowersPage.actions.editCustomer')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(customer)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          {t('borrowersPage.actions.deleteCustomer')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                 <div className="flex justify-between text-muted-foreground">
                    <span>{t('borrowersPage.table.totalLoans')}</span>
                    <span>{customer.totalLoans}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>{t('borrowersPage.table.totalLoanedAmount')}</span>
                    <span className="font-medium text-foreground">{formatTotalLoaned(customer)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {dialogs}
      {searchBar}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('borrowersPage.table.customer')}</TableHead>
            <TableHead>{t('borrowersPage.table.phone')}</TableHead>
            <TableHead className="hidden lg:table-cell">{t('borrowersPage.table.telegramId')}</TableHead>
            <TableHead className="hidden md:table-cell text-right">{t('borrowersPage.table.totalLoans')}</TableHead>
            <TableHead className="hidden xl:table-cell text-right">{t('borrowersPage.table.totalLoanedAmount')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <CustomerProfilePopover customer={customer}>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={customer.avatar || `https://avatar.vercel.sh/${customer.name}.png`} alt={customer.name} />
                      <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                  </CustomerProfilePopover>
                  <div className="grid gap-0.5">
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
                  <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp">
                      <WhatsAppIcon className="h-4 w-4 text-success hover:opacity-80" />
                      <span className="sr-only">Chat on WhatsApp</span>
                  </a>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                 <div className="flex items-center gap-2">
                  <span>{customer.telegramChatId || '-'}</span>
                  {customer.telegramChatId && (
                    <Button variant="ghost" size="icon" onClick={() => handleChat(customer)} title="Chat on Telegram">
                      <MessageSquare className="h-4 w-4" />
                       <span className="sr-only">Chat with customer</span>
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-right">{customer.totalLoans}</TableCell>
              <TableCell className="hidden xl:table-cell text-right">
                {formatTotalLoaned(customer)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleViewDetails(customer)}> 
                      {t('viewDetails')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleEdit(customer)}>
                      {t('borrowersPage.actions.editCustomer')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDelete(customer)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      {t('borrowersPage.actions.deleteCustomer')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
