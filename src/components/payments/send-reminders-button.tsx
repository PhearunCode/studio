'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendPaymentRemindersAction } from '@/lib/actions';
import { BellRing, Loader2 } from 'lucide-react';
import { useTranslation } from '@/contexts/language-context';

function SubmitButton() {
    const { pending } = useFormStatus();
    const { t } = useTranslation();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellRing className="mr-2 h-4 w-4" />}
            {t('paymentsPage.sendReminders')}
        </Button>
    );
}

export function SendRemindersButton() {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [state, formAction] = useActionState(sendPaymentRemindersAction, null);

    useEffect(() => {
        if (!state) return;
        if (state.error) {
            toast({ title: t('toast.error'), description: state.message, variant: 'destructive' });
        } else {
            toast({ title: t('toast.success'), description: state.message, className: 'bg-accent text-accent-foreground' });
        }
    }, [state, toast, t]);

    return (
        <form action={formAction}>
            <SubmitButton />
        </form>
    );
}
