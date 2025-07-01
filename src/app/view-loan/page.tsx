'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { getLoanHistoryAction } from '@/lib/actions';
import type { Loan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Landmark, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      View Loan History
    </Button>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusVariant = (status: Loan['status']): "success" | "warning" | "destructive" | "secondary" | "outline" => {
        switch(status) {
            case 'Approved':
                return 'success';
            case 'Pending':
                return 'warning';
            case 'Rejected':
                return 'destructive';
            case 'Paid':
                return 'secondary';
            default:
                return 'outline';
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{formatCurrency(loan.amount, loan.currency)}</CardTitle>
                        <CardDescription>Loan Date: {formatDate(loan.loanDate)}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(loan.status)}>{loan.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span>{loan.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Term</span>
                    <span>{loan.term} months</span>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ViewLoanPage() {
  const [state, formAction] = useActionState(getLoanHistoryAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                  <Landmark className="h-6 w-6" />
                </div>
            </div>
            <h1 className="text-3xl font-bold">Customer Loan Portal</h1>
            <p className="text-muted-foreground">Enter your phone number to view your loan history.</p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Find Your Loans</CardTitle>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="e.g. 09171234567"
                            required
                        />
                    </div>
                    {state?.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <SubmitButton />
                     <Button variant="link" asChild className="text-muted-foreground">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Back to Dashboard
                        </Link>
                    </Button>
                </CardFooter>
            </form>
        </Card>

        {state && (state.loans || state.customerName) && !state.error && (
            <div className="space-y-4">
                <Separator />
                <h2 className="text-2xl font-semibold text-center">Loan History for {state.customerName}</h2>
                {state.loans && state.loans.length > 0 ? (
                    <div className="space-y-4">
                        {state.loans.map(loan => <LoanCard key={loan.id} loan={loan} />)}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No loan history found for this phone number.</p>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
