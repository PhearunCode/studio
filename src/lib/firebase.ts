// This is a mock implementation of Firebase services.
// In a real application, you would use the Firebase SDK.
import { type Loan } from './types';

let mockLoans: Loan[] = [
  {
    id: '1',
    name: 'Juan dela Cruz',
    amount: 50000,
    interestRate: 5,
    loanDate: '2024-01-15',
    address: '123 Rizal Ave, Manila',
    documents: [{ name: 'id_1.png', url: 'https://placehold.co/600x400.png' }],
    status: 'Paid',
    verificationResult: { flags: [], summary: "Initial mock data. No verification performed." }
  },
  {
    id: '2',
    name: 'Maria Clara',
    amount: 120000,
    interestRate: 4.5,
    loanDate: '2024-02-20',
    address: '456 Bonifacio St, Cebu City',
    documents: [{ name: 'id_2.png', url: 'https://placehold.co/600x400.png' }],
    status: 'Approved',
    verificationResult: { flags: [], summary: "Initial mock data. No verification performed." }
  },
  {
    id: '3',
    name: 'Jose Rizal',
    amount: 75000,
    interestRate: 5.5,
    loanDate: '2024-03-10',
    address: '789 Mabini Blvd, Davao City',
    documents: [{ name: 'id_3.png', url: 'https://placehold.co/600x400.png' }],
    status: 'Pending',
    verificationResult: { flags: ["Address mismatch with historical data."], summary: "Potential address inconsistency found." }
  },
  {
    id: '4',
    name: 'Gabriela Silang',
    amount: 200000,
    interestRate: 4,
    loanDate: '2024-04-05',
    address: '101 Aguinaldo Highway, Cavite',
    documents: [{ name: 'id_4.png', url: 'https://placehold.co/600x400.png' }],
    status: 'Approved',
    verificationResult: { flags: [], summary: "Initial mock data. No verification performed." }
  },
];

export const getLoans = async (): Promise<Loan[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockLoans].sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime());
};

export const addLoan = async (loan: Omit<Loan, 'id' | 'status' | 'documents'> & { documents: { name: string; data: string }[] }): Promise<Loan> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newId = (mockLoans.length + 1).toString();

  const uploadedDocuments = loan.documents.map((doc, index) => ({
      name: doc.name,
      // In a real app, this would be a URL from Firebase Storage
      url: 'https://placehold.co/600x400.png' 
  }));

  const newLoan: Loan = {
    ...loan,
    id: newId,
    status: 'Pending',
    documents: uploadedDocuments,
  };

  mockLoans.unshift(newLoan);
  return newLoan;
};

// Mock Firebase Storage
export const uploadFile = async (file: { name: string; data: string }, path: string): Promise<{ name: string; url: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Mock uploading ${file.name} to ${path}`);
    // In a real app, this would return the actual download URL from Firebase Storage.
    return { name: file.name, url: 'https://placehold.co/600x400.png' };
};
