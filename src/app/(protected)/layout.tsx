'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AppLayout } from '@/components/layout/app-layout';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function FullScreenLoader() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

function AccessDenied() {
    const router = useRouter();

    const handleLogout = () => {
        // Redirecting to login with a special param will trigger a logout
        // in the login page's useEffect. This avoids needing auth logic here.
        router.push('/login?logout=true');
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="mx-auto bg-destructive text-destructive-foreground p-3 rounded-full mb-4">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-center text-2xl">Access Denied</CardTitle>
                    <CardDescription className="text-center">
                        You do not have the necessary permissions to access this admin panel. Please contact the system administrator if you believe this is an error.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={handleLogout} className="w-full">
                        Return to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return <FullScreenLoader />;
    }

    if (!isAdmin) {
        return <AccessDenied />;
    }

    return <AppLayout>{children}</AppLayout>;
}
