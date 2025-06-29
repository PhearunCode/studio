'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoanForm } from '@/components/dashboard/loan-form';
import { PlusCircle } from 'lucide-react';
import type { Customer } from '@/lib/types';

export function LoanFormWrapper({ customers }: { customers: Customer[] }) {
  const [open, setOpen] = useState(false);

  return (
    <LoanForm open={open} onOpenChange={setOpen} customers={customers}>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" /> New Loan
      </Button>
    </LoanForm>
  );
}
