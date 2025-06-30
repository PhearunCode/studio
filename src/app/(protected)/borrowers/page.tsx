
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCustomers, isFirebaseConnected } from "@/lib/firebase";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerFormWrapper } from "@/components/customers/customer-form-wrapper";
import { FirebaseSetupInstructions } from "@/components/layout/firebase-setup-instructions";

export default async function CustomersPage() {
  const connected = isFirebaseConnected();

  if (!connected) {
    return (
      <FirebaseSetupInstructions />
    );
  }
  
  const customers = await getCustomers();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Borrowers</h2>
        <div className="flex items-center space-x-2">
           <CustomerFormWrapper />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Borrower List</CardTitle>
          <CardDescription>
            A list of all borrowers and their loan summaries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerTable customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
