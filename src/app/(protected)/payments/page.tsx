
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoans } from "@/lib/firebase";
import { type Loan } from "@/lib/types";
import { PaymentsTable } from "@/components/payments/payments-table";
import { SendRemindersButton } from "@/components/payments/send-reminders-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function PaymentsPage() {
  let loans: Loan[] = [];
  let firebaseError: Error | null = null;

  try {
    loans = await getLoans();
  } catch (error) {
    firebaseError = error as Error;
  }

  if (firebaseError) {
    return (
       <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        </div>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Firebase Connection Error</AlertTitle>
          <AlertDescription>
            <p>The application could not retrieve payment data from Firebase. Please ensure your environment variables are set up correctly.</p>
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
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <div className="flex items-center space-x-2">
          <SendRemindersButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
          <CardDescription>
            An overview of monthly payments for all active loans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsTable loans={loans} />
        </CardContent>
      </Card>
    </div>
  );
}
