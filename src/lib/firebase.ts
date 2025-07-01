
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { type Loan, type Customer, type Payment, type Currency, customerSchema } from './types';
import { generatePaymentSchedule } from './utils';
import { z } from 'zod';

let db: admin.firestore.Firestore | null = null;
let firebaseAdminError: Error | null = null;

// Initialize Firebase Admin SDK only once.
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    const message = 'Firebase Admin credentials not found in environment variables. Firebase features will be disabled. Please check the "Firebase" page for setup instructions.';
    console.warn(message);
    firebaseAdminError = new Error(message);
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
            ...serviceAccount,
            privateKey: serviceAccount.privateKey.replace(/\\n/g, '\n'),
        }),
      });
      db = getFirestore();
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      const message = `Firebase admin initialization failed. This often happens if the FIREBASE_PRIVATE_KEY in your .env file is not formatted correctly. Please ensure it is the full key and wrapped in double quotes. Original error: ${error.message}`;
      console.error(message);
      firebaseAdminError = new Error(message);
    }
  }
} else {
  db = getFirestore();
}

export const isFirebaseConnected = () => !firebaseAdminError;

const checkDbConnection = () => {
    if (!isFirebaseConnected() || !db) {
        throw new Error(firebaseAdminError?.message || "Firebase is not connected. Please check your environment variables.");
    }
}

// Data fetching functions will now return empty arrays if not connected, to prevent page crashes.
export const getLoans = async (): Promise<Omit<Loan, 'documents'>[]> => {
  if (!isFirebaseConnected()) {
    return [];
  }
  
  try {
    const loansSnapshot = await db!.collection('loans').orderBy('loanDate', 'desc').get();
    if (loansSnapshot.empty) {
      return [];
    }
    const loans = loansSnapshot.docs.map(doc => {
      const data = doc.data();
      const loanDate = data.loanDate;
      let serializableLoanDate: string;

      if (loanDate && typeof loanDate.toDate === 'function') { 
        serializableLoanDate = loanDate.toDate().toISOString().split('T')[0];
      } else {
        serializableLoanDate = String(loanDate || '');
      }
      
      const verificationResult = data.verificationResult ? {
          flags: data.verificationResult.flags || [],
          summary: data.verificationResult.summary || ''
      } : null;

      return {
        id: doc.id,
        name: data.name || '',
        amount: data.amount || 0,
        currency: data.currency || 'KHR',
        interestRate: data.interestRate || 0,
        term: data.term || 0,
        loanDate: serializableLoanDate,
        address: data.address || '',
        status: data.status || 'Pending',
        verificationResult: verificationResult,
        payments: data.payments || [],
      };
    });
    return loans;
  } catch (error: any) {
    if (error.message.includes('DECODER') || error.message.includes('unsupported')) {
      const message = "Firebase connection failed due to a private key formatting issue. Please check the Firebase setup page for instructions on how to fix your .env file.";
      console.error(message);
      firebaseAdminError = new Error(message);
      return [];
    }
    console.error("Error fetching loans:", error);
    throw error;
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
    if (!isFirebaseConnected()) {
        return [];
    }

    try {
        const customersSnapshot = await db!.collection('customers').orderBy('name').get();
        const customers = customersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                address: data.address,
                phone: data.phone || '',
                idCardNumber: data.idCardNumber || '',
                telegramChatId: data.telegramChatId || '',
                facebookUrl: data.facebookUrl || '',
                avatar: data.avatar || '',
                totalLoans: 0,
                totalLoanAmountKhr: 0,
                totalLoanAmountUsd: 0,
            } as Customer;
        });
        
        if (customers.length === 0) {
            return [];
        }
        
        const customerMap = new Map(customers.map(c => [c.name, c]));
        const loans = await getLoans(); 

        loans.forEach(loan => {
            if (customerMap.has(loan.name) && (loan.status === 'Approved' || loan.status === 'Paid')) {
                const customer = customerMap.get(loan.name)!;
                customer.totalLoans += 1;
                if (loan.currency === 'KHR') {
                    customer.totalLoanAmountKhr += loan.amount;
                } else if (loan.currency === 'USD') {
                    customer.totalLoanAmountUsd += loan.amount;
                }
            }
        });

        return Array.from(customerMap.values());
    } catch (error: any) {
        if (error.message.includes('DECODER') || error.message.includes('unsupported')) {
            const message = "Firebase connection failed due to a private key formatting issue. Please check the Firebase setup page for instructions on how to fix your .env file.";
            console.error(message);
            firebaseAdminError = new Error(message);
            return [];
        }
        console.error("Error fetching customers:", error);
        throw error;
    }
};

// Data mutation functions will throw an error if not connected, so the user knows the action failed.
export const updateCustomer = async (id: string, data: z.infer<typeof customerSchema>) => {
    checkDbConnection();
    const customerRef = db!.collection('customers').doc(id);
    const oldCustomerSnapshot = await customerRef.get();
    const oldCustomerData = oldCustomerSnapshot.data();

    if (oldCustomerData?.name !== data.name) {
        const existingCustomer = await db!.collection('customers').where('name', '==', data.name).limit(1).get();
        if (!existingCustomer.empty) {
            throw new Error('A customer with this name already exists.');
        }
    }

    await customerRef.update(data);

    if (oldCustomerData && oldCustomerData.name !== data.name) {
        const loansSnapshot = await db!.collection('loans').where('name', '==', oldCustomerData.name).get();
        if (!loansSnapshot.empty) {
            const batch = db!.batch();
            loansSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { name: data.name });
            });
            await batch.commit();
        }
    }
};

export const deleteCustomer = async (id: string) => {
    checkDbConnection();
    const customerRef = db!.collection('customers').doc(id);
    const customerDoc = await customerRef.get();
    if (!customerDoc.exists) {
        return; 
    }
    const customerName = customerDoc.data()?.name;

    await customerRef.delete();
    
    if(customerName) {
        const loansQuery = db!.collection('loans').where('name', '==', customerName);
        const loansSnapshot = await loansQuery.get();
        if (!loansSnapshot.empty) {
            const batch = db!.batch();
            loansSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }
    }
};

export const addCustomer = async (customer: z.infer<typeof customerSchema>) => {
    checkDbConnection();
    const customerQuery = await db!.collection('customers').where('name', '==', customer.name).limit(1).get();
    if (!customerQuery.empty) {
        throw new Error('A customer with this name already exists.');
    }
    await db!.collection('customers').add(customer);
};

export const addLoan = async (loan: Omit<Loan, 'id' | 'status' | 'payments'>): Promise<Omit<Loan, 'id'>> => {
  checkDbConnection();
  const customerQuery = await db!.collection('customers').where('name', '==', loan.name).limit(1).get();
  if (customerQuery.empty) {
    throw new Error(`Customer "${loan.name}" not found. Please create the customer first.`);
  }

  const newDocRef = db!.collection('loans').doc();
  const newId = newDocRef.id;

  const newLoan: Omit<Loan, 'id'> = {
    ...loan,
    status: 'Pending',
    payments: []
  };

  await newDocRef.set(newLoan);

  return { ...newLoan, id: newId };
};

export const updateLoan = async (id: string, data: { amount: number; currency: Currency; interestRate: number; loanDate: string; term: number }) => {
    checkDbConnection();
    const loanRef = db!.collection('loans').doc(id);
    const loanDoc = await loanRef.get();
    if (!loanDoc.exists) {
        throw new Error('Loan not found to update.');
    }
    const loanData = loanDoc.data();

    const updates: any = { ...data };

    if (loanData?.status === 'Approved') {
        const schedule = generatePaymentSchedule(data.amount, data.interestRate, data.term, data.loanDate);
        updates.payments = schedule;
    }
    
    await loanRef.update(updates);
};

export const updateLoanStatus = async (id: string, status: Loan['status']) => {
    checkDbConnection();
    const loanRef = db!.collection('loans').doc(id);
    const loanDoc = await loanRef.get();
    if (!loanDoc.exists) {
        throw new Error('Loan not found to update status.');
    }
    const loanData = loanDoc.data() as Loan;

    const updates: { status: Loan['status'], payments?: Payment[] } = { status };

    if (status === 'Approved' && (!loanData.payments || loanData.payments.length === 0)) {
        const loanDate = typeof loanData.loanDate.toDate === 'function' 
            ? loanData.loanDate.toDate().toISOString().split('T')[0]
            : loanData.loanDate;
        const schedule = generatePaymentSchedule(loanData.amount, loanData.interestRate, loanData.term, loanDate);
        updates.payments = schedule;
    }
    
    await loanRef.update(updates);
};

export const deleteLoan = async (id: string) => {
    checkDbConnection();
    const loanRef = db!.collection('loans').doc(id);
    await loanRef.delete();
};


export const markPaymentAsPaid = async (loanId: string, month: number) => {
    checkDbConnection();
    const loanRef = db!.collection('loans').doc(loanId);
    const loanDoc = await loanRef.get();
    if (!loanDoc.exists) {
        throw new Error('Loan not found.');
    }

    const loanData = loanDoc.data() as Loan;
    const payments = loanData.payments || [];
    const paymentIndex = payments.findIndex(p => p.month === month);

    if (paymentIndex === -1) {
        throw new Error('Payment for the specified month not found.');
    }

    payments[paymentIndex].status = 'Paid';
    const allPaid = payments.every(p => p.status === 'Paid');
    const newStatus = allPaid ? 'Paid' : 'Approved';

    await loanRef.update({
        payments: payments,
        status: newStatus
    });
};

export const recordPrincipalPayment = async (loanId: string, paymentAmount: number) => {
    checkDbConnection();
    if (paymentAmount <= 0) {
        throw new Error('Payment amount must be positive.');
    }

    const loanRef = db!.collection('loans').doc(loanId);
    await db!.runTransaction(async (transaction) => {
        const loanDoc = await transaction.get(loanRef);
        if (!loanDoc.exists) {
            throw new Error('Loan not found.');
        }

        const loanData = loanDoc.data() as Loan;
        const currentPrincipal = loanData.amount;

        if (paymentAmount > currentPrincipal) {
            throw new Error('Payment amount cannot be greater than the remaining principal.');
        }
        
        const newPrincipal = currentPrincipal - paymentAmount;
        const newStatus = newPrincipal <= 0 ? 'Paid' : loanData.status;

        let newPayments = loanData.payments ?? [];
        if (newPrincipal > 0 && (loanData.status === 'Approved')) {
            const monthlyInterest = newPrincipal * (loanData.interestRate / 100);
            newPayments = newPayments.map(p => {
                if (p.status === 'Upcoming' || p.status === 'Overdue') {
                    const isFinalPayment = p.month === loanData.term;
                    const principalPayment = isFinalPayment ? newPrincipal : 0;
                    const totalPayment = monthlyInterest + principalPayment;

                    return {
                        ...p,
                        interestPayment: monthlyInterest,
                        principalPayment: principalPayment,
                        monthlyPayment: totalPayment,
                        remainingBalance: isFinalPayment ? 0 : newPrincipal,
                    };
                }
                return p;
            });
        }

        transaction.update(loanRef, {
            amount: newPrincipal,
            status: newStatus,
            payments: newPayments,
        });
    });
};

export const isUserAdmin = async (uid: string): Promise<boolean> => {
    checkDbConnection();
    try {
        const usersCollection = await db!.collection('users').limit(1).get();
        // If there are no users with the 'admin' role configured, allow any authenticated user.
        // This helps with initial setup. For production, it's strongly recommended to
        // create a 'users' collection and assign the 'admin' role to specific users.
        if (usersCollection.empty) {
            console.warn("No users found in 'users' collection. Granting admin access to all authenticated users. Please configure admin users in Firestore for production environments.");
            return true;
        }

        const userDoc = await db!.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            console.warn(`Admin check failed: User document not found for UID: ${uid}`);
            return false;
        }
        const userData = userDoc.data();
        return userData?.role === 'admin';
    } catch (error) {
        console.error(`Error checking admin status for UID: ${uid}`, error);
        return false;
    }
};
