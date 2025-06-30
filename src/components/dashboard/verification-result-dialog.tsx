'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from '@/contexts/language-context';

interface VerificationResultDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    result: {
        flags: string[];
        summary: string;
    };
}

export function VerificationResultDialog({ isOpen, setIsOpen, result }: VerificationResultDialogProps) {
  const { t } = useTranslation();
  const hasFlags = result.flags.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasFlags ? <AlertTriangle className="text-destructive" /> : <CheckCircle className="text-green-500" />}
            {t('verificationResultDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('verificationResultDialog.desc')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Alert variant={hasFlags ? 'destructive' : 'default'} className={!hasFlags ? 'bg-accent border-green-300' : ''}>
                <Info className="h-4 w-4" />
                <AlertTitle>{hasFlags ? t('verificationResultDialog.issuesFound') : t('verificationResultDialog.noIssuesFound')}</AlertTitle>
                <AlertDescription>
                    {result.summary}
                </AlertDescription>
            </Alert>
            
            {hasFlags && (
                 <div>
                    <h3 className="font-semibold mb-2">{t('verificationResultDialog.flagsRaised')}</h3>
                    <div className="flex flex-wrap gap-2">
                        {result.flags.map((flag, index) => (
                            <Badge key={index} variant="destructive">{flag}</Badge>
                        ))}
                    </div>
                 </div>
            )}
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
