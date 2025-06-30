'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoanTable } from "@/components/dashboard/loan-table";
import { LoanFormWrapper } from "@/components/dashboard/loan-form-wrapper";
import { useTranslation } from "@/contexts/language-context";
import { type Loan, type Customer } from "@/lib/types";

interface LoansPageClientProps {
    loans: Loan[];
    customers: Customer[];
}

export function LoansPageClient({ loans, customers }: LoansPageClientProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('loansPage.title')}</h2>
        <div className="flex items-center space-x-2">
          <LoanFormWrapper customers={customers} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('loansPage.loanApplications')}</CardTitle>
          <CardDescription>
            {t('loansPage.loanApplicationsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoanTable loans={loans} />
        </CardContent>
      </Card>
    </div>
  );
}
