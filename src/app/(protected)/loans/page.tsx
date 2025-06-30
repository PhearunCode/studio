
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoans, getCustomers } from "@/lib/firebase";
import { type Loan, type Customer } from "@/lib/types";
import { LoanTable } from "@/components/dashboard/loan-table";
import { LoanFormWrapper } from "@/components/dashboard/loan-form-wrapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function LoansPage() {
  let loans: Loan[] = [];
  let customers: Customer[] = [];
  let firebaseError: Error | null = null;

  try {
    // Fetch in parallel
    [loans, customers] = await Promise.all([getLoans(), getCustomers()]);
  } catch (error) {
    firebaseError = error as Error;
  }

  if (firebaseError) {
    return (
       <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Loans</h2>
        </div>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Firebase Connection Error</AlertTitle>
          <AlertDescription>
            <p>The application could not retrieve loan data from Firebase. Please ensure your environment variables are set up correctly.</p>
            <p className="font-mono bg-destructive-foreground/10 p-2 rounded-md text-xs mt-2">{firebaseError.message}</p>
            <p className="mt-2 text-sm">You can find step-by-step instructions on the <a href="/firebase" className="underline font-semibold">Firebase Setup Page</a>.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Loans</h2>
        <div className="flex items-center space-x-2">
          <LoanFormWrapper customers={customers} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            A list of all loan applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoanTable loans={loans} />
        </CardContent>
      </Card>
    </div>
  );
}
