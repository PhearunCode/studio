import { getLoans, isFirebaseConnected } from "@/lib/firebase";
import { FirebaseSetupInstructions } from "@/components/layout/firebase-setup-instructions";
import { PaymentsPageClient } from "@/components/payments/payments-page-client";

export default async function PaymentsPage() {
    const connected = isFirebaseConnected();

    if (!connected) {
        return <FirebaseSetupInstructions />;
    }

    const loans = await getLoans();

    return <PaymentsPageClient loans={loans} />;
}
