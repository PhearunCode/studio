'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { type Customer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomerForm } from './customer-form';
import { DeleteCustomerDialog } from './delete-customer-dialog';
import { formatCurrency, getInitials } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/language-context';

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const { t } = useTranslation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
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


  return (
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
      <div className="py-4">
        <Input
          placeholder={t('borrowersPage.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('borrowersPage.table.customer')}</TableHead>
            <TableHead>{t('borrowersPage.table.phone')}</TableHead>
            <TableHead>{t('borrowersPage.table.telegramId')}</TableHead>
            <TableHead>{t('borrowersPage.table.idCardNumber')}</TableHead>
            <TableHead>{t('borrowersPage.table.address')}</TableHead>
            <TableHead className="text-right">{t('borrowersPage.table.totalLoans')}</TableHead>
            <TableHead className="text-right">{t('borrowersPage.table.totalLoanedAmount')}</TableHead>
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
                  <Avatar>
                    <AvatarImage src={customer.avatar || `https://avatar.vercel.sh/${customer.name}.png`} alt={customer.name} />
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-0.5">
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.telegramChatId || '-'}</TableCell>
              <TableCell>{customer.idCardNumber || '-'}</TableCell>
              <TableCell>{customer.address}</TableCell>
              <TableCell className="text-right">{customer.totalLoans}</TableCell>
              <TableCell className="text-right">
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
