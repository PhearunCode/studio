
import { getLoans, getCustomers } from "@/lib/firebase";
import { type Loan, type Customer } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, Users, Percent, Landmark } from "lucide-react";
import { calculateMonthlyPayment, formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerFormWrapper } from "@/components/customers/customer-form-wrapper";

export default async function DashboardPage() {
  const loans: Loan[] = await getLoans();
  const customers: Customer[] = await getCustomers();

  const totalLoans = loans.length;
  const khrLoans = loans.filter(loan => loan.currency === 'KHR');
  const usdLoans = loans.filter(loan => loan.currency === 'USD');

  const totalAmountLoanedKhr = khrLoans.reduce((acc, loan) => acc + loan.amount, 0);
  const totalAmountLoanedUsd = usdLoans.reduce((acc, loan) => acc + loan.amount, 0);

  const averageInterestRate =
    totalLoans > 0
      ? loans.reduce((acc, loan) => acc + loan.interestRate, 0) / totalLoans
      : 0;

  const calculateTotalInterest = (filteredLoans: Loan[]) => {
      return filteredLoans
        .filter(loan => loan.status === 'Approved' || loan.status === 'Paid')
        .reduce((acc, loan) => {
            const monthlyPayment = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.term);
            const totalPaid = monthlyPayment * loan.term;
            const totalInterest = totalPaid > loan.amount ? totalPaid - loan.amount : 0;
            return acc + totalInterest;
        }, 0);
  }

  const totalInterestEarnedKhr = calculateTotalInterest(khrLoans);
  const totalInterestEarnedUsd = calculateTotalInterest(usdLoans);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {totalAmountLoanedKhr > 0 && (
            <StatCard
            title="Total Loaned (KHR)"
            value={formatCurrency(totalAmountLoanedKhr, 'KHR')}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            description="Total amount disbursed in KHR"
            />
        )}
        {totalAmountLoanedUsd > 0 && (
             <StatCard
             title="Total Loaned (USD)"
             value={formatCurrency(totalAmountLoanedUsd, 'USD')}
             icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
             description="Total amount disbursed in USD"
           />
        )}
        <StatCard
          title="Total Borrowers"
          value={customers.length.toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Total number of unique customers"
        />
        <StatCard
          title="Avg. Interest Rate"
          value={`${averageInterestRate.toFixed(2)}%`}
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
          description="Average interest rate across all loans"
        />
        {totalInterestEarnedKhr > 0 && (
            <StatCard
                title="Potential Interest (KHR)"
                value={formatCurrency(totalInterestEarnedKhr, 'KHR')}
                icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
                description="Potential interest from KHR loans"
            />
        )}
        {totalInterestEarnedUsd > 0 && (
            <StatCard
                title="Potential Interest (USD)"
                value={formatCurrency(totalInterestEarnedUsd, 'USD')}
                icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
                description="Potential interest from USD loans"
            />
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                A list of all customers and their loan summaries.
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
