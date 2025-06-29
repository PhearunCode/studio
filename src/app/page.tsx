import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoans, getCustomers } from "@/lib/firebase";
import { type Loan, type Customer } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { LoanTable } from "@/components/dashboard/loan-table";
import { DollarSign, Users, Percent } from "lucide-react";
import { LoanFormWrapper } from "@/components/dashboard/loan-form-wrapper";

export default async function DashboardPage() {
  const loans: Loan[] = await getLoans();
  const customers: Customer[] = await getCustomers();

  const totalLoans = loans.length;
  const totalAmountLoaned = loans.reduce((acc, loan) => acc + loan.amount, 0);
  const averageInterestRate =
    totalLoans > 0
      ? loans.reduce((acc, loan) => acc + loan.interestRate, 0) / totalLoans
      : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <LoanFormWrapper customers={customers} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Loaned"
          value={`$${totalAmountLoaned.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total amount disbursed to borrowers"
        />
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            A list of all recent loan applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoanTable loans={loans} />
        </CardContent>
      </Card>
    </div>
  );
}
