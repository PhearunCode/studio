'use client';

import { useState, useMemo } from "react";
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
import { OverviewChart } from "./overview-chart";
import { StatDetailsDialog, type DialogItem } from "./stat-details-dialog";


interface DashboardPageClientProps {
  loans: Loan[];
  customers: Customer[];
}

export function DashboardPageClient({ loans, customers }: DashboardPageClientProps) {
  const { t } = useTranslation();
  const [isStatDialogOpen, setIsStatDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{ title: string; items: DialogItem[] }>({ title: '', items: [] });
  
  const customerMap = useMemo(() => new Map(customers.map(c => [c.name, c])), [customers]);


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

  const handleStatCardClick = (type: 'borrowers' | 'loanedKhr' | 'loanedUsd' | 'interestKhr' | 'interestUsd') => {
    let title = '';
    let items: DialogItem[] = [];
    
    switch (type) {
      case 'borrowers':
        title = t('dashboard.totalBorrowers');
        items = customers.map(c => ({ 
            id: c.id, 
            name: c.name, 
            value: c.phone, 
            avatar: c.avatar,
            customer: c,
        }));
        break;
      case 'loanedKhr':
        title = t('dashboard.totalLoanedKhr');
        items = khrLoans.map(l => ({ 
            id: l.id, 
            name: l.name, 
            value: formatCurrency(l.amount, 'KHR'),
            avatar: customerMap.get(l.name)?.avatar,
            customer: customerMap.get(l.name),
        }));
        break;
      case 'loanedUsd':
        title = t('dashboard.totalLoanedUsd');
        items = usdLoans.map(l => ({ 
            id: l.id, 
            name: l.name, 
            value: formatCurrency(l.amount, 'USD'),
            avatar: customerMap.get(l.name)?.avatar,
            customer: customerMap.get(l.name),
        }));
        break;
      case 'interestKhr':
        title = t('dashboard.potentialInterestKhr');
        items = khrLoans.map(l => {
            const monthlyInterest = l.amount * (l.interestRate / 100);
            const totalInterestForLoan = monthlyInterest * l.term;
            return {
                id: l.id, 
                name: l.name, 
                value: formatCurrency(totalInterestForLoan, 'KHR'),
                avatar: customerMap.get(l.name)?.avatar,
                customer: customerMap.get(l.name),
            }
        });
        break;
      case 'interestUsd':
        title = t('dashboard.potentialInterestUsd');
        items = usdLoans.map(l => {
            const monthlyInterest = l.amount * (l.interestRate / 100);
            const totalInterestForLoan = monthlyInterest * l.term;
            return {
                id: l.id, 
                name: l.name, 
                value: formatCurrency(totalInterestForLoan, 'USD'),
                avatar: customerMap.get(l.name)?.avatar,
                customer: customerMap.get(l.name),
            }
        });
        break;
    }

    setDialogContent({ title, items });
    setIsStatDialogOpen(true);
  };

  const overviewData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      name: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      KHR: 0,
      USD: 0,
    };
  }).reverse();

  activeLoans.forEach(loan => {
    // Add T00:00:00 to treat date as local, preventing timezone shifts
    const loanDate = new Date(loan.loanDate + 'T00:00:00');
    const loanMonth = loanDate.getMonth();
    const loanYear = loanDate.getFullYear();
    
    const monthData = overviewData.find(d => d.month === loanMonth && d.year === loanYear);
    
    if (monthData) {
        if (loan.currency === 'KHR') {
            monthData.KHR += loan.amount;
        } else if (loan.currency === 'USD') {
            monthData.USD += loan.amount;
        }
    }
  });


  return (
    <>
      <StatDetailsDialog
        open={isStatDialogOpen}
        onOpenChange={setIsStatDialogOpen}
        title={dialogContent.title}
        items={dialogContent.items}
      />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {totalAmountLoanedKhr > 0 && (
              <StatCard
              title={t('dashboard.totalLoanedKhr')}
              value={formatCurrency(totalAmountLoanedKhr, 'KHR')}
              icon={<DollarSign className="h-4 w-4 text-destructive-foreground opacity-80" />}
              description={t('dashboard.totalAmountDisbursedKhr')}
              className="bg-chart-1 text-destructive-foreground"
              onClick={() => handleStatCardClick('loanedKhr')}
              />
          )}
          {totalAmountLoanedUsd > 0 && (
             <StatCard
             title={t('dashboard.totalLoanedUsd')}
             value={formatCurrency(totalAmountLoanedUsd, 'USD')}
             icon={<DollarSign className="h-4 w-4 text-destructive-foreground opacity-80" />}
             description={t('dashboard.totalAmountDisbursedUsd')}
             className="bg-chart-2 text-destructive-foreground"
             onClick={() => handleStatCardClick('loanedUsd')}
           />
          )}
          <StatCard
            title={t('dashboard.totalBorrowers')}
            value={customers.length.toString()}
            icon={<Users className="h-4 w-4 text-destructive-foreground opacity-80" />}
            description={t('dashboard.totalUniqueCustomers')}
            className="bg-chart-4 text-destructive-foreground"
            onClick={() => handleStatCardClick('borrowers')}
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
                  onClick={() => handleStatCardClick('interestKhr')}
              />
          )}
          {totalInterestEarnedUsd > 0 && (
              <StatCard
                  title={t('dashboard.potentialInterestUsd')}
                  value={formatCurrency(totalInterestEarnedUsd, 'USD')}
                  icon={<Landmark className="h-4 w-4 text-destructive-foreground opacity-80" />}
                  description={t('dashboard.potentialInterestUsdDesc')}
                  className="bg-chart-2 text-destructive-foreground"
                  onClick={() => handleStatCardClick('interestUsd')}
              />
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.monthlyLoanOverview')}</CardTitle>
              <CardDescription>{t('dashboard.monthlyLoanOverviewDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <OverviewChart data={overviewData} />
            </CardContent>
          </Card>
          
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
    </>
  );
}
