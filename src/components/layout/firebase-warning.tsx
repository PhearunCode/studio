'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from 'next/link';

export function FirebaseWarning() {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Firebase Not Connected - Displaying Mock Data</AlertTitle>
            <AlertDescription>
                <p>The application could not connect to your Firebase project, so it is currently displaying sample data. Any changes you make (like adding or editing loans) will not be saved.</p>
                <p className="mt-2 text-sm">To connect your database, please follow the setup instructions on the <Link href="/firebase" className="underline font-semibold">Firebase Setup Page</Link> and restart the server.</p>
            </AlertDescription>
        </Alert>
    );
}
