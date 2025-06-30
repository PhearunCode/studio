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
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('paymentsPage.title')}</h2>
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
