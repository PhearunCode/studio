import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { type Loan, type Customer } from './types';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    console.warn('Firebase credentials not found in environment variables. Firebase features will be disabled. Please add FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL to your .env file.');
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  }
}

const db = getApps().length ? getFirestore() : null;

const connectionError = new Error(
  "Failed to connect to Firebase. This usually means the app's environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set correctly. Please check your .env file and ensure they are present and valid."
);

export const getLoans = async (): Promise<Omit<Loan, 'documents'>[]> => {
  if (!db) {
    throw connectionError;
  }
  try {
    const loansSnapshot = await db.collection('loans').orderBy('loanDate', 'desc').get();
    if (loansSnapshot.empty) {
      return [];
    }
    const loans = loansSnapshot.docs.map(doc => {
      const data = doc.data();
      const loanDate = data.loanDate;
      let serializableLoanDate: string;

      // Check if it's a Firestore Timestamp by checking for the toDate method
      if (loanDate && typeof loanDate.toDate === 'function') { 
        serializableLoanDate = loanDate.toDate().toISOString().split('T')[0]; // "YYYY-MM-DD"
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
        interestRate: data.interestRate || 0,
        loanDate: serializableLoanDate,
        address: data.address || '',
        status: data.status || 'Pending',
        verificationResult: verificationResult,
      };
    });
    return loans;
  } catch(error) {
    console.error("Error fetching loans:", error);
    // Return an empty array if there's an issue, e.g. permissions.
    return [];
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
    if (!db) {
        throw connectionError;
    }

    const customersSnapshot = await db.collection('customers').orderBy('name').get();
    const customers = customersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            address: data.address,
            phone: data.phone || '',
            totalLoans: 0,
            totalLoanAmount: 0,
        } as Customer;
    });
    
    if (customers.length === 0) {
        return [];
    }

    const customerMap = new Map(customers.map(c => [c.name, c]));
    const loans = await getLoans();

    loans.forEach(loan => {
        if (customerMap.has(loan.name)) {
            const customer = customerMap.get(loan.name)!;
            customer.totalLoans += 1;
            customer.totalLoanAmount += loan.amount;
        }
    });

    return Array.from(customerMap.values());
};

export const updateCustomer = async (id: string, data: { name: string; phone: string; address: string; }) => {
    if (!db) {
        throw connectionError;
    }
    const customerRef = db.collection('customers').doc(id);
    const oldCustomerSnapshot = await customerRef.get();
    const oldCustomerData = oldCustomerSnapshot.data();

    if (oldCustomerData?.name !== data.name) {
        const existingCustomer = await db.collection('customers').where('name', '==', data.name).limit(1).get();
        if (!existingCustomer.empty) {
            throw new Error('A customer with this name already exists.');
        }
    }

    await customerRef.update(data);

    if (oldCustomerData && oldCustomerData.name !== data.name) {
        const loansSnapshot = await db.collection('loans').where('name', '==', oldCustomerData.name).get();
        if (!loansSnapshot.empty) {
            const batch = db.batch();
            loansSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { name: data.name });
            });
            await batch.commit();
        }
    }
};

export const deleteCustomer = async (id: string) => {
    if (!db) {
        throw connectionError;
    }
    const customerRef = db.collection('customers').doc(id);
    const customerDoc = await customerRef.get();
    if (!customerDoc.exists) {
        return; 
    }
    const customerName = customerDoc.data()?.name;

    await customerRef.delete();
    
    if(customerName) {
        const loansQuery = db.collection('loans').where('name', '==', customerName);
        const loansSnapshot = await loansQuery.get();
        if (!loansSnapshot.empty) {
            const batch = db.batch();
            loansSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }
    }
};

export const addCustomer = async (customer: Omit<Customer, 'id' | 'totalLoans' | 'totalLoanAmount'>) => {
    if (!db) {
        throw connectionError;
    }
    const customerQuery = await db.collection('customers').where('name', '==', customer.name).limit(1).get();
    if (!customerQuery.empty) {
        throw new Error('A customer with this name already exists.');
    }
    await db.collection('customers').add(customer);
};

export const addLoan = async (loan: Omit<Loan, 'id' | 'status' | 'documents'>): Promise<Omit<Loan, 'documents'>> => {
  if (!db) {
    throw connectionError;
  }

  // Check if customer exists, if not create one
  const customerQuery = await db.collection('customers').where('name', '==', loan.name).limit(1).get();
  if (customerQuery.empty) {
      await db.collection('customers').add({ name: loan.name, address: loan.address, phone: '' });
  }

  const newDocRef = db.collection('loans').doc();
  const newId = newDocRef.id;

  const newLoan: Omit<Loan, 'id' | 'documents'> = {
    ...loan,
    status: 'Pending',
  };

  await newDocRef.set(newLoan);

  return { ...newLoan, id: newId };
};

export const updateLoanStatus = async (id: string, status: Loan['status']) => {
    if (!db) {
        throw connectionError;
    }
    const loanRef = db.collection('loans').doc(id);
    await loanRef.update({ status });
};

export const deleteLoan = async (id: string) => {
    if (!db) {
        throw connectionError;
    }
    const loanRef = db.collection('loans').doc(id);
    await loanRef.delete();
};
