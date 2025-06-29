
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

export default async function PaymentsPage() {
  const loans: Loan[] = await getLoans();

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
