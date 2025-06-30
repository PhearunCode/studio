import { getCustomers, isFirebaseConnected } from "@/lib/firebase";
import { FirebaseSetupInstructions } from "@/components/layout/firebase-setup-instructions";
import { BorrowersPageClient } from "@/components/customers/borrowers-page-client";

export default async function BorrowersPage() {
    const connected = isFirebaseConnected();

    if (!connected) {
        return <FirebaseSetupInstructions />;
    }

    const customers = await getCustomers();

    return <BorrowersPageClient customers={customers} />;
}
