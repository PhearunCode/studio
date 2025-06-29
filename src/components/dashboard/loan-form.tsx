'use client';

import { useState, useTransition, useEffect, useRef, useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLoanAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, FileUp, X, FileIcon } from 'lucide-react';
import { VerificationResultDialog } from './verification-result-dialog';
import type { Loan } from '@/lib/types';
import type { FormState } from '@/lib/types';

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Submit Application
    </Button>
  );
}

const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function LoanForm({ loans }: { loans: Loan[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [verificationResult, setVerificationResult] = useState<{flags: string[], summary: string} | null>(null);
  const [isVerificationDialogOpen, setVerificationDialogOpen] = useState(false);

  const createLoanWithHistoricalData = createLoanAction.bind(null, loans);
  const [state, formAction] = useActionState(createLoanWithHistoricalData, null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      const formData = new FormData(form);
      const fileData = await Promise.all(
        files.map(async file => ({
          name: file.name,
          dataUrl: await readFileAsDataURL(file)
        }))
      );
      formData.set('documents', JSON.stringify(fileData));
      
      formAction(formData);
    });
  };

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: state.message,
        className: 'bg-accent text-accent-foreground'
      });
      if(state.verificationResult) {
          setVerificationResult(state.verificationResult);
          setVerificationDialogOpen(true);
      }
      setOpen(false);
      formRef.current?.reset();
      setFiles([]);
    }
  }, [state, toast]);

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> New Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new loan application.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Borrower Name</Label>
                <Input id="name" name="name" placeholder="Juan dela Cruz" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱)</Label>
                <Input id="amount" name="amount" type="number" placeholder="50000" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input id="interestRate" name="interestRate" type="number" step="0.1" placeholder="5.5" required />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="loanDate">Loan Date</Label>
              <Input id="loanDate" name="loanDate" type="date" required />
            </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Rizal St, Manila" required />
          </div>
          <div className="space-y-2">
              <Label htmlFor="documents-upload">Supporting Documents</Label>
              <div className="relative">
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="documents-upload" name="documents-upload" type="file" multiple onChange={handleFileChange} className="pl-10"/>
              </div>
          </div>
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Selected files:</p>
                    <ul className="space-y-1">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded-md">
                                <div className="flex items-center gap-2">
                                    <FileIcon className="h-4 w-4" />
                                    <span>{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton isPending={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {verificationResult && (
        <VerificationResultDialog 
            isOpen={isVerificationDialogOpen}
            setIsOpen={setVerificationDialogOpen}
            result={verificationResult}
        />
    )}
    </>
  );
}
