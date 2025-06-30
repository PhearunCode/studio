'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerFormWrapper } from "@/components/customers/customer-form-wrapper";
import { useTranslation } from "@/contexts/language-context";
import { type Customer } from "@/lib/types";

interface BorrowersPageClientProps {
  customers: Customer[];
}

export function BorrowersPageClient({ customers }: BorrowersPageClientProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('borrowersPage.title')}</h2>
        <div className="flex items-center space-x-2">
           <CustomerFormWrapper />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('borrowersPage.borrowerList')}</CardTitle>
          <CardDescription>
            {t('borrowersPage.borrowerListDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerTable customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
