
import { getLoans, getCustomers, isFirebaseConnected } from "@/lib/firebase";
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
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { FirebaseWarning } from "@/components/layout/firebase-warning";


export default async function DashboardPage() {
  const connected = isFirebaseConnected();
  const [loans, customers] = await Promise.all([getLoans(), getCustomers()]);

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
            const monthlyInterest = loan.amount * (loan.interestRate / 100);
            const totalInterestForLoan = monthlyInterest * loan.term;
            return acc + totalInterestForLoan;
        }, 0);
  }

  const totalInterestEarnedKhr = calculateTotalInterest(khrLoans);
  const totalInterestEarnedUsd = calculateTotalInterest(usdLoans);
  
  // Data processing for the overview chart
  const monthlyData: { [key: string]: { KHR: number; USD: number } } = {};
  const monthLabels: {key: string, name: string}[] = [];
  const today = new Date();
  
  for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      const name = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthLabels.push({key, name});
      monthlyData[key] = { KHR: 0, USD: 0 };
  }

  loans.forEach(loan => {
    const key = loan.loanDate.slice(0, 7); // YYYY-MM
    if (monthlyData[key]) {
        if (loan.currency === 'KHR') {
          monthlyData[key].KHR += loan.amount;
        } else if (loan.currency === 'USD') {
          monthlyData[key].USD += loan.amount;
        }
    }
  });

  const chartData = monthLabels.map(label => ({
    name: label.name,
    KHR: monthlyData[label.key].KHR,
    USD: monthlyData[label.key].USD,
  }));


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {!connected && <FirebaseWarning />}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {totalAmountLoanedKhr > 0 && (
            <StatCard
            title="Total Loaned (KHR)"
            value={formatCurrency(totalAmountLoanedKhr, 'KHR')}
            icon={<DollarSign className="h-4 w-4 text-destructive-foreground opacity-80" />}
            description="Total amount disbursed in KHR"
            className="bg-chart-1 text-destructive-foreground"
            />
        )}
        {totalAmountLoanedUsd > 0 && (
             <StatCard
             title="Total Loaned (USD)"
             value={formatCurrency(totalAmountLoanedUsd, 'USD')}
             icon={<DollarSign className="h-4 w-4 text-destructive-foreground opacity-80" />}
             description="Total amount disbursed in USD"
             className="bg-chart-2 text-destructive-foreground"
           />
        )}
        <StatCard
          title="Total Borrowers"
          value={customers.length.toString()}
          icon={<Users className="h-4 w-4 text-destructive-foreground opacity-80" />}
          description="Total number of unique customers"
          className="bg-chart-4 text-destructive-foreground"
        />
        <StatCard
          title="Avg. Interest Rate"
          value={`${averageInterestRate.toFixed(2)}%`}
          icon={<Percent className="h-4 w-4 text-destructive-foreground opacity-80" />}
          description="Average interest rate across all loans"
          className="bg-chart-5 text-destructive-foreground"
        />
        {totalInterestEarnedKhr > 0 && (
            <StatCard
                title="Potential Interest (KHR)"
                value={formatCurrency(totalInterestEarnedKhr, 'KHR')}
                icon={<Landmark className="h-4 w-4 text-destructive-foreground opacity-80" />}
                description="Potential interest from KHR loans"
                className="bg-chart-1 text-destructive-foreground"
            />
        )}
        {totalInterestEarnedUsd > 0 && (
            <StatCard
                title="Potential Interest (USD)"
                value={formatCurrency(totalInterestEarnedUsd, 'USD')}
                icon={<Landmark className="h-4 w-4 text-destructive-foreground opacity-80" />}
                description="Potential interest from USD loans"
                className="bg-chart-2 text-destructive-foreground"
            />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Loan Overview</CardTitle>
          <CardDescription>
            Total loan amounts disbursed over the last 12 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OverviewChart data={chartData} />
        </CardContent>
      </Card>

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
