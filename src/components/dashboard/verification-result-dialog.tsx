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

interface VerificationResultDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    result: {
        flags: string[];
        summary: string;
    };
}

export function VerificationResultDialog({ isOpen, setIsOpen, result }: VerificationResultDialogProps) {
  const hasFlags = result.flags.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasFlags ? <AlertTriangle className="text-destructive" /> : <CheckCircle className="text-green-500" />}
            AI Verification Complete
          </DialogTitle>
          <DialogDescription>
            The loan application has been automatically analyzed. Here are the findings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Alert variant={hasFlags ? 'destructive' : 'default'} className={!hasFlags ? 'bg-accent border-green-300' : ''}>
                <Info className="h-4 w-4" />
                <AlertTitle>{hasFlags ? 'Potential Issues Found' : 'No Issues Found'}</AlertTitle>
                <AlertDescription>
                    {result.summary}
                </AlertDescription>
            </Alert>
            
            {hasFlags && (
                 <div>
                    <h3 className="font-semibold mb-2">Flags Raised:</h3>
                    <div className="flex flex-wrap gap-2">
                        {result.flags.map((flag, index) => (
                            <Badge key={index} variant="destructive">{flag}</Badge>
                        ))}
                    </div>
                 </div>
            )}
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
