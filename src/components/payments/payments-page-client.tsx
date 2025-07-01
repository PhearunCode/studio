'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentsTable } from "@/components/payments/payments-table";
import { SendRemindersButton } from "@/components/payments/send-reminders-button";
import { useTranslation } from "@/contexts/language-context";
import { type Loan, type Customer } from "@/lib/types";

interface PaymentsPageClientProps {
    loans: Loan[];
    customers: Customer[];
}

export function PaymentsPageClient({ loans, customers }: PaymentsPageClientProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('paymentsPage.title')}</h2>
        <div className="flex items-center space-x-2">
          <SendRemindersButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('paymentsPage.paymentOverview')}</CardTitle>
          <CardDescription>
            {t('paymentsPage.paymentOverviewDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsTable loans={loans} customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
