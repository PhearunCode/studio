// src/ai/flows/verify-loan-application.ts
'use server';

/**
 * @fileOverview AI-powered tool that analyzes borrower details against historical data to flag potential inconsistencies or missing information.
 *
 * - verifyLoanApplication - A function that handles the loan application verification process.
 * - VerifyLoanApplicationInput - The input type for the verifyLoanApplication function.
 * - VerifyLoanApplicationOutput - The return type for the verifyLoanApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyLoanApplicationInputSchema = z.object({
  name: z.string().describe('Borrower name'),
  amount: z.number().describe('Loan amount requested'),
  interestRate: z.number().describe('Interest rate (%)'),
  term: z.number().describe('Loan term in months'),
  loanDate: z.string().describe('Loan disbursement date'),
  address: z.string().describe('Borrower address'),
  historicalData: z.string().describe('Historical loan data for comparison.'),
});
export type VerifyLoanApplicationInput = z.infer<
  typeof VerifyLoanApplicationInputSchema
>;

const VerifyLoanApplicationOutputSchema = z.object({
  flags: z
    .array(z.string())
    .describe(
      'List of potential inconsistencies or missing information flags raised by the AI.'
    ),
  summary: z.string().describe('Summary of the verification process and findings.'),
});
export type VerifyLoanApplicationOutput = z.infer<
  typeof VerifyLoanApplicationOutputSchema
>;

export async function verifyLoanApplication(
  input: VerifyLoanApplicationInput
): Promise<VerifyLoanApplicationOutput> {
  return verifyLoanApplicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyLoanApplicationPrompt',
  input: {schema: VerifyLoanApplicationInputSchema},
  output: {schema: VerifyLoanApplicationOutputSchema},
  prompt: `You are an AI assistant specializing in verifying loan applications against historical data to identify potential fraud, inconsistencies, or missing information.

Analyze the following loan application data against the provided historical data and generate a list of flags indicating any potential issues and a summary of your findings.

Loan Application Data:
Name: {{{name}}}
Amount: {{{amount}}}
Interest Rate: {{{interestRate}}}
Term: {{{term}}} months
Loan Date: {{{loanDate}}}
Address: {{{address}}}

Historical Data: {{{historicalData}}}

Output a list of flags found and a summary.  If no issues are found, the flag list should be empty.

Consider flags for potentially fraudulent information, inconsistencies across data, or missing information.
`,
});

const verifyLoanApplicationFlow = ai.defineFlow(
  {
    name: 'verifyLoanApplicationFlow',
    inputSchema: VerifyLoanApplicationInputSchema,
    outputSchema: VerifyLoanApplicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
