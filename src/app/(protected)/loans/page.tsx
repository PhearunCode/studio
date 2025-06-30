
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoans, getCustomers, isFirebaseConnected } from "@/lib/firebase";
import { LoanTable } from "@/components/dashboard/loan-table";
import { LoanFormWrapper } from "@/components/dashboard/loan-form-wrapper";
import { FirebaseSetupInstructions } from "@/components/layout/firebase-setup-instructions";

export default async function LoansPage() {
  const connected = isFirebaseConnected();

  if (!connected) {
    return (
      <FirebaseSetupInstructions />
    );
  }

  const [loans, customers] = await Promise.all([getLoans(), getCustomers()]);

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
