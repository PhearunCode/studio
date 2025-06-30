import { getLoans, getCustomers, isFirebaseConnected } from "@/lib/firebase";
import { FirebaseSetupInstructions } from "@/components/layout/firebase-setup-instructions";
import { PaymentsPageClient } from "@/components/payments/payments-page-client";

export default async function PaymentsPage() {
    const connected = isFirebaseConnected();

    if (!connected) {
        return <FirebaseSetupInstructions />;
    }

    const [loans, customers] = await Promise.all([getLoans(), getCustomers()]);

    return <PaymentsPageClient loans={loans} customers={customers} />;
}
