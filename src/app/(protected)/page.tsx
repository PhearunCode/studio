import { getLoans, getCustomers, isFirebaseConnected } from "@/lib/firebase";
import { FirebaseSetupInstructions } from "@/components/layout/firebase-setup-instructions";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

export default async function DashboardPage() {
  const connected = isFirebaseConnected();

  if (!connected) {
    return (
      <FirebaseSetupInstructions />
    );
  }
  
  const [loans, customers] = await Promise.all([getLoans(), getCustomers()]);

  return <DashboardPageClient loans={loans} customers={customers} />;
}
