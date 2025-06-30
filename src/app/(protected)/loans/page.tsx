import { getLoans, getCustomers, isFirebaseConnected } from "@/lib/firebase";
import { FirebaseSetupInstructions } from "@/components/layout/firebase-setup-instructions";
import { LoansPageClient } from "@/components/dashboard/loans-page-client";

export default async function LoansPage() {
    const connected = isFirebaseConnected();

    if (!connected) {
        return <FirebaseSetupInstructions />;
    }

    const [loans, customers] = await Promise.all([getLoans(), getCustomers()]);

    return <LoansPageClient loans={loans} customers={customers} />;
}
