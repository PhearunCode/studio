'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/components/customers/customer-form';
import { PlusCircle } from 'lucide-react';

export function CustomerFormWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <CustomerForm open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" /> New Customer
      </Button>
    </CustomerForm>
  );
}
