'use client';

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

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="text-right">Total Loans</TableHead>
          <TableHead className="text-right">Total Loaned Amount</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${customer.name}.png`} alt={customer.name} />
                  <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5">
                  <span className="font-medium">{customer.name}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>{customer.address}</TableCell>
            <TableCell className="text-right">{customer.totalLoans}</TableCell>
            <TableCell className="text-right">
              ₱{customer.totalLoanAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>View Loans</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
