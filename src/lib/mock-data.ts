import { type Loan, type Customer, type Payment } from '@/lib/types';
import { generatePaymentSchedule } from '@/lib/utils';


const mockLoansRaw: Omit<Loan, 'id' | 'payments'>[] = [
    {
        name: 'Maria Santos',
        amount: 50000,
        currency: 'USD',
        interestRate: 5.5,
        term: 36,
        loanDate: '2024-05-15',
        address: '123 Rizal St, Manila',
        status: 'Approved',
        verificationResult: {
            flags: [],
            summary: 'No issues found.'
        },
    },
    {
        name: 'Jose Rizal',
        amount: 2500000,
        currency: 'KHR',
        interestRate: 8,
        term: 24,
        loanDate: '2024-04-20',
        address: '456 Bonifacio Ave, Quezon City',
        status: 'Paid',
        verificationResult: {
            flags: ['High loan amount for new customer'],
            summary: 'Loan amount is higher than average for a first-time borrower.'
        },
    },
    {
        name: 'Andres Bonifacio',
        amount: 10000,
        currency: 'USD',
        interestRate: 7.2,
        term: 12,
        loanDate: '2024-03-01',
        address: '789 Mabini Rd, Cebu',
        status: 'Rejected',
        verificationResult: {
            flags: ['Inconsistent address', 'Missing ID information'],
            summary: 'Address provided does not match historical records and ID number is missing.'
        },
    },
    {
        name: 'Maria Santos',
        amount: 1500000,
        currency: 'KHR',
        interestRate: 9.5,
        term: 48,
        loanDate: '2024-06-01',
        address: '123 Rizal St, Manila',
        status: 'Pending',
        verificationResult: null,
    }
];

export const mockLoans: Loan[] = mockLoansRaw.map((loan, index) => {
    const loanWithId = {
        ...loan,
        id: `mock-loan-${index + 1}`,
        payments: loan.status === 'Approved' || loan.status === 'Paid' ? generatePaymentSchedule(loan.amount, loan.interestRate, loan.term, loan.loanDate) : []
    };
    if(loanWithId.status === 'Paid') {
        loanWithId.payments = loanWithId.payments?.map(p => ({...p, status: 'Paid'}));
    }
    return loanWithId;
});


export const mockCustomers: Customer[] = [
    {
        id: 'mock-customer-1',
        name: 'Maria Santos',
        address: '123 Rizal St, Manila',
        phone: '09171234567',
        idCardNumber: '1111-2222-3333',
        telegramChatId: '123456789',
        avatar: 'https://placehold.co/100x100.png',
        totalLoans: 0,
        totalLoanAmountKhr: 0,
        totalLoanAmountUsd: 0,
    },
    {
        id: 'mock-customer-2',
        name: 'Jose Rizal',
        address: '456 Bonifacio Ave, Quezon City',
        phone: '09209876543',
        idCardNumber: '4444-5555-6666',
        telegramChatId: '987654321',
        avatar: 'https://placehold.co/100x100.png',
        totalLoans: 0,
        totalLoanAmountKhr: 0,
        totalLoanAmountUsd: 0,
    },
    {
        id: 'mock-customer-3',
        name: 'Andres Bonifacio',
        address: '789 Mabini Rd, Cebu',
        phone: '09185558888',
        idCardNumber: '7777-8888-9999',
        telegramChatId: '',
        avatar: 'https://placehold.co/100x100.png',
        totalLoans: 0,
        totalLoanAmountKhr: 0,
        totalLoanAmountUsd: 0,
    }
];
