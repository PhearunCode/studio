'use client';

import { type Loan, type Customer } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, Users, Percent, Landmark } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
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

interface DashboardPageClientProps {
  loans: Loan[];
  customers: Customer[];
}

export function DashboardPageClient({ loans, customers }: DashboardPageClientProps) {
  const { t } = useTranslation();

  const activeLoans = loans.filter(loan => loan.status === 'Approved' || loan.status === 'Paid');

  const totalLoans = activeLoans.length;
  const khrLoans = activeLoans.filter(loan => loan.currency === 'KHR');
  const usdLoans = activeLoans.filter(loan => loan.currency === 'USD');

  const totalAmountLoanedKhr = khrLoans.reduce((acc, loan) => acc + loan.amount, 0);
  const totalAmountLoanedUsd = usdLoans.reduce((acc, loan) => acc + loan.amount, 0);

  const averageInterestRate =
    totalLoans > 0
      ? activeLoans.reduce((acc, loan) => acc + loan.interestRate, 0) / totalLoans
      : 0;

  const calculateTotalInterest = (filteredLoans: Loan[]) => {
      return filteredLoans
        .filter(loan => loan.status === 'Approved' || loan.status === 'Paid')
        .reduce((acc, loan) => {
            const monthlyInterest = loan.amount * (loan.interestRate / 100);
            const totalInterestForLoan = monthlyInterest * loan.term;
            return acc + totalInterestForLoan;
        }, 0);
  }

  const totalInterestEarnedKhr = calculateTotalInterest(khrLoans);
  const totalInterestEarnedUsd = calculateTotalInterest(usdLoans);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {totalAmountLoanedKhr > 0 && (
            <StatCard
            title={t('dashboard.totalLoanedKhr')}
            value={formatCurrency(totalAmountLoanedKhr, 'KHR')}
            icon={<DollarSign className="h-4 w-4 text-destructive-foreground opacity-80" />}
            description={t('dashboard.totalAmountDisbursedKhr')}
            className="bg-chart-1 text-destructive-foreground"
            />
        )}
        {totalAmountLoanedUsd > 0 && (
             <StatCard
             title={t('dashboard.totalLoanedUsd')}
             value={formatCurrency(totalAmountLoanedUsd, 'USD')}
             icon={<DollarSign className="h-4 w-4 text-destructive-foreground opacity-80" />}
             description={t('dashboard.totalAmountDisbursedUsd')}
             className="bg-chart-2 text-destructive-foreground"
           />
        )}
        <StatCard
          title={t('dashboard.totalBorrowers')}
          value={customers.length.toString()}
          icon={<Users className="h-4 w-4 text-destructive-foreground opacity-80" />}
          description={t('dashboard.totalUniqueCustomers')}
          className="bg-chart-4 text-destructive-foreground"
        />
        <StatCard
          title={t('dashboard.avgInterestRate')}
          value={`${averageInterestRate.toFixed(2)}%`}
          icon={<Percent className="h-4 w-4 text-destructive-foreground opacity-80" />}
          description={t('dashboard.avgInterestRateDesc')}
          className="bg-chart-5 text-destructive-foreground"
        />
        {totalInterestEarnedKhr > 0 && (
            <StatCard
                title={t('dashboard.potentialInterestKhr')}
                value={formatCurrency(totalInterestEarnedKhr, 'KHR')}
                icon={<Landmark className="h-4 w-4 text-destructive-foreground opacity-80" />}
                description={t('dashboard.potentialInterestKhrDesc')}
                className="bg-chart-1 text-destructive-foreground"
            />
        )}
        {totalInterestEarnedUsd > 0 && (
            <StatCard
                title={t('dashboard.potentialInterestUsd')}
                value={formatCurrency(totalInterestEarnedUsd, 'USD')}
                icon={<Landmark className="h-4 w-4 text-destructive-foreground opacity-80" />}
                description={t('dashboard.potentialInterestUsdDesc')}
                className="bg-chart-2 text-destructive-foreground"
            />
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('dashboard.customerList')}</CardTitle>
              <CardDescription>
                {t('dashboard.customerListDesc')}
              </CardDescription>
            </div>
            <CustomerFormWrapper />
          </CardHeader>
          <CardContent>
            <CustomerTable customers={customers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
