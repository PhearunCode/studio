'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoanForm } from '@/components/dashboard/loan-form';
import { PlusCircle } from 'lucide-react';

export function LoanFormWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <LoanForm open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" /> New Loan
      </Button>
    </LoanForm>
  );
}
